import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });
dotenv.config({ quiet: true });

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL nao definida. Configure a connection string PostgreSQL do Supabase no arquivo HackthonGuarulhos/.env.',
  );
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function checkDatabaseConnection() {
  const result = await query('select current_database() as database, current_user as user, now() as now');
  console.log('[database] conectado ao PostgreSQL:', result.rows[0]);
  return result.rows[0];
}

export async function closeDatabase() {
  await pool.end();
}

export default {
  pool,
  query,
  checkDatabaseConnection,
  closeDatabase,
};
