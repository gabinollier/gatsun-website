'use server';

import db from '@/lib/db';
import { DBEvent, DBEventException, FCEvent, FCEventData } from '@/lib/types/db';
import { notifyClients } from '@/lib/sse';

// Note : Il y a deux types d'ID pour les événements :
// - fcEvent.id : utilisé par FullCalendar côté client, est égal à `${dbId}R${startDate.toISOString()}`
// - fcEvent.extendedProps.db_id : l'ID dans la base de données, un entier auto-incrémenté.
// Les évènements récurrents utilisent le même fcEvent.extendedProps.db_id mais des fcEvent.id différents pour chaque occurrence.

function getFullCalendarId(dbId: number, startDate: Date): string {
  return `${dbId}R${startDate.toISOString()}`;
}

const MAX_EVENT_DURATION_MS = 24 * 60 * 60 * 1000;

function ensureValidEventWindow(startInput: Date, endInput: Date): void {
  const start = new Date(startInput);
  const end = new Date(endInput);

  if (end <= start) {
    throw new Error('L\'événement doit se terminer après son début.');
  }

  if (end.getTime() - start.getTime() > MAX_EVENT_DURATION_MS) {
    throw new Error('Un événement ne peut pas dépasser 24 heures.');
  }
}

export async function getEvents(rangeFrom: string, rangeTo: string): Promise<FCEvent[]> {
  console.debug('getEvents');
  try {
    const requestFrom = rangeFrom;
    const requestTo = rangeTo;

    const dbEventsResult = await db.query(
      'SELECT * FROM calendar_events WHERE ("start" < $1 AND "end" > $2 OR repeat_weekly = 1)',
      [requestTo, requestFrom]
    );
    const dbEvents = dbEventsResult.rows as DBEvent[];
    
    const dbEventsExceptionsResult = await db.query('SELECT * FROM calendar_event_exceptions');
    const dbEventsExceptions = dbEventsExceptionsResult.rows as DBEventException[];

    let fcEvents: FCEvent[] = [];

    for (const dbEvent of dbEvents) {
      if (dbEvent.repeat_weekly) {
        const eventStart = new Date(dbEvent.start);
        const eventEnd = new Date(dbEvent.end);
        const occurrenceStart = new Date(eventStart);
        const occurrenceEnd = new Date(eventEnd);
        while (occurrenceStart.toISOString() < requestTo) {
          if (occurrenceEnd.toISOString() > requestFrom) {
            fcEvents.push({
              id: getFullCalendarId(dbEvent.id, occurrenceStart),
              title: dbEvent.title,
              start: new Date(occurrenceStart),
              end: new Date(occurrenceEnd),
              extendedProps: {
                members: dbEvent.members,
                repeat_weekly: dbEvent.repeat_weekly,
                db_id: dbEvent.id,
              },
            });
          }
          occurrenceStart.setDate(occurrenceStart.getDate() + 7);
          occurrenceEnd.setDate(occurrenceEnd.getDate() + 7);
        }


        fcEvents = fcEvents.filter(fcEvent => {
          return dbEventsExceptions.find(ex => ex.event_id === fcEvent.extendedProps.db_id && ex.occurrence_date.getTime() === fcEvent.start.getTime()) === undefined;
        });

      } else {
        fcEvents.push({
          id: getFullCalendarId(dbEvent.id, new Date(dbEvent.start)),
          title: dbEvent.title,
          start: new Date(dbEvent.start),
          end: new Date(dbEvent.end),
          extendedProps: {
            members: dbEvent.members,
            repeat_weekly: dbEvent.repeat_weekly,
            db_id: dbEvent.id,
          },
        });
      }
    }

    return fcEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events');
  }
}

export async function createEvent(eventData: FCEventData, connectionId?: string): Promise<FCEvent> {
  console.debug('createEvent');
  ensureValidEventWindow(eventData.start, eventData.end);
  try {
    const { title, start, end, extendedProps } = eventData;
    const { members, repeat_weekly } = extendedProps;

    const result = await db.query(
      'INSERT INTO calendar_events (title, "start", "end", members, repeat_weekly) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [title, start, end, members, repeat_weekly]
    );
    const db_id = result.rows[0].id;

    const createdEvent: FCEvent = {
      id: getFullCalendarId(db_id, start),
      title,
      start,
      end,
      extendedProps: {
        members,
        repeat_weekly,
        db_id,
      },
    };

    notifyClients('update', { connectionId });

    return createdEvent;
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }
}

export async function updateSingleOccurrence(id: string, db_id: number, eventData: FCEventData, connectionId?: string): Promise<FCEvent> {
  console.debug('updateSingleOccurrence');
  ensureValidEventWindow(eventData.start, eventData.end);
  try {
    // On check si l'évènement est récurrent
    const dbEventResult = await db.query('SELECT * FROM calendar_events WHERE id = $1', [db_id]);
    const dbEvent = dbEventResult.rows[0] as DBEvent;

    let updatedEvent: FCEvent;

    if (dbEvent.repeat_weekly) {
      // Si oui, on supprime l'occurrence en ajoutant une exception
      await deleteSingleOccurrence(id, connectionId);
      // Puis on crée un nouvel évènement avec les nouvelles données
      eventData.id = undefined;
      eventData.extendedProps.db_id = undefined;
      eventData.extendedProps.repeat_weekly = 0;
      updatedEvent = await createEvent(eventData, connectionId);
    }
    else {
      // Sinon, on met à jour l'évènement directement
      const { title, start, end, extendedProps } = eventData;
      const { members, repeat_weekly } = extendedProps;
      await db.query(
        'UPDATE calendar_events SET title = $1, "start" = $2, "end" = $3, members = $4, repeat_weekly = $5 WHERE id = $6',
        [title, start, end, members, repeat_weekly, db_id]
      );
      eventData.id = id;
      eventData.extendedProps.db_id = db_id;
      updatedEvent = eventData as FCEvent;
    }

    notifyClients('update', { connectionId });

    return updatedEvent;
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event');
  }
}

export async function updateNonRecurringEvent(db_id: number, eventData: FCEventData, connectionId?: string): Promise<FCEvent> {
  console.debug('updateNonRecurringEvent');

  // simulate 2000ms delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  ensureValidEventWindow(eventData.start, eventData.end);
  try {
    const { title, start, end, extendedProps } = eventData;
    const { members, repeat_weekly } = extendedProps;
    await db.query(
      'UPDATE calendar_events SET title = $1, "start" = $2, "end" = $3, members = $4, repeat_weekly = $5 WHERE id = $6',
      [title, start, end, members, repeat_weekly, db_id]
    );
    notifyClients('update', { connectionId });

    return {
      id: getFullCalendarId(db_id, start),
      title,
      start,
      end,
      extendedProps: {
        members,
        repeat_weekly,
        db_id,
      },
    };
  } catch (error) {
    console.error('Error updating non-recurring event:', error);
    throw new Error('Failed to update non-recurring event');
  } 
}

export async function updateAllOccurrences(db_id: number, eventData: FCEventData, connectionId?: string): Promise<FCEvent> {
  console.debug('updateAllOccurrences');
  ensureValidEventWindow(eventData.start, eventData.end);
  try {
    const { title, start, end, extendedProps } = eventData;
    const { members, repeat_weekly } = extendedProps;
    await db.query(
      'UPDATE calendar_events SET title = $1, "start" = $2, "end" = $3, members = $4, repeat_weekly = $5 WHERE id = $6',
      [title, start, end, members, repeat_weekly, db_id]
    );

    // if the event was previously recurring, is still recurring, but the start date or end date changed,
    // we need to delete exceptions
    const dbEventResult = await db.query('SELECT * FROM calendar_events WHERE id = $1', [db_id]);
    const dbEvent = dbEventResult.rows[0] as DBEvent;

    if (dbEvent.repeat_weekly && repeat_weekly === 1 && (dbEvent.start.getTime() !== start.getTime() || dbEvent.end.getTime() !== end.getTime())) {
      await db.query('DELETE FROM calendar_event_exceptions WHERE event_id = $1', [db_id]);
    }

    // check if the event is now non-recurring, and if so, delete all its exceptions
    if (repeat_weekly === 0) {
      await db.query('DELETE FROM calendar_event_exceptions WHERE event_id = $1', [db_id]);
    }

    notifyClients('update', { connectionId });

    return {
      id: getFullCalendarId(db_id, start),
      title,
      start,
      end,
      extendedProps: {
        members,
        repeat_weekly,
        db_id,
      },
    };

  } catch (error) {
    console.error('Error updating all occurrences:', error);
    throw new Error('Failed to update all occurrences');
  }
}

export async function deleteAllOccurrences(db_id: number, connectionId?: string): Promise<void> {
  console.debug('deleteAllOccurrences');
  // Supprimer l'évènement principal comme si c'était un évènement non récurrent
  // Les exceptions associées seront supprimées en cascade via la contrainte SQL
  await deleteNonRecurringEvent(db_id, connectionId);
}

export async function deleteNonRecurringEvent(db_id: number, connectionId?: string): Promise<void> {
  console.debug('deleteNonRecurringEvent');
  try {
    await db.query('DELETE FROM calendar_events WHERE id = $1', [db_id]);
    notifyClients('update', { connectionId });
  } catch (error) {
    console.error('Error deleting non-recurring event:', error);
    throw new Error('Failed to delete non-recurring event');
  }
}

export async function deleteSingleOccurrence(id: string, connectionId?: string): Promise<void>{
  console.debug('deleteSingleOccurrence');
  // Ajouter une exception pour cette occurrence
  try {
    const [dbIdStr, occurrenceDateStr] = id.split('R');
    const dbId = Number(dbIdStr);
    await db.query(
      'INSERT INTO calendar_event_exceptions (event_id, occurrence_date) VALUES ($1, $2) ON CONFLICT (event_id, occurrence_date) DO NOTHING',
      [dbId, occurrenceDateStr]
    );

    notifyClients('update', { connectionId });
  } catch (error) {
    console.error('Error deleting single occurrence:', error);
    throw new Error('Failed to delete single occurrence');
  }
}


