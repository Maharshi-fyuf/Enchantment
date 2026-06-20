import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { PILLAR_CONFIG } from '../../data/studyPlan';

export default function DayRow({
  day,
  isExpanded,
  isCompleted,
  onToggle,
  onComplete,
  shouldScroll,
  onLogSession,
}) {
  const cfg = PILLAR_CONFIG[day.pillar];
  const rowRef = useRef(null);
  const controls = useAnimation();
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (shouldScroll && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [shouldScroll]);

  const handleToggleComplete = () => {
    if (!isCompleted) {
      setShowPicker(true);
      setTimeout(() => {
        setShowPicker((prev) => {
          if (prev) {
            onComplete();
            return false;
          }
          return prev;
        });
      }, 5000);
    } else {
      onComplete(); // Toggling off
    }
  };

  const handleLogSession = (minutes) => {
    if (minutes > 0 && onLogSession) {
      onLogSession(minutes);
    }
    onComplete();
    setShowPicker(false);
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 80) {
      handleToggleComplete();
    }
    controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
  };

  return (
    <div className="relative">
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
        <div className="flex items-center gap-2 px-3 py-2.5 min-h-[44px]">
          {showPicker ? (
            <div className="flex w-full items-center justify-between animate-in fade-in zoom-in duration-200">
              <span className="font-mono text-xs font-bold tracking-wider text-cyber-green">
                LOG SESSION?
              </span>
              <div className="flex items-center gap-1.5">
                {[30, 60, 90].map((min) => (
                  <button
                    key={min}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogSession(min);
                    }}
                    className="rounded bg-cyber-green/20 px-2 py-1 font-mono text-[10px] text-cyber-green transition-colors hover:bg-cyber-green/30"
                  >
                    +{min}m
                  </button>
                ))}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogSession(0);
                  }}
                  className="ml-1 px-1 font-mono text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
                >
                  SKIP
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleComplete();
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
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              <span className="w-8 flex-shrink-0 font-mono text-[11px] text-gray-400 dark:text-gray-500">
                {String(day.day).padStart(2, '0')}
              </span>

              <span className={`hidden flex-shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-medium sm:inline-block ${cfg.badge}`}>
                {cfg.label.toUpperCase()}
              </span>

              <button
                onClick={onToggle}
                className={[
                  'flex-1 text-left text-[13px] font-medium leading-tight focus:outline-none',
                  isCompleted ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-800 dark:text-gray-100',
                ].join(' ')}
              >
                {day.title}
              </button>

              <span className="hidden flex-shrink-0 font-mono text-[10px] text-gray-400 sm:block dark:text-gray-500">
                1hr + 1hr
              </span>

              <button
                onClick={onToggle}
                aria-label={isExpanded ? 'Collapse day details' : 'Expand day details'}
                aria-expanded={isExpanded}
                className="ml-1 flex-shrink-0 text-gray-400 transition-transform duration-200 focus:outline-none dark:text-gray-500"
                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>

        {isExpanded && (
          <div className="px-3 pb-3">
            <div className={`border-l-2 pl-3 ${cfg.accentBorder} rounded-none`}>
              <p className="mb-0.5 font-mono text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                1 hr — theory
              </p>
              <p className="text-[13px] leading-relaxed text-gray-600 dark:text-gray-300">
                {day.theory}
              </p>

              <p className="mb-0.5 mt-3 font-mono text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                1 hr — hands-on lab
              </p>
              <p className="text-[13px] leading-relaxed text-gray-600 dark:text-gray-300">
                {day.lab}
              </p>
            </div>

            <a
              href={day.platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-blue-600 hover:underline dark:text-blue-400"
            >
              <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M7 1h4v4M11 1L5.5 6.5M4 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {day.platform}
            </a>
          </div>
        )}
      </motion.div>
    </div>
  );
}
