/**
 * PillarCard.jsx
 * ─────────────────────────────────────────
 * Displays a single pillar's summary at the top of the tracker.
 * Shows completion progress for that pillar.
 * Clicking filters the day list to that pillar only.
 * Clicking again (when already active) returns to "all days" view.
 */

import React from 'react';
import { PILLAR_CONFIG } from '../../data/studyPlan';

/**
 * @param {object}   props
 * @param {number}   props.pillarId      1–4
 * @param {boolean}  props.isActive      true when this pillar is the active filter
 * @param {boolean}  props.isFiltered    true when *any* pillar filter is active
 * @param {object}   props.progress      { total, completed } for this pillar
 * @param {function} props.onClick       () => void — toggle filter
 */
export default function PillarCard({ pillarId, isActive, isFiltered, progress, onClick }) {
  const cfg = PILLAR_CONFIG[pillarId];
  const pct = Math.round((progress.completed / progress.total) * 100);

  // Dim the card when another pillar is filtered, not this one
  const dimmed = isFiltered && !isActive;

  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className={[
        'w-full text-left rounded-lg border p-3 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1',
        cfg.cardBg,
        cfg.cardBorder,
        isActive ? 'ring-2 ring-offset-1' : '',
        dimmed ? 'opacity-30' : 'opacity-100',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Day range label */}
      <p className={`font-mono text-[10px] tracking-wider ${cfg.cardMuted}`}>
        {cfg.dayRange}
      </p>

      {/* Pillar name */}
      <p className={`mt-0.5 text-xs font-medium leading-tight ${cfg.cardText}`}>
        {cfg.fullLabel}
      </p>

      {/* Progress fraction */}
      <p className={`mt-2 font-mono text-[11px] ${cfg.cardMuted}`}>
        {progress.completed}/{progress.total} days
      </p>

      {/* Progress bar */}
      <div className="mt-1.5 h-1 w-full rounded-full bg-black/10 dark:bg-white/10">
        <div
          className={`h-1 rounded-full transition-all duration-500 ${cfg.progressBar}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </button>
  );
}
