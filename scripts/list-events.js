const { Pool } = require('pg');

// Load env vars from .env file if available
// Usage: node --env-file=.env scripts/list-events.js

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  console.error('Usage: node --env-file=.env scripts/list-events.js');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function listEvents() {
  const client = await pool.connect();
  try {
    // Calculer le début et la fin de la semaine courante (lundi à dimanche)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    console.log('=== Configuration ===');
    console.log('Week start:', weekStart.toISOString());
    console.log('Week end:', weekEnd.toISOString());
    console.log('');

    // Afficher la timezone du serveur PostgreSQL
    const tzRes = await client.query('SHOW timezone;');
    console.log('=== PostgreSQL Timezone ===');
    console.log('Server timezone:', tzRes.rows[0].TimeZone);
    console.log('');

    // Lister tous les événements (récurrents ou dans la semaine)
    console.log('=== Events in DB ===');
    const eventsRes = await client.query(`
      SELECT 
        id,
        title,
        "start",
        "end",
        members,
        repeat_weekly
      FROM calendar_events 
      WHERE (
        ("start" < $1 AND "end" > $2)
        OR repeat_weekly = 1
      )
      ORDER BY "start";
    `, [weekEnd.toISOString(), weekStart.toISOString()]);

    if (eventsRes.rows.length === 0) {
      console.log('No events found for this week.');
    } else {
      eventsRes.rows.forEach((row, i) => {
        console.log(`\n--- Event ${i + 1} ---`);
        console.log('ID:', row.id);
        console.log('Title:', row.title);
        console.log('Members:', row.members);
        console.log('Repeat weekly:', row.repeat_weekly);
        console.log('Start (raw from DB):', row.start);
        console.log('End (raw from DB):', row.end);
      });
    }

    // Lister les exceptions
    console.log('\n\n=== Event Exceptions ===');
    const exceptionsRes = await client.query(`
      SELECT * FROM calendar_event_exceptions ORDER BY event_id, occurrence_date;
    `);

    if (exceptionsRes.rows.length === 0) {
      console.log('No exceptions found.');
    } else {
      console.table(exceptionsRes.rows);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

listEvents();
