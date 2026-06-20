import { neon } from '@neondatabase/serverless';

// Retrieve the connection string from Vite's environment variables.
const sql = neon(import.meta.env.VITE_DATABASE_URL);

export default sql;
