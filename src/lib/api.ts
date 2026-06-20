/**
 * src/lib/api.ts
 * ─────────────────────────────────────────────────────────────────
 * Typed fetch wrapper — the ONLY way the client talks to the backend.
 * No direct DB imports. No connection strings. Just fetch('/api/...').
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface Exercise {
  id: string;
  slug: string;
  name: string;
  day_type: 'push' | 'pull' | 'legs';
  target_sets: number;
  target_reps: string;
  notes: string;
  is_main_lift: boolean;
  sort_order: number;
}

export interface TodayResponse {
  day_type: 'push' | 'pull' | 'legs' | 'rest';
  exercises: Exercise[];
  active_session: WorkoutSession | null;
}

export interface WorkoutSession {
  id: string;
  day_type: 'push' | 'pull' | 'legs';
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  sets?: SetLog[];
}

export interface SetLog {
  id: string;
  session_id?: string;
  exercise_id?: string;
  exercise_slug?: string;
  exercise_name?: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  rpe: number | null;
  created_at?: string;
}

export interface StudyDay {
  day_number: number;
  pillar: number;
  title: string;
  description: string;
  completed_at: string | null;
}

export interface StudySession {
  id: string;
  day_number: number;
  pillar: number;
  duration_minutes: number;
  notes: string | null;
  logged_at: string;
}

export interface E1rmDataPoint {
  date: string;
  e1rm: number;
}

export interface StudyHoursDataPoint {
  period: string;
  pillar: number;
  total_minutes: number;
}

export interface MainLift {
  id: string;
  slug: string;
  name: string;
  day_type: string;
}

// ── API Error ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error ?? `Request failed: ${res.status}`, body.details);
  }

  return res.json();
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKOUT API
// ═══════════════════════════════════════════════════════════════════════════

/** Fixed weekly rotation: Mon/Thu=pull, Tue/Fri=push, Wed/Sat=legs, Sun=rest */
export function getLocalDayType(): 'pull' | 'push' | 'legs' | 'rest' {
  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const map: Record<number, 'pull' | 'push' | 'legs' | 'rest'> = {
    0: 'rest', // Sunday
    1: 'pull', // Monday
    2: 'push', // Tuesday
    3: 'legs', // Wednesday
    4: 'pull', // Thursday
    5: 'push', // Friday
    6: 'legs', // Saturday
  };
  return map[dayOfWeek];
}

/** Get today's workout day type and exercise list */
export function getToday(): Promise<TodayResponse> {
  const dayType = getLocalDayType();
  return request(`/api/today?day_type=${dayType}`);
}

/** Start a new workout session */
export function startSession(dayType: string, notes?: string): Promise<WorkoutSession> {
  return request('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({ day_type: dayType, notes: notes ?? null }),
  });
}

/** Mark a session as completed */
export function completeSession(sessionId: string): Promise<WorkoutSession> {
  return request(`/api/sessions/${sessionId}`, { method: 'PATCH' });
}

/** Log a single set */
export function logSet(
  sessionId: string,
  data: { exercise_id: string; set_number: number; weight_kg: number; reps: number; rpe?: number | null }
): Promise<SetLog> {
  return request(`/api/sessions/${sessionId}/sets`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Delete a logged set */
export function deleteSet(setId: string): Promise<{ deleted: boolean }> {
  return request(`/api/sets/${setId}`, { method: 'DELETE' });
}

/** Get e1RM history for a specific exercise */
export function getExerciseHistory(slug: string): Promise<{ slug: string; data: E1rmDataPoint[] }> {
  return request(`/api/exercises/${slug}/history`);
}

/** Get recent completed workout sessions */
export function getRecentSessions(limit = 10): Promise<WorkoutSession[]> {
  return request(`/api/sessions/recent?limit=${limit}`);
}

/** Get all main lifts (for the chart picker) */
export function getMainLifts(): Promise<MainLift[]> {
  return request('/api/exercises/main-lifts');
}

// ═══════════════════════════════════════════════════════════════════════════
// STUDY API
// ═══════════════════════════════════════════════════════════════════════════

/** Get all 30 study days with completion state */
export function getStudyDays(): Promise<StudyDay[]> {
  return request('/api/study/days');
}

/** Toggle completion of a study day */
export function toggleStudyDay(dayNumber: number): Promise<StudyDay> {
  return request(`/api/study/days/${dayNumber}`, { method: 'PATCH' });
}

/** Log a study session */
export function logStudySession(data: {
  day_number: number;
  pillar: number;
  duration_minutes: number;
  notes?: string | null;
}): Promise<StudySession> {
  return request('/api/study/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Get study hours time series */
export function getStudyHours(group: 'day' | 'week' = 'day'): Promise<StudyHoursDataPoint[]> {
  return request(`/api/study/hours?group=${group}`);
}
