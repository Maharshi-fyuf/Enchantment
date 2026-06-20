import React, { useState, useEffect, useRef } from 'react';
import { Activity, Dumbbell, BookOpen, Trash2, CheckCircle } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { getActivities } from '../services/api';

const SpotlightCard = ({ children, className = "" }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(0,255,0,.1), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};

export default function Feed() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getActivities();
      setActivities(data);
      setLoading(false);
    }
    load();
  }, []);

  const removeActivity = (id) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    // In a real app we'd also call deleteActivity API here
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 150, damping: 20 }
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  const ProgressRing = ({ progress, label, colorClass, icon: Icon }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <SpotlightCard className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 rounded-lg p-4 w-full cursor-pointer">
        <div className="relative flex items-center justify-center">
          <svg className="transform -rotate-90 w-[80px] h-[80px]">
            <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-neutral-800" />
            <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className={`transition-all duration-1000 ease-out ${colorClass}`} />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
             <Icon size={16} className={colorClass} />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">{label}</span>
          <span className="text-xl font-medium text-white">{progress}%</span>
          <span className="text-xs text-neutral-400 mt-1">Weekly goal</span>
        </div>
      </SpotlightCard>
    );
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 font-sans pb-24">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="mb-6 border-b border-neutral-800 pb-4">
        <h1 className="font-mono text-xl font-medium text-white flex items-center gap-2">
          <Activity size={20} className="text-cyber-green" />
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Weekly activity summary & live feed
        </p>
      </header>

      {/* ── Weekly Summary ─────────────────────────────────────────────── */}
      <section aria-label="Weekly Summary" className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          <ProgressRing progress={85} label="Workouts" colorClass="text-cyber-green" icon={Dumbbell} />
          <ProgressRing progress={60} label="Study Modules" colorClass="text-blue-500" icon={BookOpen} />
        </div>
      </section>

      {/* ── Feed ───────────────────────────────────────────────────────── */}
      <section aria-label="Activity Feed">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-2">
          <span>Timeline</span>
          <div className="h-px bg-neutral-800 flex-1"></div>
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-cyber-green border-t-transparent animate-spin"></div>
          </div>
        ) : activities.length === 0 ? (
          <p className="text-center text-sm text-neutral-500 py-12">No activities logged yet.</p>
        ) : (
          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent overflow-x-hidden">
            <AnimatePresence>
              {activities.map((act) => {
                const dateStr = new Date(act.created_at).toLocaleString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
                return (
                  <motion.div 
                    key={act.id}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    exit="exit"
                    viewport={{ once: true, amount: 0.1 }}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                  >
                    {/* Timeline Marker */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-neutral-800 bg-neutral-900 text-neutral-500 group-hover:text-cyber-green group-hover:border-cyber-green/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-300 z-10 pointer-events-none">
                      {act.type === 'run' && <Activity size={16} />}
                      {act.type === 'lift' && <Dumbbell size={16} />}
                      {act.type === 'study' && <BookOpen size={16} />}
                    </div>
                    
                    {/* Swipeable Card Wrapper */}
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] relative">
                      {/* Swipe Background Action Indicators */}
                      <div className="absolute inset-0 flex items-center justify-between px-4 bg-neutral-800 rounded-lg">
                        <div className="text-cyber-green flex items-center gap-2"><CheckCircle size={16} /> <span className="text-xs font-medium">Archive</span></div>
                        <div className="text-red-500 flex items-center gap-2"><span className="text-xs font-medium">Delete</span> <Trash2 size={16} /></div>
                      </div>

                      <motion.div 
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.8}
                        whileTap={{ scale: 0.98, cursor: "grabbing" }}
                        onDragEnd={(event, info) => {
                          if (info.offset.x < -100 || info.offset.x > 100) {
                            removeActivity(act.id);
                          }
                        }}
                        className="relative z-10 bg-neutral-900 rounded-lg border border-neutral-800 cursor-grab"
                      >
                        <SpotlightCard className="p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-mono text-[10px] tracking-wider text-neutral-500">{dateStr}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                              act.type === 'study' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-cyber-green/10 text-cyber-green border-cyber-green/20'
                            }`}>
                              {act.type.toUpperCase()}
                            </span>
                          </div>
                          
                          <p className="text-sm font-medium leading-tight text-white mb-3">
                            <span className="text-neutral-400">{act.user || 'You'}</span> completed {act.type === 'lift' ? act.workout_focus : act.type === 'study' ? act.module : `a ${act.distance}km run`}
                          </p>
                          
                          {/* Metrics */}
                          <div className="flex items-center gap-4 border-t border-neutral-800/50 pt-3">
                            {act.type === 'run' && (
                              <>
                                <div className="flex flex-col"><span className="font-mono text-[9px] text-neutral-500 uppercase">Dist</span><span className="text-xs font-medium text-white">{act.distance}</span></div>
                                <div className="flex flex-col"><span className="font-mono text-[9px] text-neutral-500 uppercase">Pace</span><span className="text-xs font-medium text-white">{act.pace}</span></div>
                                <div className="flex flex-col"><span className="font-mono text-[9px] text-neutral-500 uppercase">Time</span><span className="text-xs font-medium text-white">{act.duration}</span></div>
                              </>
                            )}
                            {act.type === 'lift' && (
                              <>
                                <div className="flex flex-col"><span className="font-mono text-[9px] text-neutral-500 uppercase">Workout</span><span className="text-xs font-medium text-white">{act.workout_focus}</span></div>
                                <div className="flex flex-col"><span className="font-mono text-[9px] text-neutral-500 uppercase">Vol</span><span className="text-xs font-medium text-white">{act.total_volume}</span></div>
                              </>
                            )}
                            {act.notes && (
                              <div className="flex flex-col flex-1 overflow-hidden"><span className="font-mono text-[9px] text-neutral-500 uppercase">Notes</span><span className="text-xs font-medium text-white truncate">{act.notes}</span></div>
                            )}
                          </div>
                        </SpotlightCard>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
