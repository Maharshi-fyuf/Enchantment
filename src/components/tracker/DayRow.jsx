/**
 * DayRow.jsx
 * ─────────────────────────────────────────────────────────────────────
 * Accordion row for a single study day.
 *
 * Collapsed: shows day number, pillar badge, title, time split, checkbox.
 * Expanded:  reveals theory brief, lab brief, and a platform link.
 *
 * The "mark complete" checkbox is separate from the expand toggle —
 * a user can mark a day done without reading the details, and vice versa.
 */

import React, { useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { PILLAR_CONFIG } from '../../data/studyPlan';

/**
 * @param {object}   props
 * @param {object}   props.day          full day object from STUDY_DAYS
 * @param {boolean}  props.isExpanded   whether the accordion body is open
 * @param {boolean}  props.isCompleted  whether the day is marked done
 * @param {function} props.onToggle     () => void — open/close accordion
 * @param {function} props.onComplete   () => void — toggle completion
 * @param {boolean}  props.shouldScroll scroll into view on mount if true
 */
export default function DayRow({
  day,
  isExpanded,
  isCompleted,
  onToggle,
  onComplete,
  shouldScroll,
}) {
  const cfg = PILLAR_CONFIG[day.pillar];
  const rowRef = useRef(null);
  const controls = useAnimation();

  // Scroll into view when jumping from the timeline
  useEffect(() => {
    if (shouldScroll && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [shouldScroll]);

  const handleDragEnd = (event, info) => {
    // If dragged right past 80px, toggle complete
    if (info.offset.x > 80) {
      onComplete();
    }
    // Snap back to original position
    controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
  };

  return (
    <div className="relative">
      {/* Swipe background hint */}
      <div className="absolute inset-0 flex items-center px-4 rounded-lg bg-cyber-green/20">
        <span className="text-xs font-mono font-bold tracking-wider text-cyber-green">
          {isCompleted ? 'MARK INCOMPLETE' : 'MARK COMPLETE'}
        </span>
      </div>

      <motion.div
        ref={rowRef}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        animate={controls}
        whileTap={{ scale: 0.98 }}
        id={`day-${day.day}`}
        className={[
          'relative z-10 rounded-lg border transition-colors duration-150',
          isCompleted
            ? 'border-neutral-800 bg-neutral-900/60 dark:border-neutral-800 dark:bg-neutral-900/60'
            : 'border-neutral-800 bg-neutral-900 dark:border-neutral-800 dark:bg-neutral-900',
          isExpanded ? 'shadow-lg' : '',
        ].join(' ')}
      >
        {/* ── Collapsed header (always visible) ────────────────────────── */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          {/* Completion checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // don't expand/collapse when checking
              onComplete();
            }}
          aria-label={`Mark Day ${day.day} ${isCompleted ? 'incomplete' : 'complete'}`}
          className={[
            'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1',
            isCompleted
              ? `${cfg.checkBg} border-transparent text-white`
              : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800',
          ].join(' ')}
        >
          {isCompleted && (
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {/* Day number */}
        <span className="w-8 flex-shrink-0 font-mono text-[11px] text-gray-400 dark:text-gray-500">
          {String(day.day).padStart(2, '0')}
        </span>

        {/* Pillar badge */}
        <span
          className={`hidden flex-shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-medium sm:inline-block ${cfg.badge}`}
        >
          {cfg.label.toUpperCase()}
        </span>

        {/* Title — clickable to expand/collapse */}
        <button
          onClick={onToggle}
          className={[
            'flex-1 text-left text-[13px] font-medium leading-tight focus:outline-none',
            isCompleted
              ? 'text-gray-400 line-through dark:text-gray-500'
              : 'text-gray-800 dark:text-gray-100',
          ].join(' ')}
        >
          {day.title}
        </button>

        {/* Time split */}
        <span className="hidden flex-shrink-0 font-mono text-[10px] text-gray-400 sm:block dark:text-gray-500">
          1hr + 1hr
        </span>

        {/* Chevron toggle */}
        <button
          onClick={onToggle}
          aria-label={isExpanded ? 'Collapse day details' : 'Expand day details'}
          aria-expanded={isExpanded}
          className="ml-1 flex-shrink-0 text-gray-400 transition-transform duration-200 focus:outline-none dark:text-gray-500"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* ── Expanded body ──────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="px-3 pb-3">
          <div
            className={`border-l-2 pl-3 ${cfg.accentBorder} rounded-none`}
          >
            {/* Theory section */}
            <p className="mb-0.5 font-mono text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
              1 hr — theory
            </p>
            <p className="text-[13px] leading-relaxed text-gray-600 dark:text-gray-300">
              {day.theory}
            </p>

            {/* Lab section */}
            <p className="mb-0.5 mt-3 font-mono text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
              1 hr — hands-on lab
            </p>
            <p className="text-[13px] leading-relaxed text-gray-600 dark:text-gray-300">
              {day.lab}
            </p>
          </div>

          {/* Platform link */}
          <a
            href={day.platformUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-blue-600 hover:underline dark:text-blue-400"
          >
            {/* External link icon */}
            <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M7 1h4v4M11 1L5.5 6.5M4 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V8"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {day.platform}
          </a>
        </div>
      )}
      </motion.div>
    </div>
  );
}
