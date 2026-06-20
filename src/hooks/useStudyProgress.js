/**
 * useStudyProgress.js
 * ─────────────────────────────────────────────────────────────────
 * Custom hook that owns ALL mutable state for the tracker.
 *
 * State shape:
 *   completedDays  — Set<number>   which day numbers are marked done
 *   expandedDays   — Set<number>   which day rows are open
 *   activeFilter   — number        0 = all, 1–4 = pillar id
 *
 * BACKEND INTEGRATION GUIDE
 * ─────────────────────────
 * Right now completedDays is persisted to localStorage.
 * To connect to your own backend, replace the two useEffect blocks
 * labelled "PERSISTENCE LAYER" with your own fetch/axios calls.
 *
 * Example (REST):
 *   // On mount — load progress from API
 *   useEffect(() => {
 *     fetch('/api/progress', { credentials: 'include' })
 *       .then(r => r.json())
 *       .then(data => setCompletedDays(new Set(data.completedDays)));
 *   }, []);
 *
 *   // On change — save progress to API
 *   useEffect(() => {
 *     fetch('/api/progress', {
 *       method: 'PUT',
 *       credentials: 'include',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ completedDays: [...completedDays] }),
 *     });
 *   }, [completedDays]);
 *
 * The rest of the component tree is completely unaware of where
 * data is stored — only this hook needs to change.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { STUDY_DAYS } from '../data/studyPlan';
import { getStudyDays, toggleStudyDay, logStudySession } from '../lib/api';

export function useStudyProgress() {
  const [completedDays, setCompletedDays] = useState(new Set());
  const [expandedDays, setExpandedDays] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load from API on mount
  useEffect(() => {
    async function loadProgress() {
      try {
        setError(null);
        const days = await getStudyDays();
        const doneSet = new Set();
        days.forEach(d => {
          if (d.completed_at !== null) {
            doneSet.add(d.day_number);
          }
        });
        setCompletedDays(doneSet);
      } catch (err) {
        console.error('Failed to load study days:', err);
        setError(err.message || 'Failed to connect to API');
      } finally {
        setIsLoading(false);
      }
    }
    loadProgress();
  }, []);

  /** Mark a day complete or incomplete. Toggles. */
  const toggleComplete = useCallback(async (dayNumber) => {
    // Optimistic update
    const previous = new Set(completedDays);
    setCompletedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNumber)) {
        next.delete(dayNumber);
      } else {
        next.add(dayNumber);
      }
      return next;
    });

    try {
      await toggleStudyDay(dayNumber);
    } catch (err) {
      console.error('Failed to toggle study day:', err);
      // Rollback
      setCompletedDays(previous);
    }
  }, [completedDays]);

  /** Log a study session (fire-and-forget) */
  const logSession = useCallback(async (dayNumber, pillar, durationMinutes) => {
    try {
      await logStudySession({ day_number: dayNumber, pillar, duration_minutes: durationMinutes });
    } catch (err) {
      console.error('Failed to log study session:', err);
    }
  }, []);

  /** Open or close an accordion row. */
  const toggleExpanded = useCallback((dayNumber) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNumber)) {
        next.delete(dayNumber);
      } else {
        next.add(dayNumber);
      }
      return next;
    });
  }, []);

  /** Jump to a specific day: apply filter, open that row, scroll to it. */
  const jumpToDay = useCallback((dayNumber, pillar) => {
    setActiveFilter(0); // show all so the row is visible
    setExpandedDays((prev) => new Set([...prev, dayNumber]));
  }, []);

  /** Collapse all open rows. */
  const collapseAll = useCallback(() => setExpandedDays(new Set()), []);

  const progress = useMemo(() => {
    const total = STUDY_DAYS.length; // 30
    const completed = completedDays.size;
    const percentage = Math.round((completed / total) * 100);

    const byPillar = {};
    for (let p = 1; p <= 4; p++) {
      const pillarDays = STUDY_DAYS.filter((d) => d.pillar === p);
      const pillarDone = pillarDays.filter((d) => completedDays.has(d.day)).length;
      byPillar[p] = { total: pillarDays.length, completed: pillarDone };
    }

    return { total, completed, percentage, byPillar };
  }, [completedDays]);

  const visibleDays = useMemo(
    () => (activeFilter === 0 ? STUDY_DAYS : STUDY_DAYS.filter((d) => d.pillar === activeFilter)),
    [activeFilter]
  );

  return {
    completedDays,
    expandedDays,
    activeFilter,
    isLoading,
    error,
    toggleComplete,
    toggleExpanded,
    setActiveFilter,
    jumpToDay,
    collapseAll,
    logSession,
    progress,
    visibleDays,
  };
}
