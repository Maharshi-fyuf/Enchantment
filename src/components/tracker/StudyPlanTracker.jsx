/**
 * StudyPlanTracker.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Root component for the 30-day study tracker.
 *
 * Responsibility: orchestration only.
 *   - Pulls all state from useStudyProgress()
 *   - Renders the header, pillar cards, timeline, filter bar, and day list
 *   - Passes state down to children; receives actions back up via callbacks
 *
 * Usage in your app:
 *   import StudyPlanTracker from './components/StudyPlanTracker';
 *
 *   export default function App() {
 *     return (
 *       <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
 *         <StudyPlanTracker />
 *       </div>
 *     );
 *   }
 */

import React, { useCallback, useState } from 'react';
import { useStudyProgress } from '../../hooks/useStudyProgress';
import { PILLAR_CONFIG } from '../../data/studyPlan';
import PillarCard from './PillarCard';
import DayTimeline from './DayTimeline';
import FilterBar from './FilterBar';
import DayRow from './DayRow';

export default function StudyPlanTracker() {
  const {
    completedDays,
    expandedDays,
    activeFilter,
    toggleComplete,
    toggleExpanded,
    setActiveFilter,
    collapseAll,
    progress,
    visibleDays,
  } = useStudyProgress();

  /**
   * scrollTarget: number | null
   * The day number that should scroll into view next render.
   * Reset to null immediately after the target DayRow mounts.
   */
  const [scrollTarget, setScrollTarget] = useState(null);

  /** Called when the user clicks a dot in the timeline. */
  const handleDotClick = useCallback(
    (dayNumber) => {
      setActiveFilter(0); // show all days so the row is visible
      setScrollTarget(dayNumber);
      // Auto-expand the target row
      if (!expandedDays.has(dayNumber)) {
        toggleExpanded(dayNumber);
      }
    },
    [setActiveFilter, expandedDays, toggleExpanded]
  );

  /** Clear scroll target once the component has consumed it. */
  const clearScrollTarget = useCallback(() => setScrollTarget(null), []);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 font-sans">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="mb-6 border-b border-gray-200 pb-4 dark:border-gray-800">
        <h1 className="font-mono text-xl font-medium text-gray-900 dark:text-gray-100">
          30-day foundation plan
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          2 hours daily&nbsp;·&nbsp;4 pillars&nbsp;·&nbsp;free platforms only
        </p>

        {/* Overall progress bar */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
              overall progress
            </span>
            <span className="font-mono text-xs font-medium text-gray-700 dark:text-gray-300">
              {progress.completed} / {progress.total} days ({progress.percentage}%)
            </span>
          </div>
          {/* Segmented bar — each segment represents a pillar */}
          <div className="flex h-2 w-full gap-px overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            {[1, 2, 3, 4].map((pid) => {
              const pCfg = PILLAR_CONFIG[pid];
              const { total, completed } = progress.byPillar[pid];
              return (
                <div
                  key={pid}
                  className="h-full bg-gray-100 dark:bg-gray-800"
                  style={{ flex: total }}
                >
                  <div
                    className={`h-full transition-all duration-500 ${pCfg.progressBar}`}
                    style={{ width: `${Math.round((completed / total) * 100)}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Pillar cards ───────────────────────────────────────────────── */}
      <section aria-label="Pillar overview" className="mb-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[1, 2, 3, 4].map((pid) => (
            <PillarCard
              key={pid}
              pillarId={pid}
              isActive={activeFilter === pid}
              isFiltered={activeFilter !== 0}
              progress={progress.byPillar[pid]}
              onClick={() => setActiveFilter(activeFilter === pid ? 0 : pid)}
            />
          ))}
        </div>
      </section>

      {/* ── Timeline ───────────────────────────────────────────────────── */}
      <section aria-label="Day timeline" className="mb-5">
        <DayTimeline
          completedDays={completedDays}
          activeFilter={activeFilter}
          onDotClick={handleDotClick}
        />
      </section>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterBar activeFilter={activeFilter} onFilter={setActiveFilter} />
        {expandedDays.size > 0 && (
          <button
            onClick={collapseAll}
            className="font-mono text-[11px] text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
          >
            collapse all
          </button>
        )}
      </div>

      {/* ── Day list ───────────────────────────────────────────────────── */}
      <section aria-label="Study days" className="flex flex-col gap-1.5">
        {isLoading && (
          <div className="py-8 text-center text-sm font-mono text-gray-400 dark:text-gray-600">
            CONNECTING TO NEON...
          </div>
        )}
        {error && (
          <div className="py-8 text-center text-sm font-mono text-red-500">
            {error}
          </div>
        )}

        {!isLoading && visibleDays.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-600">
            No days in this pillar.
          </p>
        )}

        {!isLoading && visibleDays.map((day) => {
          const isTarget = scrollTarget === day.day;
          return (
            <DayRow
              key={day.day}
              day={day}
              isExpanded={expandedDays.has(day.day)}
              isCompleted={completedDays.has(day.day)}
              onToggle={() => toggleExpanded(day.day)}
              onComplete={() => toggleComplete(day.day)}
              shouldScroll={isTarget}
              onLogSession={(minutes) => logSession(day.day, day.pillar, minutes)}
            />
          );
        })}
      </section>

      {/* ── Footer note ────────────────────────────────────────────────── */}
      {progress.completed === progress.total && (
        <div className="mt-8 rounded-lg border border-teal-200 bg-teal-50 p-4 text-center dark:border-teal-800 dark:bg-teal-950">
          <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
            Month 1 complete. Next: TryHackMe Jr. Penetration Tester path.
          </p>
        </div>
      )}
    </div>
  );
}
