import { useState, useEffect } from 'react';
import {
  getRecentSessions,
  getRecentStudySessions,
  type WorkoutSession,
  type StudySessionLog,
} from '../lib/api';

// ── Pillar colours — raw hex, same as Progress.tsx ────────────────────────
const PILLAR_COLORS: Record<number, string> = {
  1: '#14b8a6',
  2: '#8b5cf6',
  3: '#f59e0b',
  4: '#f97316',
};

const PILLAR_LABELS: Record<number, string> = {
  1: 'OS & Linux',
  2: 'Networking',
  3: 'Programming',
  4: 'Security',
};

// ── Day-type accent colours use existing CSS custom properties ────────────
const DAY_TYPE_COLORS: Record<string, string> = {
  pull: 'var(--color-pull, #38bdf8)',
  push: 'var(--color-push, #fb923c)',
  legs: 'var(--color-legs, #4ade80)',
};

const DAY_TYPE_LABELS: Record<string, string> = {
  pull: 'PULL',
  push: 'PUSH',
  legs: 'LEGS',
};

// ── Unified feed entry ────────────────────────────────────────────────────
type WorkoutEntry = { kind: 'workout'; ts: number; data: WorkoutSession };
type StudyEntry   = { kind: 'study';   ts: number; data: StudySessionLog  };
type FeedEntry    = WorkoutEntry | StudyEntry;

function toFeed(
  workouts: WorkoutSession[],
  studySessions: StudySessionLog[],
): FeedEntry[] {
  const wEntries: WorkoutEntry[] = workouts.map((w) => ({
    kind: 'workout',
    ts: new Date(w.started_at).getTime(),
    data: w,
  }));
  const sEntries: StudyEntry[] = studySessions.map((s) => ({
    kind: 'study',
    ts: new Date(s.logged_at).getTime(),
    data: s,
  }));
  return [...wEntries, ...sEntries].sort((a, b) => b.ts - a.ts);
}

// ── Date formatter — browser locale / timezone ───────────────────────────
const fmt = new Intl.DateTimeFormat(undefined, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

// ── Volume helper ────────────────────────────────────────────────────────
function totalVolume(session: WorkoutSession): number {
  if (!session.sets?.length) return 0;
  return session.sets.reduce((sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0), 0);
}

// ── Workout card ─────────────────────────────────────────────────────────
function WorkoutCard({ session }: { session: WorkoutSession }) {
  const color = DAY_TYPE_COLORS[session.day_type] ?? 'var(--color-accent)';
  const label = DAY_TYPE_LABELS[session.day_type] ?? session.day_type.toUpperCase();
  const vol   = totalVolume(session);

  // Duration in minutes
  const duration = session.completed_at
    ? Math.round(
        (new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 60000
      )
    : null;

  // Unique exercises
  const uniqueExercises = session.sets
    ? [...new Set(session.sets.map((s) => s.exercise_name).filter(Boolean))]
    : [];

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-glass-border)',
      borderLeft: `3px solid ${color}`,
      borderRadius: 14,
      padding: '14px 16px',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{
          background: color,
          color: 'var(--color-bg)',
          fontFamily: 'monospace',
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: '0.12em',
          padding: '2px 7px',
          borderRadius: 5,
        }}>
          {label}
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-text-muted)' }}>
          {fmt.format(new Date(session.started_at))}
        </span>
        {duration !== null && (
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
            {duration}m
          </span>
        )}
      </div>

      {/* Exercises */}
      {uniqueExercises.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          {uniqueExercises.map((name) => (
            <span key={name} style={{
              fontFamily: 'monospace',
              fontSize: 10,
              color: 'var(--color-text)',
              background: 'var(--color-glass)',
              border: '1px solid var(--color-glass-border)',
              borderRadius: 5,
              padding: '2px 7px',
            }}>
              {name}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 20 }}>
        {session.sets && (
          <div>
            <p style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
              Sets
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>
              {session.sets.length}
            </p>
          </div>
        )}
        {vol > 0 && (
          <div>
            <p style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
              Volume
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>
              {vol.toLocaleString()} kg
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Study card ───────────────────────────────────────────────────────────
function StudyCard({ session }: { session: StudySessionLog }) {
  const color = PILLAR_COLORS[session.pillar] ?? 'var(--color-accent)';
  const pillarLabel = PILLAR_LABELS[session.pillar] ?? `Pillar ${session.pillar}`;

  const hours   = Math.floor(session.duration_minutes / 60);
  const minutes = session.duration_minutes % 60;
  const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-glass-border)',
      borderLeft: `3px solid ${color}`,
      borderRadius: 14,
      padding: '14px 16px',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: session.day_title ? 8 : 0 }}>
        <span style={{
          background: color,
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: '0.12em',
          padding: '2px 7px',
          borderRadius: 5,
        }}>
          STUDY
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color }}>
          {pillarLabel}
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
          {fmt.format(new Date(session.logged_at))}
        </span>
      </div>

      {/* Day title */}
      {session.day_title && (
        <p style={{
          fontFamily: 'monospace',
          fontSize: 12,
          color: 'var(--color-text)',
          fontWeight: 600,
          marginBottom: 8,
        }}>
          Day {session.day_number} — {session.day_title}
        </p>
      )}

      {/* Duration */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <p style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 700, color }}>
          {durationStr}
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--color-text-muted)' }}>
          logged
        </p>
      </div>

      {/* Notes */}
      {session.notes && (
        <p style={{
          fontFamily: 'monospace',
          fontSize: 11,
          color: 'var(--color-text-muted)',
          marginTop: 6,
          fontStyle: 'italic',
        }}>
          {session.notes}
        </p>
      )}
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      paddingTop: 80,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      color: 'var(--color-text-muted)',
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" opacity={0.35}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
      <p style={{ fontFamily: 'monospace', fontSize: 12, textAlign: 'center', maxWidth: 220, lineHeight: 1.7, opacity: 0.55 }}>
        No sessions logged yet. Complete a workout or study session to see your history here.
      </p>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────
export default function History() {
  const [feed, setFeed]       = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [workouts, studySessions] = await Promise.all([
          getRecentSessions(30),
          getRecentStudySessions(30),
        ]);
        setFeed(toFeed(workouts, studySessions));
      } catch (err: any) {
        setError(err.message ?? 'Failed to load history');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{
      paddingTop: 48,
      paddingBottom: 120,
      maxWidth: 600,
      margin: '0 auto',
      paddingLeft: 16,
      paddingRight: 16,
    }}>
      {/* Page header */}
      <header style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 style={{
          fontSize: 26,
          fontWeight: 800,
          fontFamily: 'monospace',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--color-text)',
          marginBottom: 4,
        }}>
          History
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em' }}>
          Every session. Every rep. Every minute studied.
        </p>
      </header>

      {/* Feed */}
      {loading ? (
        <p style={{ fontFamily: 'monospace', fontSize: 12, textAlign: 'center', color: 'var(--color-text-muted)', paddingTop: 60 }}>
          LOADING...
        </p>
      ) : error ? (
        <p style={{ fontFamily: 'monospace', fontSize: 12, textAlign: 'center', color: '#f87171', paddingTop: 60 }}>
          {error}
        </p>
      ) : feed.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {feed.map((entry) =>
            entry.kind === 'workout' ? (
              <WorkoutCard key={`w-${entry.data.id}`} session={entry.data} />
            ) : (
              <StudyCard key={`s-${entry.data.id}`} session={entry.data} />
            )
          )}
        </div>
      )}
    </div>
  );
}
