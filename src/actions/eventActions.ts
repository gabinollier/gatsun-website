'use server';

import db from '@/lib/db';
import { DBEvent, DBEventException, FCEvent, FCEventData } from '@/lib/types/db';
import { RunResult } from 'better-sqlite3';
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

    const dbEvents = db.prepare('SELECT * FROM calendar_events WHERE (start < ? AND end > ? OR repeat_weekly = 1)').all(requestTo, requestFrom) as DBEvent[];
    const dbEventsExceptions = db.prepare('SELECT * FROM calendar_event_exceptions').all() as DBEventException[];

    let fcEvents: FCEvent[] = [];

    for (const dbEvent of dbEvents) {
      if (dbEvent.repeat_weekly) {
        const eventStart = new Date(dbEvent.start);
        const eventEnd = new Date(dbEvent.end);
        let occurrenceStart = new Date(eventStart);
        let occurrenceEnd = new Date(eventEnd);
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
          return dbEventsExceptions.find(ex => ex.event_id === fcEvent.extendedProps.db_id && ex.occurrence_date === fcEvent.start.toISOString()) === undefined;
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

export async function createEvent(eventData: FCEventData): Promise<FCEvent> {
  console.debug('createEvent');
  ensureValidEventWindow(eventData.start, eventData.end);
  try {
    const { title, start, end, extendedProps } = eventData;
    const { members, repeat_weekly } = extendedProps;

    const stmt = db.prepare('INSERT INTO calendar_events (title, start, end, members, repeat_weekly) VALUES (?, ?, ?, ?, ?)');
    const runResult: RunResult = stmt.run(title, start.toISOString(), end.toISOString(), members, repeat_weekly);
    const db_id = Number(runResult.lastInsertRowid);

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

    notifyClients('update');

    return createdEvent;
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }
}

export async function updateSingleOccurrence(id: string, db_id: number, eventData: FCEventData): Promise<FCEvent> {
  console.debug('updateSingleOccurrence');
  ensureValidEventWindow(eventData.start, eventData.end);
  try {
    // On check si l'évènement est récurrent
    const dbEvent = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(db_id) as DBEvent;

    var updatedEvent: FCEvent;

    if (dbEvent.repeat_weekly) {
      // Si oui, on supprime l'occurrence en ajoutant une exception
      await deleteSingleOccurrence(id);
      // Puis on crée un nouvel évènement avec les nouvelles données
      eventData.id = undefined;
      eventData.extendedProps.db_id = undefined;
      eventData.extendedProps.repeat_weekly = 0;
      updatedEvent = await createEvent(eventData);
    }
    else {
      // Sinon, on met à jour l'évènement directement
      const { title, start, end, extendedProps } = eventData;
      const { members, repeat_weekly } = extendedProps;
      const stmt = db.prepare('UPDATE calendar_events SET title = ?, start = ?, end = ?, members = ?, repeat_weekly = ? WHERE id = ?');
      stmt.run(title, start.toISOString(), end.toISOString(), members, repeat_weekly, db_id);
      eventData.id = id;
      eventData.extendedProps.db_id = db_id;
      updatedEvent = eventData as FCEvent;
    }

    notifyClients('update');

    return updatedEvent;
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event');
  }
}

export async function updateNonRecurringEvent(db_id: number, eventData: FCEventData): Promise<void> {
  console.debug('updateNonRecurringEvent');
  ensureValidEventWindow(eventData.start, eventData.end);
  try {
    const { title, start, end, extendedProps } = eventData;
    const { members, repeat_weekly } = extendedProps;
    const stmt = db.prepare('UPDATE calendar_events SET title = ?, start = ?, end = ?, members = ?, repeat_weekly = ? WHERE id = ?');
    stmt.run(title, start.toISOString(), end.toISOString(), members, repeat_weekly, db_id);
    notifyClients('update');
  } catch (error) {
    console.error('Error updating non-recurring event:', error);
    throw new Error('Failed to update non-recurring event');
  } 
}

export async function updateAllOccurrences(db_id: number, eventData: FCEventData): Promise<void> {
  console.debug('updateAllOccurrences');
  ensureValidEventWindow(eventData.start, eventData.end);
  try {
    const { title, start, end, extendedProps } = eventData;
    const { members, repeat_weekly } = extendedProps;
    const stmt = db.prepare('UPDATE calendar_events SET title = ?, start = ?, end = ?, members = ?, repeat_weekly = ? WHERE id = ?');
    stmt.run(title, start.toISOString(), end.toISOString(), members, repeat_weekly, db_id);

    // if the event was previously recurring, is still recurring, but the start date or end date changed,
    // we need to delete exceptions
    const dbEvent = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(db_id) as DBEvent;
    if (dbEvent.repeat_weekly && repeat_weekly === 1 && (dbEvent.start !== start.toISOString() || dbEvent.end !== end.toISOString())) {
      const deleteExceptionsStmt = db.prepare('DELETE FROM calendar_event_exceptions WHERE event_id = ?');
      deleteExceptionsStmt.run(db_id);
    }

    // check if the event is now non-recurring, and if so, delete all its exceptions
    if (repeat_weekly === 0) {
      const deleteExceptionsStmt = db.prepare('DELETE FROM calendar_event_exceptions WHERE event_id = ?');
      deleteExceptionsStmt.run(db_id);
    }

    notifyClients('update');

  } catch (error) {
    console.error('Error updating all occurrences:', error);
    throw new Error('Failed to update all occurrences');
  }
}

export async function deleteAllOccurrences(db_id: number): Promise<void> {
  console.debug('deleteAllOccurrences');
  // Supprimer l'évènement principal comme si c'était un évènement non récurrent
  // Les exceptions associées seront supprimées en cascade via la contrainte SQL
  deleteNonRecurringEvent(db_id);
}

export async function deleteNonRecurringEvent(db_id: number): Promise<void> {
  console.debug('deleteNonRecurringEvent');
  try {
    const stmt = db.prepare('DELETE FROM calendar_events WHERE id = ?');
    stmt.run(db_id);
    notifyClients('update');
  } catch (error) {
    console.error('Error deleting non-recurring event:', error);
    throw new Error('Failed to delete non-recurring event');
  }
}

export async function deleteSingleOccurrence(id: string): Promise<void>{
  console.debug('deleteSingleOccurrence');
  // Ajouter une exception pour cette occurrence
  try {
    const [dbIdStr, occurrenceDateStr] = id.split('R');
    const dbId = Number(dbIdStr);
    const stmt = db.prepare('INSERT OR IGNORE INTO calendar_event_exceptions (event_id, occurrence_date) VALUES (?, ?)');
    stmt.run(dbId, occurrenceDateStr);

    notifyClients('update');
  } catch (error) {
    console.error('Error deleting single occurrence:', error);
    throw new Error('Failed to delete single occurrence');
  }
}


