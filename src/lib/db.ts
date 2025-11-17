import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';


function init(): Database.Database {
  // take env variable in prod and relative path in dev
  const isProd = process.env.NODE_ENV === 'production';
  const dbPath =  isProd ? process.env.DATABASE_URL!.replace('file:', '') : './app-data/gatsun-website-dev.db';
  const dbDir = path.dirname(dbPath);
  
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  const db = new Database(dbPath);
  
  try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      start TEXT NOT NULL, -- ISO 8601 format
      end TEXT NOT NULL, -- ISO 8601 format
      members TEXT NOT NULL,
      repeat_weekly INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS calendar_event_exceptions (
      event_id INTEGER NOT NULL,
      occurrence_date TEXT NOT NULL, -- Date of the affected occurrence (ISO 8601 format)
      CONSTRAINT pk_event_exception PRIMARY KEY (event_id, occurrence_date),
      FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_events_start ON calendar_events(start);
    CREATE INDEX IF NOT EXISTS idx_events_end ON calendar_events(end);
    CREATE INDEX IF NOT EXISTS idx_events_repeat ON calendar_events(repeat_weekly);

    CREATE INDEX IF NOT EXISTS idx_exceptions_event_id ON calendar_event_exceptions(event_id);
  `);
  } catch (error) {
    console.error('Error initializing database:', error);
  }

  return db;
}

const db = init();

export default db;