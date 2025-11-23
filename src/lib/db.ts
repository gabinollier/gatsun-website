import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        "start" TIMESTAMPTZ NOT NULL, -- ISO 8601 format
        "end" TIMESTAMPTZ NOT NULL, -- ISO 8601 format
        members TEXT NOT NULL,
        repeat_weekly INTEGER NOT NULL DEFAULT 0
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS calendar_event_exceptions (
        event_id INTEGER NOT NULL,
        occurrence_date TIMESTAMPTZ NOT NULL, -- Date of the affected occurrence (ISO 8601 format)
        CONSTRAINT pk_event_exception PRIMARY KEY (event_id, occurrence_date),
        FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_start ON calendar_events("start");
      CREATE INDEX IF NOT EXISTS idx_events_end ON calendar_events("end");
      CREATE INDEX IF NOT EXISTS idx_events_repeat ON calendar_events(repeat_weekly);

      CREATE INDEX IF NOT EXISTS idx_exceptions_event_id ON calendar_event_exceptions(event_id);
    `);
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
};

initDb();

export default pool;