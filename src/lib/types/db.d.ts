interface DBEventData {
  id?: number;
  title: string;
  start: Date;
  end: Date;
  members: string;
  repeat_weekly: number;
}

interface DBEvent extends DBEventData {
  id: number;
}

// Représente une exception à un événement récurrent, c'est à dire une occurence supprimée (qu'il ne faut donc pas afficher)
interface DBEventException {
  event_id: number;
  occurrence_date: Date;
}

// "fc" stands for "FullCalendar"

interface FCEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  extendedProps: {
    members: string;
    repeat_weekly: number;
    db_id: number;
  };
}

interface FCEventData {
  id?: string;
  title: string;
  start: Date;
  end: Date;    
  extendedProps: {
    members: string;
    repeat_weekly: number;
    db_id?: number;
  };
}

export { DBEvent, DBEventData, DBEventException, FCEvent, FCEventData };