import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config();
const sql = neon(process.env.DATABASE_URL);

async function main() {
  const result = await sql`SELECT * FROM study_sessions ORDER BY logged_at DESC LIMIT 5`;
  console.table(result);
}

main().catch(console.error);
