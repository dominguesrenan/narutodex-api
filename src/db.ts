import 'dotenv/config';
import { Pool } from 'pg';
import { env } from './env.js';

// Usa as variáveis de ambiente do arquivo env.ts
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const res = await pool.query<T>(text, params);
  return res;
}

export async function healthcheck() {
  await query('SELECT 1');
}

// Exporta o pool para ser usado em outros lugares
export const db = {
  one: async <T = any>(text: string, params?: any[]): Promise<T> => {
    const result = await pool.query<T>(text, params);
    if (result.rows.length === 0) {
      throw new Error('No rows returned');
    }
    return result.rows[0];
  },
  oneOrNone: async <T = any>(text: string, params?: any[]): Promise<T | null> => {
    const result = await pool.query<T>(text, params);
    return result.rows[0] || null;
  },
  none: async (text: string, params?: any[]): Promise<void> => {
    await pool.query(text, params);
  },
  any: async <T = any>(text: string, params?: any[]): Promise<T[]> => {
    const result = await pool.query<T>(text, params);
    return result.rows;
  },
};
