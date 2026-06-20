import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Check } from 'lucide-react';
import { 
  getToday, 
  startSession, 
  logSet, 
  deleteSet, 
  completeSession,
  type TodayResponse,
  type WorkoutSession,
  type SetLog
} from '../lib/api';

export default function Today() {
  const [data, setData] = useState<TodayResponse | null>(null);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    loadToday();
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
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold font-mono tracking-widest uppercase mb-2" style={{ color: `var(--color-${data.day_type})` }}>
          {data.day_type} Day
        </h1>
        <p className="text-[var(--color-text-muted)] font-mono text-xs tracking-widest uppercase">
          {session ? 'Workout in progress' : 'Ready to dominate'}
        </p>
      </header>

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
