const { Pool } = require('pg');
const readline = require('readline');

// Load env vars from .env file if available (Node 20.6+ supports --env-file flag, otherwise use dotenv)
// Usage: node --env-file=.env scripts/reset-db.js
// Or if you have dotenv installed: require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  console.error('Usage: node --env-file=.env scripts/reset-db.js');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function resetDb() {
  const client = await pool.connect();
  try {
    console.log('Dropping tables...');
    await client.query('DROP TABLE IF EXISTS calendar_event_exceptions CASCADE');
    await client.query('DROP TABLE IF EXISTS calendar_events CASCADE');
    console.log('Tables dropped successfully.');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

rl.question('⚠️  WARNING: This will DROP ALL TABLES in the database. Are you sure? (y/N) ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    resetDb();
  } else {
    console.log('Operation cancelled.');
    pool.end();
  }
  rl.close();
});
