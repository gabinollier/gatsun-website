const { Pool } = require('pg');

// Load env vars from .env file if available
// Usage: node --env-file=.env scripts/list-tables.js

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  console.error('Usage: node --env-file=.env scripts/list-tables.js');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function listTables() {
  const client = await pool.connect();
  try {
    console.log('Listing tables...');
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    if (res.rows.length === 0) {
      console.log('No tables found in public schema.');
    } else {
      console.table(res.rows);
    }
  } catch (error) {
    console.error('Error listing tables:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

listTables();
