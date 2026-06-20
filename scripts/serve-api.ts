import { serve } from '@hono/node-server';
import { honoApp } from '../api/index.js';
import { config } from 'dotenv';

config(); // Load .env for DATABASE_URL

const port = 3000;
console.log(`🚀 Local Hono API server starting on http://localhost:${port}`);

serve({
  fetch: honoApp.fetch,
  port
});
