import { Pool } from 'pg';

const host = process.env.PGHOST || 'db';
const port = Number(process.env.PGPORT || 5432);
const database = process.env.PGDATABASE || 'narutodex';
const user = process.env.PGUSER || 'postgres';
const password = process.env.PGPASSWORD || 'postgres';

const timeoutMs = 30_000; // 30s
const intervalMs = 500;

async function waitForDb() {
  const start = Date.now();
  const pool = new Pool({ host, port, database, user, password });
  while (true) {
    try {
      await pool.query('SELECT 1');
      await pool.end();
      console.log('✅ Database is ready');
      return;
    } catch (e) {
      if (Date.now() - start > timeoutMs) {
        console.error('❌ Database did not become ready in time:', e);
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
}

waitForDb();
