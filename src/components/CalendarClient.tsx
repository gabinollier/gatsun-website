'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg, EventChangeArg } from '@fullcalendar/core';
import EventModal from './EventModal';
import RecurringEventDialog from './RecurringEventDialog';
import StopRecurringDialog from './StopRecurringDialog';
import CalendarEventContent from './CalendarEventContent';
import { FCEvent, FCEventData } from '@/lib/types/db';
import type { SSEPayload } from '@/lib/sse';
import { 
  getEvents, 
  createEvent, 
  updateSingleOccurrence, 
  updateNonRecurringEvent,
  updateAllOccurrences,
  deleteSingleOccurrence,
  deleteNonRecurringEvent,
  deleteAllOccurrences,
  replaceRecurringWithSingle
} from '@/actions/eventActions';

/*
  Explications :

  Ce composant utilise le composant FullCalendar de la librairie du même nom.
  Pour un performant, il charge d'abord les évènements de la semaine actuelle, des deux semaines précédentes et des deux semaines suivantes.
  Puis il rajoute des évènements au fur et à mesure que l'utilisateur navigue dans le calendrier pour toujours avoir deux semaines chargées
  avant et après la semaine affichée. Cela permet d'éviter les temps de chargement tout en limitant le nombre d'évènements chargés.
*/

const getWeekKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const buildEventId = (dbId: number, startDate: Date): string => {
  return `${dbId}R${startDate.toISOString()}`;
};

const MAX_EVENT_DURATION_MS = 24 * 60 * 60 * 1000;

const validateEventTiming = (start: Date, end: Date): string | null => {
  if (end <= start) {
    return 'La fin doit être après le début.';
  }

  if (end.getTime() - start.getTime() > MAX_EVENT_DURATION_MS) {
    return 'Un événement ne peut pas dépasser 24 heures.';
  }

  return null;
};

type CalendarClientProps = {
  onViewerCountChange?: (count: number) => void;
};

export default function CalendarClient({ onViewerCountChange }: CalendarClientProps) {
  const [events, setEvents] = useState<FCEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEvent, setSelectedEvent] = useState<FCEventData | null>(null);
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);
  const [recurringAction, setRecurringAction] = useState<'update' | 'delete' | null>(null);
  const [pendingEventData, setPendingEventData] = useState<FCEventData | null>(null);
  const [pendingOriginalEvent, setPendingOriginalEvent] = useState<FCEventData | null>(null);
  const [showStopRecurringDialog, setShowStopRecurringDialog] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const calendarRef = useRef<FullCalendar>(null);
  const loadedWeeks = useRef<Set<string>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);
  const connectionId = useRef(crypto.randomUUID());
  const activeMutations = useRef(0);
  const eventMutationTimestamps = useRef<Record<number, number>>({});

  const startMutation = useCallback(() => {
    activeMutations.current += 1;
    if (activeMutations.current === 1) setIsSyncing(true);
  }, []);

  const endMutation = useCallback(() => {
    activeMutations.current -= 1;
    if (activeMutations.current <= 0) {
      activeMutations.current = 0;
      setIsSyncing(false);
    }
  }, []);

  const isWeekLoaded = useCallback((weekStart: Date): boolean => {
    return loadedWeeks.current.has(getWeekKey(weekStart));
  }, []);

  const markWeekAsLoaded = useCallback((weekStart: Date) => {
    loadedWeeks.current.add(getWeekKey(weekStart));
  }, []);
  
  const clearLoadedWeeks = useCallback(() => {
    loadedWeeks.current.clear();
  }, []);

  const fetchFiveWeeksAround = useCallback(async (centerDate: Date, overwriteEverything: boolean): Promise<void> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    if (overwriteEverything) {
      clearLoadedWeeks();
    }

    try {
      if (overwriteEverything) {
        const rangeStart = new Date(centerDate);
        rangeStart.setDate(rangeStart.getDate() - (2 * 7));
        const rangeEnd = new Date(rangeStart);
        rangeEnd.setDate(rangeEnd.getDate() + (5 * 7));

        try {
          const newEvents = await getEvents(rangeStart.toISOString(), rangeEnd.toISOString());

          setEvents(newEvents);
          for (let i = -2; i <= 2; i++) {
            const weekStart = new Date(centerDate);
            weekStart.setDate(weekStart.getDate() + (i * 7));
            markWeekAsLoaded(weekStart);
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          console.error('Error fetching events:', error);
        }
        return;
      }

      for (let i = -2; i <= 2; i++) {
        if (abortController.signal.aborted) {
          return;
        }

        const weekStart = new Date(centerDate);
        weekStart.setDate(weekStart.getDate() + (i * 7));

        if (!isWeekLoaded(weekStart)) {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 7);

          try {
            const newEvents: FCEvent[] = await getEvents(weekStart.toISOString(), weekEnd.toISOString());

            // print new events start hours
            setEvents((previous) => {
              const filtered = previous.filter(event => {
                const eventStart = new Date(event.start);
                return eventStart < weekStart || eventStart >= weekEnd;
              });
              return [...filtered, ...newEvents];
            });
            markWeekAsLoaded(weekStart);
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              return;
            }
            console.error('Error fetching events:', error);
          }
        }
      }
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, [setEvents, isWeekLoaded, markWeekAsLoaded, clearLoadedWeeks]);

  const initialFetchEvents = useCallback(async () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const view = calendarApi.view;
      const currentWeekStart = new Date(view.currentStart);
      
      await fetchFiveWeeksAround(currentWeekStart, true);
    }
  }, [fetchFiveWeeksAround]);

  useEffect(() => {
    let cancelled = false;

    const runInitialFetch = async () => {
      try {
        await initialFetchEvents();
        if (!cancelled) {
          setIsInitialLoading(false);
        }
      } catch (error) {
        console.error('Error during initial fetch:', error);
        if (!cancelled) {
          setIsInitialLoading(false);
        }
      }
    };

    runInitialFetch();

    return () => {
      cancelled = true;
    };
  }, [initialFetchEvents]);

  useEffect(() => {
    const eventSource = new EventSource('/api/events/stream');

    eventSource.onmessage = async (event) => {
      try {
        const data: SSEPayload = JSON.parse(event.data);
        if (data.type === 'viewers' && typeof data.count === 'number') {
          onViewerCountChange?.(data.count);
          return;
        }
        if (data.type === 'update') {
          if (data.connectionId === connectionId.current) {
            return;
          }
          await initialFetchEvents();
        }
      } catch {
        if (event.data === 'update' || event.data === 'connected') {
          return;
        }
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [initialFetchEvents, onViewerCountChange]);

  const handleDatesSet = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const view = calendarApi.view;
      const currentWeekStart = new Date(view.currentStart);
      
      fetchFiveWeeksAround(currentWeekStart, false);
    }
  };


  const handleDrag = (dateSelectArg: DateSelectArg) => {
    setSelectedEvent(
      {
        title: '',
        start: dateSelectArg.start,
        end: dateSelectArg.end,
        extendedProps: {
          members: '',
          repeat_weekly: 0
        },
      }
    );

    const calendarApi = dateSelectArg.view.calendar;
    calendarApi.unselect();
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleCreateEvent = async (newEvent: FCEventData) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    startMutation();

    try {
      const createdEvent: FCEvent = await createEvent(newEvent, connectionId.current);

      setEvents((previous) => [...previous, createdEvent]);

      if (newEvent.extendedProps.repeat_weekly) {
        await initialFetchEvents();
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Erreur lors de la création de l\'événement');
      throw error;
    } finally {
      endMutation();
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo.event as unknown as FCEventData);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleUpdateSingleOccurrence = async (updatedEvent: FCEventData): Promise<void> => {
    if (!updatedEvent.id || !updatedEvent.extendedProps.db_id) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const dbId = updatedEvent.extendedProps.db_id;
    const mutationTime = Date.now();
    eventMutationTimestamps.current[dbId] = mutationTime;
    startMutation();

    

    try {
      const updatedEventFromServer = await updateSingleOccurrence(
        updatedEvent.id, 
        updatedEvent.extendedProps.db_id, 
        updatedEvent,
        connectionId.current
      );
      
      if (eventMutationTimestamps.current[dbId] !== mutationTime) return;

      const originalEvent = events.find((event) => event.id === updatedEvent.id);
      if (updatedEventFromServer.extendedProps.repeat_weekly != originalEvent?.extendedProps.repeat_weekly) {
        await initialFetchEvents();
        return;
      }

      setEvents((previous) => {
        const filtered = previous.filter(event => event.id !== updatedEvent.id);
        return [...filtered, updatedEventFromServer];
      });
    } catch (error) {
      if (eventMutationTimestamps.current[dbId] !== mutationTime) return;
      console.error('Error updating single occurrence:', error);
      alert('Erreur lors de la mise à jour de l\'occurrence');
      throw error;
    } finally {
      endMutation();
    }
  };

  const handleUpdateAllOccurrences = async (updatedEvent: FCEventData, originalEvent: FCEventData | null): Promise<void> => {
    if (!updatedEvent.extendedProps.db_id) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const dbId = updatedEvent.extendedProps.db_id;
    const mutationTime = Date.now();
    eventMutationTimestamps.current[dbId] = mutationTime;
    startMutation();

    try {
      const updatedEventFromServer = await updateAllOccurrences(updatedEvent.extendedProps.db_id, updatedEvent, connectionId.current);
      
      if (eventMutationTimestamps.current[dbId] !== mutationTime) return;

      // Si l'événement est devenu récurrent, refetch tout pour avoir les occurrences
      if (updatedEventFromServer.extendedProps.repeat_weekly != originalEvent?.extendedProps.repeat_weekly) {
        await initialFetchEvents();
        return;
      }

      const referenceStart = originalEvent?.start ?? updatedEvent.start;
      const referenceEnd = originalEvent?.end ?? updatedEvent.end;
      const startDelta = updatedEvent.start.getTime() - referenceStart.getTime();
      const endDelta = updatedEvent.end.getTime() - referenceEnd.getTime();

      setEvents((previous) => previous.map((event) => {
        if (event.extendedProps.db_id !== dbId) {
          return event;
        }

        const nextStart = new Date(event.start.getTime() + startDelta);
        const nextEnd = new Date(event.end.getTime() + endDelta);

        return {
          ...event,
          id: buildEventId(dbId, nextStart),
          title: updatedEventFromServer.title,
          start: nextStart,
          end: nextEnd,
          extendedProps: {
            ...event.extendedProps,
            members: updatedEventFromServer.extendedProps.members,
            repeat_weekly: updatedEventFromServer.extendedProps.repeat_weekly,
          },
        };
      }));
    } catch (error) {
      if (eventMutationTimestamps.current[dbId] !== mutationTime) return;
      console.error('Error updating all occurrences:', error);
      alert('Erreur lors de la mise à jour de toutes les occurrences');
      throw error;
    } finally {
      endMutation();
    }
  };

  const handleUpdateNonRecurringEvent = async (updatedEvent: FCEventData): Promise<void> => {
    if (!updatedEvent.extendedProps.db_id) return;

    const originalEvent = events.find((event) => event.id === updatedEvent.id);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const dbId = updatedEvent.extendedProps.db_id;
    const mutationTime = Date.now();
    eventMutationTimestamps.current[dbId] = mutationTime;
    startMutation();

    try {
      const updatedEventFromServer = await updateNonRecurringEvent(updatedEvent.extendedProps.db_id, updatedEvent, connectionId.current);
      
      if (eventMutationTimestamps.current[dbId] !== mutationTime) return;

      if (updatedEventFromServer.extendedProps.repeat_weekly != originalEvent?.extendedProps.repeat_weekly) {
        await initialFetchEvents();
        return;
      }

      const nextEvent: FCEvent = {
        id: buildEventId(dbId, updatedEventFromServer.start),
        title: updatedEventFromServer.title,
        start: new Date(updatedEventFromServer.start),
        end: new Date(updatedEventFromServer.end),
        extendedProps: {
          ...updatedEventFromServer.extendedProps,
          db_id: dbId,
        },
      };

      setEvents((previous) => previous.map((event) => {
        if (event.extendedProps.db_id !== dbId) {
          return event;
        }
        return nextEvent;
      }));
    } catch (error) {
      if (eventMutationTimestamps.current[dbId] !== mutationTime) return;
      console.error('Error updating non-recurring event:', error);
      alert('Erreur lors de la mise à jour de l\'événement');
      throw error;
    } finally {
      endMutation();
    }
  };

  const handleDeleteSingleOccurrence = async () => {
    if (!selectedEvent?.id || !selectedEvent.extendedProps.db_id) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const dbId = selectedEvent.extendedProps.db_id;
    const mutationTime = Date.now();
    eventMutationTimestamps.current[dbId] = mutationTime;
    startMutation();

    try {
      await deleteSingleOccurrence(selectedEvent.id, connectionId.current);
      
      if (eventMutationTimestamps.current[dbId] !== mutationTime) return;

      const eventId = selectedEvent.id;
      setEvents((previous) => previous.filter(event => event.id !== eventId));
    } catch (error) {
      if (eventMutationTimestamps.current[dbId] !== mutationTime) return;
      console.error('Error deleting single occurrence:', error);
      alert('Erreur lors de la suppression de l\'occurrence');
      throw error;
    } finally {
      endMutation();
    }
  };

  const handleDeleteAllOccurrences = async () => {
    if (!selectedEvent?.extendedProps.db_id) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const dbId = selectedEvent.extendedProps.db_id;
    const mutationTime = Date.now();
    eventMutationTimestamps.current[dbId] = mutationTime;
    startMutation();

    try {
      await deleteAllOccurrences(selectedEvent.extendedProps.db_id, connectionId.current);
      
      if (eventMutationTimestamps.current[dbId] !== mutationTime) return;

      setEvents((previous) => previous.filter(event => event.extendedProps.db_id !== dbId));
    } catch (error) {
      if (eventMutationTimestamps.current[dbId] !== mutationTime) return;
      console.error('Error deleting all occurrences:', error);
      alert('Erreur lors de la suppression de toutes les occurrences');
      throw error;
    } finally {
      endMutation();
    }
  };

  const handleDeleteNonRecurringEvent = async () => {
    if (!selectedEvent?.extendedProps.db_id) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const dbId = selectedEvent.extendedProps.db_id;
    const mutationTime = Date.now();
    eventMutationTimestamps.current[dbId] = mutationTime;
    startMutation();

    try {
      await deleteNonRecurringEvent(selectedEvent.extendedProps.db_id, connectionId.current);
      
      if (eventMutationTimestamps.current[dbId] !== mutationTime) return;

      setEvents((previous) => previous.filter(event => event.extendedProps.db_id !== dbId));
    } catch (error) {
      if (eventMutationTimestamps.current[dbId] !== mutationTime) return;
      console.error('Error deleting non-recurring event:', error);
      alert('Erreur lors de la suppression de l\'événement');
      throw error;
    } finally {
      endMutation();
    }
  };

  const handleEventDrag = async (changeInfo: EventChangeArg) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (!changeInfo.event.start || !changeInfo.event.end || !changeInfo.event.extendedProps.members || !changeInfo.event.extendedProps.db_id) {
      changeInfo.revert();
      return;
    }

    const timingError = validateEventTiming(changeInfo.event.start, changeInfo.event.end);
    if (timingError) {
      alert(timingError);
      changeInfo.revert();
      return;
    }

    const updatedEvent: FCEventData = {
      id: changeInfo.event.id,
      title: changeInfo.event.title,
      start: new Date(changeInfo.event.start),
      end: new Date(changeInfo.event.end),
      extendedProps: {
        members: changeInfo.event.extendedProps.members,
        repeat_weekly: changeInfo.event.extendedProps.repeat_weekly,
        db_id: changeInfo.event.extendedProps.db_id,
      },
    };

    if (changeInfo.event.extendedProps.repeat_weekly) {
      const originalEvent = changeInfo.oldEvent?.start && changeInfo.oldEvent?.end
        ? {
            id: changeInfo.oldEvent.id,
            title: changeInfo.oldEvent.title,
            start: new Date(changeInfo.oldEvent.start),
            end: new Date(changeInfo.oldEvent.end),
            extendedProps: {
              members: changeInfo.oldEvent.extendedProps.members,
              repeat_weekly: changeInfo.oldEvent.extendedProps.repeat_weekly,
              db_id: changeInfo.oldEvent.extendedProps.db_id,
            },
          }
        : null;

      setPendingEventData(updatedEvent);
      setPendingOriginalEvent(originalEvent);
      setRecurringAction('update');
      setShowRecurringDialog(true);
      changeInfo.revert();
      return;
    }

    const dbId = changeInfo.event.extendedProps.db_id;
    const mutationTime = Date.now();
    eventMutationTimestamps.current[dbId] = mutationTime;
    startMutation();

    try {
      const updatedEventFromServer = await updateNonRecurringEvent(changeInfo.event.extendedProps.db_id, updatedEvent, connectionId.current);
      
      if (eventMutationTimestamps.current[dbId] !== mutationTime) return;

      const nextEvent: FCEvent = {
        id: buildEventId(dbId, updatedEventFromServer.start),
        title: updatedEventFromServer.title,
        start: new Date(updatedEventFromServer.start),
        end: new Date(updatedEventFromServer.end),
        extendedProps: {
          ...updatedEventFromServer.extendedProps,
          db_id: dbId,
        },
      };

      setEvents((previous) => previous.map((event) => {
        if (event.extendedProps.db_id !== dbId) {
          return event;
        }
        return nextEvent;
      }));
    } catch (error) {
      if (eventMutationTimestamps.current[dbId] !== mutationTime) return;
      console.error('Error updating event:', error);
      alert('Erreur lors de la mise à jour de l\'événement');
      changeInfo.revert();
    } finally {
      endMutation();
    }
  };

  const handleSave = async (event: FCEventData) => {
    if (modalMode === 'create') {
      await handleCreateEvent(event);
    } else {
      if (!selectedEvent?.id || !selectedEvent.extendedProps.db_id) return;
      
      event.id = selectedEvent.id;
      event.extendedProps.db_id = selectedEvent.extendedProps.db_id;

      if (selectedEvent.extendedProps.repeat_weekly && event.extendedProps.repeat_weekly === 0) {
        const originalStart = getOriginalOccurrenceStart(selectedEvent);
        const isInitialOccurrence = originalStart && selectedEvent.start.getTime() === originalStart.getTime();
        
        if (isInitialOccurrence) {
          event.extendedProps.repeat_weekly = 0;
          await handleReplaceRecurringWithSingle(event);
          setIsModalOpen(false);
        } else {
          setPendingEventData(event);
          setPendingOriginalEvent(selectedEvent);
          setShowStopRecurringDialog(true);
        }
      } else if (selectedEvent.extendedProps.repeat_weekly) {
        setPendingEventData(event);
        setPendingOriginalEvent(selectedEvent);
        setRecurringAction('update');
        setShowRecurringDialog(true);
      } else {
        const timingError = validateEventTiming(event.start, event.end);
        if (timingError) {
          alert(timingError);
          return;
        }
        await handleUpdateNonRecurringEvent(event);
        setIsModalOpen(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent?.id || !selectedEvent.extendedProps.db_id) return;

    if (selectedEvent.extendedProps.repeat_weekly) {
      setRecurringAction('delete');
      setShowRecurringDialog(true);
    } else {
      await handleDeleteNonRecurringEvent();
      setIsModalOpen(false);
    }
  };

  const handleRecurringDialogChoice = async (choice: 'single' | 'all') => {
    setShowRecurringDialog(false);

    try {
      if (recurringAction === 'update' && pendingEventData) {
        if (choice === 'single') {
          await handleUpdateSingleOccurrence(pendingEventData);
        } else {
          await handleUpdateAllOccurrences(pendingEventData, pendingOriginalEvent || selectedEvent);
        }
        setIsModalOpen(false);
      } else if (recurringAction === 'delete') {
        if (choice === 'single') {
          await handleDeleteSingleOccurrence();
        } else {
          await handleDeleteAllOccurrences();
        }
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error handling recurring action:', error);
    } finally {
      setPendingEventData(null);
      setRecurringAction(null);
      setPendingOriginalEvent(null);
    }
  };

  const closeRecurringDialog = () => {
    setShowRecurringDialog(false);
    setPendingEventData(null);
    setRecurringAction(null);
    setPendingOriginalEvent(null);
  };

  const getOriginalOccurrenceStart = (event: FCEventData): Date | null => {
    if (!event.extendedProps.db_id) return null;
    const originalEvent = events.find(
      (e) => e.extendedProps.db_id === event.extendedProps.db_id
    );
    if (!originalEvent) return null;
    const allOccurrences = events.filter(
      (e) => e.extendedProps.db_id === event.extendedProps.db_id
    );
    const sorted = allOccurrences.sort((a, b) => a.start.getTime() - b.start.getTime());
    return sorted.length > 0 ? sorted[0].start : null;
  };

  const handleReplaceRecurringWithSingle = async (eventData: FCEventData): Promise<void> => {
    if (!eventData.extendedProps.db_id) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const dbId = eventData.extendedProps.db_id;
    const mutationTime = Date.now();
    eventMutationTimestamps.current[dbId] = mutationTime;
    startMutation();

    try {
      await replaceRecurringWithSingle(dbId, eventData, connectionId.current);
      
      if (eventMutationTimestamps.current[dbId] !== mutationTime) return;

      await initialFetchEvents();
    } catch (error) {
      if (eventMutationTimestamps.current[dbId] !== mutationTime) return;
      console.error('Error replacing recurring with single:', error);
      alert('Erreur lors du remplacement de l\'événement');
      throw error;
    } finally {
      endMutation();
    }
  };

  const handleStopRecurringDialogChoice = async (choice: 'this' | 'initial') => {
    setShowStopRecurringDialog(false);

    try {
      if (pendingEventData && pendingOriginalEvent?.extendedProps.db_id) {
        let eventToCreate: FCEventData;
        
        if (choice === 'this') {
          eventToCreate = { ...pendingEventData };
        } else {
          const originalStart = getOriginalOccurrenceStart(pendingOriginalEvent);
          if (!originalStart) return;
          
          const originalDbEvent = events.find(
            (e) => e.extendedProps.db_id === pendingOriginalEvent.extendedProps.db_id && 
                   e.start.getTime() === originalStart.getTime()
          );
          if (!originalDbEvent) return;
          
          const newDuration = pendingEventData.end.getTime() - pendingEventData.start.getTime();
          
          eventToCreate = {
            ...pendingEventData,
            start: originalStart,
            end: new Date(originalStart.getTime() + newDuration),
          };
        }
        
        eventToCreate.extendedProps.repeat_weekly = 0;
        
        await handleReplaceRecurringWithSingle(eventToCreate);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error handling stop recurring action:', error);
    } finally {
      setPendingEventData(null);
      setPendingOriginalEvent(null);
    }
  };

  const closeStopRecurringDialog = () => {
    setShowStopRecurringDialog(false);
    setPendingEventData(null);
    setPendingOriginalEvent(null);
  };

  const localNow = (): number => {
    const now = new Date();
    const localOffset = now.getTimezoneOffset(); // Paris is UTC+2 (120 minutes)
    return now.getTime() - (localOffset * 60 * 1000);
  };

  return (
    <>
      <div className={`${isSyncing ? "opacity-100 duration-0" : "opacity-0 duration-300"} transition-opacity  fixed bottom-6 right-6 z-[70] flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/90 text-white text-sm shadow-2xl border border-slate-100/20`}>
        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span>Sauvegarde…</span>
      </div>

      {isInitialLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="h-12 w-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className={`bg-slate-900 motion-opacity-in-100- md:rounded-lg md:shadow-2xl md:shadow-black/50 md:p-6 md:border md:border-slate-100/10 h-full w-full transition-opacity duration-500 ${isInitialLoading ? 'opacity-50 pointer-events-none select-none' : 'opacity-100'}`}>
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev today',
            center: 'title',
            right: 'next'
          }}
          buttonText={{
            today: "Aujourd'hui"
          }}
          locale="fr"
          editable={true}
          selectable={true}
          selectMirror={true}
          weekends={true}
          firstDay={1}
          slotMinTime='08:00:00'
          slotMaxTime="32:00:00"
          timeZone="false"
          now={localNow()}
          nowIndicator={true}
          nowIndicatorClassNames={"animate-pulse drop-shadow-sm drop-shadow-red-950"}
          allDaySlot={false}
          events={events}
          select={handleDrag}
          eventClick={handleEventClick}
          eventChange={handleEventDrag}
          eventLongPressDelay={500} // to drag an event
          selectLongPressDelay={300} // to create an event
          datesSet={handleDatesSet}
          contentHeight="auto"
          expandRows={true}
          eventContent={(arg) => <CalendarEventContent arg={arg} />}
        />
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        baseEvent={selectedEvent || { title: '', start: new Date(), end: new Date(), extendedProps: { members: '', repeat_weekly: 0 } }}
        mode={modalMode}
      />

      <RecurringEventDialog
        isOpen={showRecurringDialog}
        onClose={closeRecurringDialog}
        onChoice={handleRecurringDialogChoice}
        action={recurringAction}
      />

      <StopRecurringDialog
        isOpen={showStopRecurringDialog}
        onClose={closeStopRecurringDialog}
        onChoice={handleStopRecurringDialogChoice}
      />
    </>
  );
}
