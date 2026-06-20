import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, ChevronDown, CheckCircle } from 'lucide-react';
import { workoutPlan } from '../data/workoutplan';

// Arm Wrestling specific interactive widget
const ArmWrestlingToggle = ({ notes }: { notes: string }) => {
  const [style, setStyle] = useState('Hook');

  return (
    <div className="mt-3">
      <div className="flex bg-neutral-900 rounded-md border border-neutral-800 p-1 mb-2">
        {['Hook', 'Riser'].map((opt) => (
          <motion.button
            key={opt}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              setStyle(opt);
            }}
            className={`flex-1 flex items-center justify-center py-1.5 rounded text-[10px] uppercase font-mono tracking-wider transition-colors focus:outline-none focus:ring-1 focus:ring-cyber-green ${
              style === opt 
                ? 'bg-neutral-800 text-cyber-green border border-cyber-green/20 shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
      <p className="text-[11px] leading-relaxed text-neutral-400">
        {style === 'Hook' ? "Heavy cable curls. Prioritize supination and cup." : "Cable hammer curls with static hold on last rep. Prioritize back pressure and radial deviation."}
      </p>
    </div>
  );
};

// Spotlight effect wrapper for magnetic hover
const SpotlightCard = ({ children, className = "", onClick }: any) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={() => { setIsFocused(true); setOpacity(1); }}
      onBlur={() => { setIsFocused(false); setOpacity(0); }}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(0,255,0,.08), transparent 40%)`,
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default function Workout() {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const toggleDay = (id: string) => {
    setExpandedDay(expandedDay === id ? null : id);
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 150, damping: 20 }
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 font-sans pb-24">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="mb-6 border-b border-neutral-800 pb-4">
        <h1 className="font-mono text-xl font-medium text-white flex items-center gap-2">
          <Dumbbell size={20} className="text-cyber-green" />
          PPL Routine
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          6-Day Heavy Duty Training Plan
        </p>
      </header>

      {/* ── Routine Accordion ──────────────────────────────────────────── */}
      <div className="space-y-4">
        {workoutPlan.map((dayPlan) => {
          const isExpanded = expandedDay === dayPlan.id;

          return (
            <motion.div
              key={dayPlan.id}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              whileTap={{ scale: 0.98 }}
              className="block"
            >
              <SpotlightCard
                onClick={() => toggleDay(dayPlan.id)}
                className={`bg-neutral-900 border rounded-xl transition-all duration-300 ${
                  isExpanded 
                    ? 'border-cyber-green/30 shadow-[0_0_20px_rgba(0,255,0,0.05)]' 
                    : 'border-neutral-800 hover:border-cyber-green/20 hover:bg-neutral-800/50'
                }`}
              >
                {/* Header Row */}
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-1">
                      {dayPlan.day}
                    </p>
                    <h2 className="text-base font-medium text-white flex items-center gap-2">
                      {dayPlan.title}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">{dayPlan.focus}</p>
                  </div>
                  <motion.div 
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-400"
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </div>

                {/* Expanded Content (Exercises) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-neutral-800/50 pt-4 space-y-3">
                        {dayPlan.exercises.map((exercise) => (
                          <div 
                            key={exercise.id}
                            className="bg-neutral-900/50 rounded-lg border border-neutral-800/80 p-3 relative group"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-sm font-medium text-white group-hover:text-cyber-green transition-colors">
                                {exercise.name}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                                  {exercise.sets} SETS
                                </span>
                                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-cyber-green/10 text-cyber-green border border-cyber-green/20">
                                  {exercise.reps}
                                </span>
                              </div>
                            </div>
                            
                            {/* Special Arm Wrestling Dropdown injection */}
                            {exercise.id === 'p5' ? (
                              <ArmWrestlingToggle notes={exercise.notes} />
                            ) : (
                              <p className="text-[11px] leading-relaxed text-neutral-400">
                                {exercise.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
