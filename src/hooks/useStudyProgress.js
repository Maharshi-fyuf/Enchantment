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

const STORAGE_KEY = 'studyPlanProgress_v1';

export function useStudyProgress() {
  // ── Core state ────────────────────────────────────────────────────────────

  /**
   * completedDays: Set<number>
   * Each number is a day.day value (1–30).
   * Stored as an array in localStorage/your API, converted to Set on load.
   */
  const [completedDays, setCompletedDays] = useState(() => {
    // ── PERSISTENCE LAYER: initial load ──────────────────────────────────
    // Replace this block to load from your backend instead.
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
    // ─────────────────────────────────────────────────────────────────────
  });

  /**
   * expandedDays: Set<number>
   * Tracks which accordion rows are open. Not persisted — resets on refresh.
   */
  const [expandedDays, setExpandedDays] = useState(new Set());

  /**
   * activeFilter: number
   * 0 = show all, 1–4 = show only that pillar.
   */
  const [activeFilter, setActiveFilter] = useState(0);

  // ── PERSISTENCE LAYER: save on change ────────────────────────────────────
  // Replace this effect with your API call to save progress.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedDays]));
    } catch {
      // localStorage unavailable (e.g. incognito with strict settings)
    }
  }, [completedDays]);
  // ─────────────────────────────────────────────────────────────────────────

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Mark a day complete or incomplete. Toggles. */
  const toggleComplete = useCallback((dayNumber) => {
    setCompletedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNumber)) {
        next.delete(dayNumber);
      } else {
        next.add(dayNumber);
      }
      return next;
    });
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
    // Caller should handle scrollIntoView — see DayTimeline.jsx
  }, []);

  /** Collapse all open rows. */
  const collapseAll = useCallback(() => setExpandedDays(new Set()), []);

  // ── Derived / computed values ─────────────────────────────────────────────

  const progress = useMemo(() => {
    const total = STUDY_DAYS.length; // 30
    const completed = completedDays.size;
    const percentage = Math.round((completed / total) * 100);

    // Per-pillar breakdown — useful for pillar progress bars
    const byPillar = {};
    for (let p = 1; p <= 4; p++) {
      const pillarDays = STUDY_DAYS.filter((d) => d.pillar === p);
      const pillarDone = pillarDays.filter((d) => completedDays.has(d.day)).length;
      byPillar[p] = { total: pillarDays.length, completed: pillarDone };
    }

    return { total, completed, percentage, byPillar };
  }, [completedDays]);

  /** Days visible after applying the active pillar filter. */
  const visibleDays = useMemo(
    () => (activeFilter === 0 ? STUDY_DAYS : STUDY_DAYS.filter((d) => d.pillar === activeFilter)),
    [activeFilter]
  );

  return {
    // State
    completedDays,
    expandedDays,
    activeFilter,
    // Actions
    toggleComplete,
    toggleExpanded,
    setActiveFilter,
    jumpToDay,
    collapseAll,
    // Computed
    progress,
    visibleDays,
  };
}
