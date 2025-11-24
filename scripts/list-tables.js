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

async function listSchema() {
  const client = await pool.connect();
  try {
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    if (tablesRes.rows.length === 0) {
      console.log('No tables found in public schema.');
      return;
    }

    for (const { table_name } of tablesRes.rows) {
      console.log(`\n=== ${table_name} ===`);

      const columnsRes = await client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table_name]);

      console.table(columnsRes.rows);
    }
  } catch (error) {
    console.error('Error listing schema:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

listSchema();
