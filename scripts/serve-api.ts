import { serve } from '@hono/node-server';
import { honoApp } from '../api/index.js';

const port = 3000;
console.log(`🚀 Local Hono API server starting on http://localhost:${port}`);

serve({
  fetch: honoApp.fetch,
  port
});
