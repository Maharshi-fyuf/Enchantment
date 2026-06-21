import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Check, Calendar, Clock, X } from 'lucide-react';
import { 
  getToday, 
  startSession, 
  logSet, 
  deleteSet, 
  completeSession,
  getRecentSessions,
  getRecentStudySessions,
  getUpcomingReminders,
  createReminder,
  completeReminder,
  deleteReminder,
  type TodayResponse,
  type WorkoutSession,
  type SetLog,
  type Reminder
} from '../lib/api';

/** Returns true if the ISO timestamp falls on today in the browser's local timezone. */
function isLocalToday(isoString: string): boolean {
  const d = new Date(isoString);
  const now = new Date();
  return d.getFullYear() === now.getFullYear()
      && d.getMonth() === now.getMonth()
      && d.getDate() === now.getDate();
}

export default function Today() {
  const [data, setData] = useState<TodayResponse | null>(null);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  // Today's completion state — silently fails if network is flaky
  const [workoutDoneToday, setWorkoutDoneToday] = useState(false);
  const [studyDoneToday, setStudyDoneToday] = useState(false);

  // Reminders state
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadToday();
    // Fire-and-forget: fetch just enough to determine today's completion
    Promise.all([
      getRecentSessions(5).catch(() => []),
      getRecentStudySessions(5).catch(() => []),
    ]).then(([workouts, studySessions]) => {
      setWorkoutDoneToday(
        workouts.some((w) => w.completed_at !== null && isLocalToday(w.completed_at))
      );
      setStudyDoneToday(
        studySessions.some((s) => isLocalToday(s.logged_at))
      );
    });
    // Fetch upcoming reminders
    getUpcomingReminders()
      .then(setReminders)
      .catch(() => {});
  }, []);

  async function loadToday() {
    try {
      setError(null);
      const res = await getToday();
      setData(res);
      setSession(res.active_session);
    } catch (err: any) {
      console.error('Failed to load today:', err);
      setError(err.message || 'Failed to connect to API');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStartWorkout() {
    if (!data || data.day_type === 'rest') return;
    try {
      const newSession = await startSession(data.day_type);
      setSession({ ...newSession, sets: [] });
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  }

  async function handleFinishWorkout() {
    if (!session) return;
    setIsFinishing(true);
    try {
      await completeSession(session.id);
      setSession(null);
      // Reload today to get the fresh state (should probably still show the exercises but without an active session)
      await loadToday();
    } catch (err) {
      console.error('Failed to finish session:', err);
    } finally {
      setIsFinishing(false);
    }
  }

  async function handleLogSet(exerciseId: string, weight: number, reps: number, rpe?: number) {
    if (!session) return;
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const newSet: SetLog = {
      id: tempId,
      session_id: session.id,
      exercise_id: exerciseId,
      set_number: (session.sets?.filter(s => s.exercise_id === exerciseId).length ?? 0) + 1,
      weight_kg: weight,
      reps,
      rpe: rpe ?? null,
    };

    setSession(prev => prev ? {
      ...prev,
      sets: [...(prev.sets || []), newSet]
    } : null);

    try {
      const savedSet = await logSet(session.id, {
        exercise_id: exerciseId,
        set_number: newSet.set_number,
        weight_kg: weight,
        reps,
        rpe
      });
      
      // Swap temp ID with real ID
      setSession(prev => prev ? {
        ...prev,
        sets: prev.sets?.map(s => s.id === tempId ? savedSet : s)
      } : null);
    } catch (err) {
      console.error('Failed to log set:', err);
      // Rollback
      setSession(prev => prev ? {
        ...prev,
        sets: prev.sets?.filter(s => s.id !== tempId)
      } : null);
    }
  }

  async function handleDeleteSet(setId: string) {
    if (!session || setId.startsWith('temp-')) return;

    // Optimistic update
    const previousSets = session.sets || [];
    setSession(prev => prev ? {
      ...prev,
      sets: prev.sets?.filter(s => s.id !== setId)
    } : null);

    try {
      await deleteSet(setId);
    } catch (err) {
      console.error('Failed to delete set:', err);
      // Rollback
      setSession(prev => prev ? { ...prev, sets: previousSets } : null);
    }
  }

  // ── Reminder handlers ────────────────────────────────────────────────────

  async function handleAddReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    // Optimistic add
    const tempId = `temp-${Date.now()}`;
    const optimistic: Reminder = {
      id: tempId,
      title: newTitle.trim(),
      due_date: newDate,
      due_time: newTime || null,
      notes: null,
      completed_at: null,
      created_at: new Date().toISOString(),
    };
    setReminders(prev => [...prev, optimistic].sort((a, b) => {
      const cmp = a.due_date.localeCompare(b.due_date);
      if (cmp !== 0) return cmp;
      if (!a.due_time && !b.due_time) return 0;
      if (!a.due_time) return 1;
      if (!b.due_time) return -1;
      return a.due_time.localeCompare(b.due_time);
    }));
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setShowAddForm(false);

    try {
      const saved = await createReminder({
        title: optimistic.title,
        due_date: optimistic.due_date,
        due_time: optimistic.due_time,
      });
      setReminders(prev => prev.map(r => r.id === tempId ? saved : r));
    } catch (err) {
      console.error('Failed to create reminder:', err);
      setReminders(prev => prev.filter(r => r.id !== tempId));
    }
  }

  async function handleCompleteReminder(id: string) {
    // Optimistic remove from list (completing hides it from "upcoming")
    const previous = reminders;
    setReminders(prev => prev.filter(r => r.id !== id));

    try {
      await completeReminder(id);
    } catch (err) {
      console.error('Failed to complete reminder:', err);
      setReminders(previous);
    }
  }

  async function handleDeleteReminder(id: string) {
    if (id.startsWith('temp-')) return;
    const previous = reminders;
    setReminders(prev => prev.filter(r => r.id !== id));

    try {
      await deleteReminder(id);
    } catch (err) {
      console.error('Failed to delete reminder:', err);
      setReminders(previous);
    }
  }

  if (isLoading) {
    return <div className="flex h-[80vh] items-center justify-center text-[var(--color-text-muted)] font-mono text-sm tracking-widest">LOADING...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-6 text-center space-y-4">
        <h1 className="text-xl font-mono text-red-500 uppercase">API Error</h1>
        <p className="text-[var(--color-text-muted)] font-mono text-xs">{error}</p>
        <p className="text-[var(--color-text-muted)] font-mono text-xs mt-4">Make sure 'vercel dev' is running on port 3000.</p>
      </div>
    );
  }

  if (!data || data.day_type === 'rest') {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-6 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[var(--color-glass)] border border-[var(--color-glass-border)] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,255,255,0.03)]">
          <Check className="w-8 h-8 text-[var(--color-text-muted)]" />
        </div>
        <h1 className="text-2xl font-mono tracking-widest text-[var(--color-text)] uppercase">Rest Day</h1>
        <p className="text-[var(--color-text-muted)] font-mono text-xs tracking-wider max-w-[250px] leading-relaxed">
          Central nervous system recovery. No lifting today.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-12 pb-32 max-w-lg mx-auto">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold font-mono tracking-widest uppercase mb-2" style={{ color: `var(--color-${data.day_type})` }}>
          {data.day_type} Day
        </h1>
        <p className="text-[var(--color-text-muted)] font-mono text-xs tracking-widest uppercase">
          {session ? 'Workout in progress' : 'Ready to dominate'}
        </p>
      </header>

      {/* Today's Completion Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 28,
      }}>
        {([{ label: 'Workout', done: workoutDoneToday }, { label: 'Study', done: studyDoneToday }] as const).map(({ label, done }) => (
          <div key={label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 20,
            border: `1px solid ${done ? 'var(--color-accent)' : 'var(--color-glass-border)'}`,
            background: done ? 'var(--color-accent-muted)' : 'transparent',
            transition: 'all 0.2s ease',
          }}>
            {/* Circle indicator */}
            <div style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: done ? 'var(--color-accent)' : 'var(--color-text-muted)',
              flexShrink: 0,
              boxShadow: done ? '0 0 6px var(--color-accent)' : 'none',
            }} />
            <span style={{
              fontFamily: 'monospace',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: done ? 'var(--color-accent)' : 'var(--color-text-muted)',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Upcoming Reminders ────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <h2 style={{
            fontFamily: 'monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            margin: 0,
          }}>Upcoming</h2>
          <button
            onClick={() => setShowAddForm(prev => !prev)}
            style={{
              background: 'none',
              border: '1px solid var(--color-glass-border)',
              borderRadius: 8,
              padding: '3px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--color-text-muted)',
              fontFamily: 'monospace',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              transition: 'all 0.15s ease',
            }}
          >
            {showAddForm ? <X size={12} /> : <Plus size={12} />}
            {showAddForm ? 'Cancel' : 'Add'}
          </button>
        </div>

        {/* Inline add-reminder form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', marginBottom: 12 }}
              onSubmit={handleAddReminder}
            >
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-glass-border)',
                borderRadius: 12,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <input
                  type="text"
                  placeholder="Reminder title..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                  style={{
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-glass-border)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: 'var(--color-text)',
                    fontFamily: 'monospace',
                    fontSize: 13,
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                    <input
                      type="date"
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      required
                      style={{
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-glass-border)',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: 'var(--color-text)',
                        fontFamily: 'monospace',
                        fontSize: 12,
                        outline: 'none',
                        flex: 1,
                        colorScheme: 'dark',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                    <input
                      type="time"
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                      style={{
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-glass-border)',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: 'var(--color-text)',
                        fontFamily: 'monospace',
                        fontSize: 12,
                        outline: 'none',
                        flex: 1,
                        colorScheme: 'dark',
                      }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  style={{
                    background: 'var(--color-accent)',
                    color: 'var(--color-bg)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 0',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >Save</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Reminder list */}
        {reminders.length === 0 && !showAddForm ? (
          <p style={{
            fontFamily: 'monospace',
            fontSize: 11,
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            opacity: 0.6,
            padding: '8px 0',
          }}>No upcoming reminders</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <AnimatePresence>
              {reminders.map(r => (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-glass-border)',
                    borderRadius: 10,
                    padding: '10px 12px',
                  }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleCompleteReminder(r.id)}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      border: '1.5px solid var(--color-glass-border)',
                      background: 'transparent',
                      cursor: 'pointer',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-muted)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-glass-border)';
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                  >
                    <Check size={12} style={{ color: 'var(--color-accent)', opacity: 0.4 }} />
                  </button>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>{r.title}</div>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: 10,
                      color: 'var(--color-text-muted)',
                      marginTop: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                      <Calendar size={10} />
                      <span>{r.due_date}</span>
                      {r.due_time && (
                        <>
                          <Clock size={10} />
                          <span>{r.due_time.slice(0, 5)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteReminder(r.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      color: 'var(--color-text-muted)',
                      opacity: 0.4,
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.4'; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Start Button */}
      {!session && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleStartWorkout}
          className="w-full py-4 rounded-xl bg-[var(--color-accent)] text-[var(--color-bg)] font-bold font-mono tracking-widest uppercase mb-8 shadow-[0_0_20px_var(--color-accent-muted)]"
        >
          Start Workout
        </motion.button>
      )}

      {/* Exercise List */}
      <div className="space-y-6">
        {data.exercises.map((exercise) => (
          <ExerciseCard 
            key={exercise.id} 
            exercise={exercise} 
            session={session}
            onLogSet={(weight, reps, rpe) => handleLogSet(exercise.id, weight, reps, rpe)}
            onDeleteSet={handleDeleteSet}
          />
        ))}
      </div>

      {/* Sticky Finish Button */}
      <AnimatePresence>
        {session && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-0 w-full px-4 z-40"
          >
            <div className="max-w-lg mx-auto">
              <button
                onClick={handleFinishWorkout}
                disabled={isFinishing}
                className="w-full py-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-glass-border)] text-[var(--color-text)] font-bold font-mono tracking-widest uppercase shadow-2xl backdrop-blur-xl flex items-center justify-center space-x-2"
              >
                {isFinishing ? (
                  <span className="animate-pulse">Finishing...</span>
                ) : (
                  <>
                    <Check className="w-5 h-5 text-[var(--color-accent)]" />
                    <span>Finish Workout</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Components ─────────────────────────────────────────────────────────────

function ExerciseCard({ 
  exercise, 
  session, 
  onLogSet, 
  onDeleteSet 
}: { 
  exercise: any; 
  session: WorkoutSession | null;
  onLogSet: (weight: number, reps: number, rpe?: number) => void;
  onDeleteSet: (setId: string) => void;
}) {
  const sets = session?.sets?.filter(s => s.exercise_id === exercise.id) || [];
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weight || !reps) return;
    onLogSet(parseFloat(weight), parseInt(reps, 10));
    setWeight('');
    setReps('');
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-glass-border)] rounded-2xl p-5 shadow-lg overflow-hidden relative">
      {/* Background Accent Glow if it's a main lift */}
      {exercise.is_main_lift && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-accent)] opacity-5 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="mb-4">
        <h2 className="text-lg font-bold text-[var(--color-text)] tracking-wide mb-1 flex items-center justify-between">
          <span>{exercise.name}</span>
          {exercise.is_main_lift && <span className="text-[10px] bg-[var(--color-accent-muted)] text-[var(--color-accent)] px-2 py-0.5 rounded-sm tracking-widest uppercase font-mono">Main</span>}
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] font-mono">
          Target: {exercise.target_sets} sets x {exercise.target_reps}
        </p>
        {exercise.notes && (
          <p className="mt-2 text-xs text-[var(--color-text-muted)] opacity-80 leading-relaxed border-l-2 border-[var(--color-glass-border)] pl-3">
            {exercise.notes}
          </p>
        )}
      </div>

      {/* Logged Sets (Swipe to delete) */}
      {sets.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <AnimatePresence>
            {sets.map((set) => (
              <motion.div
                key={set.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                drag="x"
                dragConstraints={{ left: -60, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -40) {
                    onDeleteSet(set.id);
                  }
                }}
                className="relative flex items-center"
              >
                {/* Trash Icon behind the chip */}
                <div className="absolute right-3 text-red-500 opacity-50 z-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                {/* The Chip */}
                <div className="bg-[var(--color-glass)] border border-[var(--color-glass-border)] text-sm font-mono px-3 py-1.5 rounded-lg z-10 relative bg-[var(--color-surface)] flex space-x-2">
                  <span className="text-[var(--color-text)]">{set.weight_kg}kg</span>
                  <span className="text-[var(--color-text-muted)]">x</span>
                  <span className="text-[var(--color-text)]">{set.reps}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Log Set Form */}
      {session && (
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            placeholder="kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="flex-1 bg-[var(--color-bg)] border border-[var(--color-glass-border)] rounded-xl px-4 py-3 text-center text-lg font-mono focus:outline-none focus:border-[var(--color-accent)] transition-colors appearance-none"
            required
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="flex-1 bg-[var(--color-bg)] border border-[var(--color-glass-border)] rounded-xl px-4 py-3 text-center text-lg font-mono focus:outline-none focus:border-[var(--color-accent)] transition-colors appearance-none"
            required
          />
          <button
            type="submit"
            className="w-14 bg-[var(--color-glass)] border border-[var(--color-glass-border)] rounded-xl flex items-center justify-center text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)] transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </form>
      )}
    </div>
  );
}
