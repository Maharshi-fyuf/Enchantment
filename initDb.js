import { neon } from '@neondatabase/serverless';

const sql = neon("postgresql://neondb_owner:npg_6zRDUHinrl9u@ep-winter-fog-ahq5jl09-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

async function init() {
  console.log('Initializing database schema...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS activities (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(20) NOT NULL CHECK (type IN ('run', 'lift')),
          distance DECIMAL(5,2),
          pace VARCHAR(10),
          workout_focus VARCHAR(50),
          total_volume INT,
          duration VARCHAR(20),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Insert a dummy user so we can insert activities
    await sql`
      INSERT INTO users (id, username, email)
      VALUES ('00000000-0000-0000-0000-000000000000', 'alex_demo', 'alex@example.com')
      ON CONFLICT (id) DO NOTHING;
    `;

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

init();
