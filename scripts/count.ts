import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const result = await sql`SELECT count(*) FROM exercises`;
  console.log(`Total exercises in DB: ${result[0].count}`);
}

main().catch(console.error);
