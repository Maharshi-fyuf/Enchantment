/**
 * DayTimeline.jsx
 * ─────────────────────────────────────────────────────────────
 * Renders 30 small coloured dots — one per study day.
 * Dot colour encodes the pillar. A checkmark overlay indicates completion.
 * Clicking a dot scrolls to and opens that day's accordion row.
 */

import React from 'react';
import { STUDY_DAYS, PILLAR_CONFIG } from '../../data/studyPlan';

/**
 * @param {object}     props
 * @param {Set<number>} props.completedDays   days that are marked done
 * @param {number}      props.activeFilter    0 = all, 1–4 = pillar
 * @param {function}    props.onDotClick      (dayNumber) => void
 */
export default function DayTimeline({ completedDays, activeFilter, onDotClick }) {
  return (
    <div
      className="flex flex-wrap gap-1"
      role="list"
      aria-label="30-day progress timeline"
    >
      {STUDY_DAYS.map(({ day, pillar }) => {
        const cfg = PILLAR_CONFIG[pillar];
        const done = completedDays.has(day);
        const dimmed = activeFilter !== 0 && activeFilter !== pillar;

        return (
          <button
            key={day}
            role="listitem"
            onClick={() => onDotClick(day)}
            title={`Day ${day} — click to jump`}
            aria-label={`Day ${day}${done ? ', completed' : ''}`}
            className={[
              'relative h-[18px] w-[18px] flex-shrink-0 rounded transition-all duration-150',
              'hover:scale-125 focus:outline-none focus:scale-125',
              cfg.dotBg,
              dimmed ? 'opacity-20' : 'opacity-100',
            ].join(' ')}
          >
            {/* Completion checkmark */}
            {done && (
              <svg
                className="absolute inset-0 m-auto h-2.5 w-2.5 text-white"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
