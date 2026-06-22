/**
 * api/index.ts
 * ─────────────────────────────────────────────────────────────────
 * Single Hono router handling all /api/* requests.
 * Deployed as a Vercel Serverless Function.
 * This is the ONLY file that reads DATABASE_URL.
 */

import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { neon, types } from '@neondatabase/serverless';
import { z } from 'zod';

// ── DB connection (lazy – avoids crash at module load if env var is missing) ─

// Global type parsers to ensure NUMERIC (1700) and BIGINT (20) return as numbers
types.setTypeParser(1700, (val) => parseFloat(val));
types.setTypeParser(20, (val) => parseInt(val, 10));

let _sql: ReturnType<typeof neon> | null = null;

function sql(strings: TemplateStringsArray, ...values: any[]) {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        'DATABASE_URL environment variable is not set. ' +
        'Add it in Vercel Dashboard → Settings → Environment Variables.'
      );
    }
    _sql = neon(url);
  }
  return _sql(strings, ...values);
}

// ── Hono app ───────────────────────────────────────────────────────────────

const app = new Hono().basePath('/api');

// ── Helpers ────────────────────────────────────────────────────────────────

// (Helpers specific to backend removed - local day is computed on the client)

/** Epley formula: e1RM = weight * (1 + reps / 30) */
function estimatedOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 100) / 100;
}

// ── Zod schemas ────────────────────────────────────────────────────────────

const logSetSchema = z.object({
  exercise_id: z.string().uuid(),
  set_number: z.number().int().positive(),
  weight_kg: z.number().nonnegative(),
  reps: z.number().int().nonnegative(),
  rpe: z.number().min(1).max(10).optional().nullable(),
});

const startSessionSchema = z.object({
  day_type: z.enum(['push', 'pull', 'legs']),
  notes: z.string().optional().nullable(),
});

const logStudySessionSchema = z.object({
  day_number: z.number().int().min(1).max(30),
  pillar: z.number().int().min(1).max(4),
  duration_minutes: z.number().int().positive(),
  notes: z.string().optional().nullable(),
});

const createReminderSchema = z.object({
  title: z.string().min(1).max(200),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  due_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().nullable(),
  notes: z.string().optional().nullable(),
});

// ═══════════════════════════════════════════════════════════════════════════
// WORKOUT ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

const dayTypeSchema = z.enum(['push', 'pull', 'legs', 'rest']);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD

/**
 * GET /api/today
 * Returns today's day_type and exercise list based on the client's local day_type.
 * Query param ?day_type=push|pull|legs|rest is required.
 * Query param ?date=YYYY-MM-DD is required for proper active session resolution.
 */
app.get('/today', async (c) => {
  const parsed = dayTypeSchema.safeParse(c.req.query('day_type'));
  const parsedDate = dateSchema.safeParse(c.req.query('date'));

  if (!parsed.success) {
    return c.json({ error: 'Missing or invalid day_type query parameter', details: parsed.error.flatten() }, 400);
  }
  if (!parsedDate.success) {
    return c.json({ error: 'Missing or invalid date query parameter (YYYY-MM-DD required)', details: parsedDate.error.flatten() }, 400);
  }

  const dayType = parsed.data;
  const localDate = parsedDate.data;

  if (dayType === 'rest') {
    return c.json({ day_type: 'rest', exercises: [], active_session: null });
  }

  const exercises = await sql`
    SELECT id, slug, name, day_type, target_sets, target_reps, notes, is_main_lift, sort_order
    FROM exercises
    WHERE day_type = ${dayType}
    ORDER BY sort_order ASC
  `;

  // Check if there's an active (incomplete) session for today (using Asia/Kolkata timezone mapping)
  const activeSessions = await sql`
    SELECT ws.*, 
      COALESCE(
        json_agg(
          json_build_object(
            'id', sl.id,
            'exercise_id', sl.exercise_id,
            'set_number', sl.set_number,
            'weight_kg', sl.weight_kg,
            'reps', sl.reps,
            'rpe', sl.rpe
          ) ORDER BY sl.created_at ASC
        ) FILTER (WHERE sl.id IS NOT NULL),
        '[]'::json
      ) AS sets
    FROM workout_sessions ws
    LEFT JOIN set_logs sl ON sl.session_id = ws.id
    WHERE ws.day_type = ${dayType} 
      AND ws.completed_at IS NULL
      AND (ws.started_at AT TIME ZONE 'Asia/Kolkata')::date = ${localDate}
    GROUP BY ws.id
    ORDER BY ws.started_at DESC
    LIMIT 1
  `;

  return c.json({ 
    day_type: dayType, 
    exercises,
    active_session: activeSessions.length > 0 ? activeSessions[0] : null
  });
});

/**
 * POST /api/sessions
 * Start a new workout session.
 */
app.post('/sessions', async (c) => {
  const body = await c.req.json();
  const parsed = startSessionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }

  const { day_type, notes } = parsed.data;

  const result = await sql`
    INSERT INTO workout_sessions (day_type, notes)
    VALUES (${day_type}, ${notes ?? null})
    RETURNING *
  `;

  return c.json(result[0], 201);
});

/**
 * PATCH /api/sessions/:id
 * Mark session completed.
 */
app.patch('/sessions/:id', async (c) => {
  const id = c.req.param('id');

  const result = await sql`
    UPDATE workout_sessions
    SET completed_at = now()
    WHERE id = ${id}
    RETURNING *
  `;

  if (result.length === 0) {
    return c.json({ error: 'Session not found' }, 404);
  }

  return c.json(result[0]);
});

/**
 * POST /api/sessions/:id/sets
 * Log a single set within a session.
 */
app.post('/sessions/:id/sets', async (c) => {
  const sessionId = c.req.param('id');
  const body = await c.req.json();
  const parsed = logSetSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }

  const { exercise_id, set_number, weight_kg, reps, rpe } = parsed.data;

  // Verify the session exists
  const session = await sql`SELECT id FROM workout_sessions WHERE id = ${sessionId}`;
  if (session.length === 0) {
    return c.json({ error: 'Session not found' }, 404);
  }

  const result = await sql`
    INSERT INTO set_logs (session_id, exercise_id, set_number, weight_kg, reps, rpe)
    VALUES (${sessionId}, ${exercise_id}, ${set_number}, ${weight_kg}, ${reps}, ${rpe ?? null})
    RETURNING *
  `;

  return c.json(result[0], 201);
});

/**
 * DELETE /api/sets/:id
 * Delete a logged set (for swipe-to-delete).
 */
app.delete('/sets/:id', async (c) => {
  const id = c.req.param('id');

  const result = await sql`
    DELETE FROM set_logs WHERE id = ${id} RETURNING id
  `;

  if (result.length === 0) {
    return c.json({ error: 'Set not found' }, 404);
  }

  return c.json({ deleted: true });
});

/**
 * GET /api/exercises/:slug/history
 * Returns e1RM time series for the progress chart.
 * Groups by session date, takes max e1RM per session.
 */
app.get('/exercises/:slug/history', async (c) => {
  const slug = c.req.param('slug');

  const rows = await sql`
    SELECT
      (ws.started_at AT TIME ZONE 'Asia/Kolkata')::date::text AS date,
      MAX(sl.weight_kg * (1 + sl.reps::decimal / 30)) AS e1rm
    FROM set_logs sl
    JOIN exercises e ON sl.exercise_id = e.id
    JOIN workout_sessions ws ON sl.session_id = ws.id
    WHERE e.slug = ${slug}
      AND sl.weight_kg > 0
      AND sl.reps > 0
    GROUP BY (ws.started_at AT TIME ZONE 'Asia/Kolkata')::date
    ORDER BY (ws.started_at AT TIME ZONE 'Asia/Kolkata')::date ASC
  `;

  return c.json({
    slug,
    data: rows.map((r: any) => ({
      date: r.date,
      e1rm: Math.round(parseFloat(r.e1rm) * 100) / 100,
    })),
  });
});

/**
 * GET /api/sessions/recent
 * Returns the last N completed workout sessions with their sets.
 */
app.get('/sessions/recent', async (c) => {
  const limit = parseInt(c.req.query('limit') ?? '10');

  const sessions = await sql`
    SELECT
      ws.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', sl.id,
            'exercise_slug', e.slug,
            'exercise_name', e.name,
            'set_number', sl.set_number,
            'weight_kg', sl.weight_kg,
            'reps', sl.reps,
            'rpe', sl.rpe
          ) ORDER BY e.sort_order, sl.set_number
        ) FILTER (WHERE sl.id IS NOT NULL),
        '[]'::json
      ) AS sets
    FROM workout_sessions ws
    LEFT JOIN set_logs sl ON sl.session_id = ws.id
    LEFT JOIN exercises e ON sl.exercise_id = e.id
    WHERE ws.completed_at IS NOT NULL
    GROUP BY ws.id
    ORDER BY ws.started_at DESC
    LIMIT ${limit}
  `;

  return c.json(sessions);
});

/**
 * GET /api/exercises/main-lifts
 * Returns all exercises marked as main lifts (for the chart picker).
 */
app.get('/exercises/main-lifts', async (c) => {
  const lifts = await sql`
    SELECT id, slug, name, day_type
    FROM exercises
    WHERE is_main_lift = true
    ORDER BY day_type, sort_order
  `;

  return c.json(lifts);
});

// ═══════════════════════════════════════════════════════════════════════════
// STUDY ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/study/days
 * All 30 days with pillar + completed state.
 */
app.get('/study/days', async (c) => {
  const days = await sql`
    SELECT day_number, pillar, title, description, completed_at
    FROM study_days
    ORDER BY day_number ASC
  `;

  return c.json(days);
});

/**
 * PATCH /api/study/days/:dayNumber
 * Toggle completion of a study day.
 */
app.patch('/study/days/:dayNumber', async (c) => {
  const dayNumber = parseInt(c.req.param('dayNumber'));

  if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 30) {
    return c.json({ error: 'Invalid day number' }, 400);
  }

  // Check current state and toggle
  const current = await sql`
    SELECT completed_at FROM study_days WHERE day_number = ${dayNumber}
  `;

  if (current.length === 0) {
    return c.json({ error: 'Day not found' }, 404);
  }

  const isCompleted = current[0].completed_at !== null;

  const result = await sql`
    UPDATE study_days
    SET completed_at = ${isCompleted ? null : new Date().toISOString()}
    WHERE day_number = ${dayNumber}
    RETURNING *
  `;

  return c.json(result[0]);
});

/**
 * POST /api/study/sessions
 * Log a study session (duration in minutes).
 */
app.post('/study/sessions', async (c) => {
  const body = await c.req.json();
  const parsed = logStudySessionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }

  const { day_number, pillar, duration_minutes, notes } = parsed.data;

  const result = await sql`
    INSERT INTO study_sessions (day_number, pillar, duration_minutes, notes)
    VALUES (${day_number}, ${pillar}, ${duration_minutes}, ${notes ?? null})
    RETURNING *
  `;

  return c.json(result[0], 201);
});

/**
 * GET /api/study/hours
 * Time series of study minutes, groupable by day/week and by pillar.
 */
app.get('/study/hours', async (c) => {
  const groupBy = c.req.query('group') ?? 'day'; // 'day' | 'week'

  let rows;
  if (groupBy === 'week') {
    rows = await sql`
      SELECT
        date_trunc('week', logged_at AT TIME ZONE 'Asia/Kolkata')::date::text AS period,
        pillar,
        SUM(duration_minutes) AS total_minutes
      FROM study_sessions
      GROUP BY period, pillar
      ORDER BY period ASC
    `;
  } else {
    rows = await sql`
      SELECT
        (logged_at AT TIME ZONE 'Asia/Kolkata')::date::text AS period,
        pillar,
        SUM(duration_minutes) AS total_minutes
      FROM study_sessions
      GROUP BY period, pillar
      ORDER BY period ASC
    `;
  }

  return c.json(rows);
});

/**
 * GET /api/study/sessions/recent
 * Returns the last N study sessions joined with their day title.
 * Raw ISO timestamps — no TZ casting, frontend formats with Intl.DateTimeFormat.
 */
app.get('/study/sessions/recent', async (c) => {
  const limit = parseInt(c.req.query('limit') ?? '20');

  const rows = await sql`
    SELECT
      ss.id,
      ss.day_number,
      sd.title AS day_title,
      ss.pillar,
      ss.duration_minutes,
      ss.notes,
      ss.logged_at
    FROM study_sessions ss
    LEFT JOIN study_days sd ON ss.day_number = sd.day_number
    ORDER BY ss.logged_at DESC
    LIMIT ${limit}
  `;

  return c.json(rows);
});

// ═══════════════════════════════════════════════════════════════════════════
// REMINDER ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/reminders
 * Create a new reminder.
 */
app.post('/reminders', async (c) => {
  const body = await c.req.json();
  const parsed = createReminderSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }

  const { title, due_date, due_time, notes } = parsed.data;

  const result = await sql`
    INSERT INTO reminders (title, due_date, due_time, notes)
    VALUES (${title}, ${due_date}, ${due_time ?? null}, ${notes ?? null})
    RETURNING *
  `;

  return c.json(result[0], 201);
});

/**
 * GET /api/reminders/upcoming
 * List incomplete reminders, ordered by due_date then due_time.
 */
app.get('/reminders/upcoming', async (c) => {
  const rows = await sql`
    SELECT *
    FROM reminders
    WHERE completed_at IS NULL
    ORDER BY due_date ASC, due_time ASC NULLS LAST
  `;

  return c.json(rows);
});

/**
 * PATCH /api/reminders/:id/complete
 * Toggle completed_at (null → now(), non-null → null).
 */
app.patch('/reminders/:id/complete', async (c) => {
  const id = c.req.param('id');

  const current = await sql`
    SELECT completed_at FROM reminders WHERE id = ${id}
  `;

  if (current.length === 0) {
    return c.json({ error: 'Reminder not found' }, 404);
  }

  const isCompleted = current[0].completed_at !== null;

  const result = await sql`
    UPDATE reminders
    SET completed_at = ${isCompleted ? null : new Date().toISOString()}
    WHERE id = ${id}
    RETURNING *
  `;

  return c.json(result[0]);
});

/**
 * DELETE /api/reminders/:id
 * Permanently delete a reminder.
 */
app.delete('/reminders/:id', async (c) => {
  const id = c.req.param('id');

  const result = await sql`
    DELETE FROM reminders WHERE id = ${id} RETURNING id
  `;

  if (result.length === 0) {
    return c.json({ error: 'Reminder not found' }, 404);
  }

  return c.json({ deleted: true });
});

// ── Health check ───────────────────────────────────────────────────────────

app.get('/health', async (c) => {
  try {
    const result = await sql`SELECT 1 as ok`;
    return c.json({ status: 'ok', db: result[0].ok === 1 });
  } catch (err: any) {
    return c.json({
      status: 'error',
      message: err.message || 'Database connection failed',
    }, 500);
  }
});

// ── Export for Vercel ──────────────────────────────────────────────────────

export default handle(app);
export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

// Export raw app for local test script
export const honoApp = app;
