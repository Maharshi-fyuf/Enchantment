import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  getExerciseHistory,
  getMainLifts,
  getStudyHours,
  type E1rmDataPoint,
  type StudyHoursDataPoint,
  type MainLift,
} from '../lib/api';

// ── Pillar colours (raw hex, from the same teal/violet/amber/orange palette
//    as PILLAR_CONFIG — not the dark: variants since .dark is never applied) ──
const PILLAR_COLORS: Record<number, string> = {
  1: '#14b8a6', // teal-500
  2: '#8b5cf6', // violet-500
  3: '#f59e0b', // amber-500
  4: '#f97316', // orange-500
};

const PILLAR_LABELS: Record<number, string> = {
  1: 'OS & Linux',
  2: 'Networking',
  3: 'Programming',
  4: 'Security',
};

type Tab = 'lifts' | 'study';
type StudyGroup = 'day' | 'week';

// ── Custom tooltip for the e1RM line chart ────────────────────────────────────
function E1rmTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-glass-border)',
      borderRadius: 12,
      padding: '10px 14px',
    }}>
      <p style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: 11, marginBottom: 4 }}>{label}</p>
      <p style={{ color: 'var(--color-accent)', fontFamily: 'monospace', fontSize: 15, fontWeight: 700 }}>
        {payload[0].value} kg
      </p>
    </div>
  );
}

// ── Custom tooltip for the study bar chart ────────────────────────────────────
function StudyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-glass-border)',
      borderRadius: 12,
      padding: '10px 14px',
      minWidth: 140,
    }}>
      <p style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color, fontFamily: 'monospace', fontSize: 13, marginBottom: 2 }}>
          {PILLAR_LABELS[Number(entry.dataKey.replace('p', ''))]} — {entry.value} min
        </p>
      ))}
    </div>
  );
}

// ── Transforms flat pillar rows into a shape Recharts BarChart can consume ────
// Input: [{period, pillar, total_minutes}, ...]
// Output: [{period, p1: 30, p2: 0, p3: 60, p4: 0}, ...]
function pivotStudyData(rows: StudyHoursDataPoint[]): Record<string, any>[] {
  const map = new Map<string, Record<string, any>>();
  for (const row of rows) {
    if (!map.has(row.period)) {
      map.set(row.period, { period: row.period, p1: 0, p2: 0, p3: 0, p4: 0 });
    }
    map.get(row.period)![`p${row.pillar}`] = row.total_minutes;
  }
  return Array.from(map.values()).sort((a, b) => a.period.localeCompare(b.period));
}

// ── Empty-state component ─────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      height: 240,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      color: 'var(--color-text-muted)',
    }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.4}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
      <p style={{ fontFamily: 'monospace', fontSize: 12, textAlign: 'center', maxWidth: 220, lineHeight: 1.6, opacity: 0.6 }}>
        {message}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Progress() {
  const [tab, setTab] = useState<Tab>('lifts');

  // — Lifts state —
  const [mainLifts, setMainLifts] = useState<MainLift[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [e1rmData, setE1rmData] = useState<E1rmDataPoint[]>([]);
  const [liftsLoading, setLiftsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [liftsError, setLiftsError] = useState<string | null>(null);

  // — Study state —
  const [studyGroup, setStudyGroup] = useState<StudyGroup>('day');
  const [studyRaw, setStudyRaw] = useState<StudyHoursDataPoint[]>([]);
  const [studyLoading, setStudyLoading] = useState(false);
  const [studyError, setStudyError] = useState<string | null>(null);

  // Load main lifts on mount
  useEffect(() => {
    (async () => {
      try {
        const lifts = await getMainLifts();
        setMainLifts(lifts);
        if (lifts.length > 0) {
          setSelectedSlug(lifts[0].slug);
        }
      } catch (err: any) {
        setLiftsError(err.message ?? 'Failed to load lifts');
      } finally {
        setLiftsLoading(false);
      }
    })();
  }, []);

  // Load e1RM data whenever selectedSlug changes
  useEffect(() => {
    if (!selectedSlug) return;
    setChartLoading(true);
    setE1rmData([]);
    getExerciseHistory(selectedSlug)
      .then((res) => setE1rmData(res.data))
      .catch((err) => setLiftsError(err.message ?? 'Failed to load history'))
      .finally(() => setChartLoading(false));
  }, [selectedSlug]);

  // Load study hours whenever tab or group changes
  useEffect(() => {
    if (tab !== 'study') return;
    setStudyLoading(true);
    setStudyRaw([]);
    getStudyHours(studyGroup)
      .then((rows) => setStudyRaw(rows))
      .catch((err) => setStudyError(err.message ?? 'Failed to load study hours'))
      .finally(() => setStudyLoading(false));
  }, [tab, studyGroup]);

  const studyData = pivotStudyData(studyRaw);

  // Shared tab-pill style
  const pillStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px 0',
    borderRadius: 10,
    border: 'none',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    background: active ? 'var(--color-accent)' : 'transparent',
    color: active ? 'var(--color-bg)' : 'var(--color-text-muted)',
  });

  const smallPillStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 14px',
    borderRadius: 8,
    border: '1px solid var(--color-glass-border)',
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    background: active ? 'var(--color-glass)' : 'transparent',
    color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
  });

  const axisStyle = { fontFamily: 'monospace', fontSize: 10, fill: 'var(--color-text-muted)' };

  return (
    <div style={{ paddingTop: 48, paddingBottom: 120, maxWidth: 600, margin: '0 auto', paddingLeft: 16, paddingRight: 16 }}>
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
          Progress
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em' }}>
          Track your gains, visualise your grind.
        </p>
      </header>

      {/* Main tab switcher */}
      <div style={{
        display: 'flex',
        gap: 4,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-glass-border)',
        borderRadius: 14,
        padding: 4,
        marginBottom: 28,
      }}>
        <button style={pillStyle(tab === 'lifts')} onClick={() => setTab('lifts')}>Lifts</button>
        <button style={pillStyle(tab === 'study')} onClick={() => setTab('study')}>Study</button>
      </div>

      {/* ── LIFTS TAB ─────────────────────────────────────────────────── */}
      {tab === 'lifts' && (
        <div>
          {liftsLoading ? (
            <p style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: 12, textAlign: 'center', paddingTop: 60 }}>
              LOADING...
            </p>
          ) : liftsError ? (
            <p style={{ color: '#f87171', fontFamily: 'monospace', fontSize: 12, textAlign: 'center', paddingTop: 60 }}>
              {liftsError}
            </p>
          ) : (
            <>
              {/* Exercise picker pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                {mainLifts.map((lift) => (
                  <button
                    key={lift.slug}
                    style={smallPillStyle(selectedSlug === lift.slug)}
                    onClick={() => setSelectedSlug(lift.slug)}
                  >
                    {lift.name}
                  </button>
                ))}
              </div>

              {/* e1RM chart card */}
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-glass-border)',
                borderRadius: 18,
                padding: '20px 16px 16px',
              }}>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
                    Estimated 1-Rep Max
                  </p>
                  <p style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>
                    {mainLifts.find(l => l.slug === selectedSlug)?.name ?? '—'}
                  </p>
                </div>

                {chartLoading ? (
                  <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: 11 }}>LOADING...</p>
                  </div>
                ) : e1rmData.length === 0 ? (
                  <EmptyState message="Log a few sets to see your e1RM progress here" />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={e1rmData} margin={{ top: 4, right: 8, left: -12, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-glass-border)" />
                      <XAxis
                        dataKey="date"
                        tick={axisStyle}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(d) => {
                          const [, m, day] = d.split('-');
                          return `${day}/${m}`;
                        }}
                      />
                      <YAxis
                        tick={axisStyle}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}kg`}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip content={<E1rmTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="e1rm"
                        stroke="var(--color-accent)"
                        strokeWidth={2.5}
                        dot={{ fill: 'var(--color-accent)', strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, fill: 'var(--color-accent)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── STUDY TAB ─────────────────────────────────────────────────── */}
      {tab === 'study' && (
        <div>
          {/* Day / Week toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            <button style={smallPillStyle(studyGroup === 'day')} onClick={() => setStudyGroup('day')}>Daily</button>
            <button style={smallPillStyle(studyGroup === 'week')} onClick={() => setStudyGroup('week')}>Weekly</button>
          </div>

          {/* Study chart card */}
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-glass-border)',
            borderRadius: 18,
            padding: '20px 16px 16px',
          }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
                Study Time by Pillar
              </p>
              <p style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--color-text)' }}>
                {studyGroup === 'day' ? 'Daily breakdown' : 'Weekly breakdown'}
              </p>
            </div>

            {studyLoading ? (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: 11 }}>LOADING...</p>
              </div>
            ) : studyError ? (
              <p style={{ color: '#f87171', fontFamily: 'monospace', fontSize: 12, textAlign: 'center', paddingTop: 60 }}>
                {studyError}
              </p>
            ) : studyData.length === 0 ? (
              <EmptyState message="Log some study time to see this chart" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={studyData} margin={{ top: 4, right: 8, left: -12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-glass-border)" />
                  <XAxis
                    dataKey="period"
                    tick={axisStyle}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(d) => {
                      const [, m, day] = d.split('-');
                      return `${day}/${m}`;
                    }}
                  />
                  <YAxis
                    tick={axisStyle}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}m`}
                  />
                  <Tooltip content={<StudyTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {PILLAR_LABELS[Number(value.replace('p', ''))]}
                      </span>
                    )}
                  />
                  {[1, 2, 3, 4].map((pillar) => (
                    <Bar
                      key={pillar}
                      dataKey={`p${pillar}`}
                      stackId="study"
                      fill={PILLAR_COLORS[pillar]}
                      radius={pillar === 4 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pillar legend cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
            {([1, 2, 3, 4] as const).map((pillar) => {
              const totalMins = studyRaw
                .filter(r => r.pillar === pillar)
                .reduce((sum, r) => sum + r.total_minutes, 0);
              return (
                <div key={pillar} style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-glass-border)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  borderLeft: `3px solid ${PILLAR_COLORS[pillar]}`,
                }}>
                  <p style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                    {PILLAR_LABELS[pillar]}
                  </p>
                  <p style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: PILLAR_COLORS[pillar] }}>
                    {totalMins >= 60
                      ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`
                      : `${totalMins}m`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
