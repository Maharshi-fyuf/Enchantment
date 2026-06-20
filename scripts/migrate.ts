/**
 * scripts/migrate.ts
 * Run with: npm run migrate (uses tsx)
 * 
 * Creates all tables for the Enchantment v2 schema.
 * Safe to run multiple times — uses IF NOT EXISTS.
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config(); // load .env

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrate() {
  console.log('🔄 Running migration...\n');

  // Exercise catalog
  await sql`
    CREATE TABLE IF NOT EXISTS exercises (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      day_type VARCHAR(10) NOT NULL CHECK (day_type IN ('push','pull','legs')),
      target_sets INT NOT NULL,
      target_reps VARCHAR(20) NOT NULL,
      notes TEXT,
      is_main_lift BOOLEAN DEFAULT FALSE,
      sort_order INT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  console.log('  ✓ exercises');

  // Workout sessions
  await sql`
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      day_type VARCHAR(10) NOT NULL CHECK (day_type IN ('push','pull','legs')),
      started_at TIMESTAMPTZ DEFAULT now(),
      completed_at TIMESTAMPTZ,
      notes TEXT
    )
  `;
  console.log('  ✓ workout_sessions');

  // Set logs
  await sql`
    CREATE TABLE IF NOT EXISTS set_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
      exercise_id UUID REFERENCES exercises(id),
      set_number INT NOT NULL,
      weight_kg DECIMAL(6,2),
      reps INT,
      rpe DECIMAL(3,1),
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  console.log('  ✓ set_logs');

  // Study days
  await sql`
    CREATE TABLE IF NOT EXISTS study_days (
      day_number INT PRIMARY KEY,
      pillar INT NOT NULL CHECK (pillar BETWEEN 1 AND 4),
      title VARCHAR(150) NOT NULL,
      description TEXT,
      completed_at TIMESTAMPTZ
    )
  `;
  console.log('  ✓ study_days');

  // Study sessions
  await sql`
    CREATE TABLE IF NOT EXISTS study_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      day_number INT REFERENCES study_days(day_number),
      pillar INT NOT NULL,
      duration_minutes INT NOT NULL,
      notes TEXT,
      logged_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  console.log('  ✓ study_sessions');

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_set_logs_exercise ON set_logs(exercise_id, created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(logged_at)`;
  console.log('  ✓ indexes');

  console.log('\n✅ Migration complete.');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
