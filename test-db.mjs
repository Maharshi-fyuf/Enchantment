import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config();

const sql = neon(process.env.DATABASE_URL);
try {
  const result = await sql`SELECT 1 as ok`;
  console.log('DB OK:', result);
} catch (e) {
  console.error('DB FAIL:', e.message);
}
