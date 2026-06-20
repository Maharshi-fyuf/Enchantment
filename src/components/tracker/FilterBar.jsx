/**
 * FilterBar.jsx
 * ─────────────────────────────────────────────────────────────
 * A row of filter buttons: "All 30 days" + one per pillar.
 * The active button uses an inverted (filled) style.
 */

import React from 'react';
import { PILLAR_CONFIG } from '../../data/studyPlan';

const FILTERS = [
  { id: 0, label: 'All 30 days' },
  { id: 1, label: PILLAR_CONFIG[1].label },
  { id: 2, label: PILLAR_CONFIG[2].label },
  { id: 3, label: PILLAR_CONFIG[3].label },
  { id: 4, label: PILLAR_CONFIG[4].label },
];

/**
 * @param {object}   props
 * @param {number}   props.activeFilter   0–4
 * @param {function} props.onFilter       (id: number) => void
 */
export default function FilterBar({ activeFilter, onFilter }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by pillar">
      {FILTERS.map(({ id, label }) => {
        const active = activeFilter === id;
        return (
          <button
            key={id}
            onClick={() => onFilter(id === activeFilter ? 0 : id)} // toggle off if re-clicked
            aria-pressed={active}
            className={[
              'rounded-md border px-3 py-1 font-mono text-[11px] transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              active
                ? 'border-transparent bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800',
            ].join(' ')}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
