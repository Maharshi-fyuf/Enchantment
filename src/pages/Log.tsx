import React, { useState } from 'react';
import { Activity, Dumbbell, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { logActivity } from '../services/api';

export default function Log() {
  const [type, setType] = useState('Run');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [workoutFocus, setWorkoutFocus] = useState('Upper Body');
  const [totalVolume, setTotalVolume] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await logActivity({
        type,
        distance: distance ? parseFloat(distance) : null,
        pace: time, // simplifed mapping for demo
        duration: time,
        workout_focus: workoutFocus,
        total_volume: totalVolume ? parseInt(totalVolume) : null,
        notes
      });
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDistance('');
        setTime('');
        setTotalVolume('');
        setNotes('');
      }, 2000);
    } catch (error) {
      console.error('Failed to save activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8 font-sans pb-24">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="mb-6 border-b border-neutral-800 pb-4">
        <h1 className="font-mono text-xl font-medium text-white flex items-center gap-2">
          {type === 'Run' ? <Activity size={20} className="text-cyber-green" /> : <Dumbbell size={20} className="text-cyber-green" />}
          Log Activity
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Record your latest physical training session
        </p>
      </header>

      {/* ── Toggle Widget ──────────────────────────────────────────────── */}
      <div className="flex bg-neutral-900 rounded-lg border border-neutral-800 p-1 mb-8">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setType('Run')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyber-green focus:ring-offset-1 focus:ring-offset-neutral-900 ${
            type === 'Run' 
              ? 'bg-neutral-800 text-white shadow-sm' 
              : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
          }`}
        >
          <Activity size={16} className={type === 'Run' ? 'text-cyber-green' : ''} />
          Run
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setType('Lift')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyber-green focus:ring-offset-1 focus:ring-offset-neutral-900 ${
            type === 'Lift' 
              ? 'bg-neutral-800 text-white shadow-sm' 
              : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
          }`}
        >
          <Dumbbell size={16} className={type === 'Lift' ? 'text-cyber-green' : ''} />
          Lift
        </motion.button>
      </div>

      {/* ── Input Form ─────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {type === 'Run' ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Distance (km)</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.1" 
                  required
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-cyber-green focus:ring-1 focus:ring-cyber-green transition-all" 
                  placeholder="5.0" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Time (mm:ss)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input 
                  type="text" 
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-cyber-green focus:ring-1 focus:ring-cyber-green transition-all" 
                  placeholder="25:00" 
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Workout Focus</label>
              <div className="relative">
                <select 
                  value={workoutFocus}
                  onChange={(e) => setWorkoutFocus(e.target.value)}
                  className="w-full appearance-none bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyber-green focus:ring-1 focus:ring-cyber-green transition-all">
                  <option>Upper Body</option>
                  <option>Lower Body</option>
                  <option>Full Body</option>
                  <option>Core</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">Total Volume (kg)</label>
              <input 
                type="number" 
                value={totalVolume}
                onChange={(e) => setTotalVolume(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-cyber-green focus:ring-1 focus:ring-cyber-green transition-all" 
                placeholder="4500" 
              />
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <label className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase flex items-center gap-1.5">
            <FileText size={12} /> Notes
          </label>
          <textarea 
            rows={3} 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-cyber-green focus:ring-1 focus:ring-cyber-green transition-all resize-none" 
            placeholder="How did the session feel?"
          ></textarea>
        </div>

        <motion.button 
          type="submit" 
          whileTap={{ scale: 0.95 }}
          disabled={isSubmitting || success}
          className={`w-full flex items-center justify-center gap-2 font-semibold text-sm py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyber-green focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-70 disabled:cursor-not-allowed mt-4 ${
            success 
              ? 'bg-neutral-800 text-cyber-green border border-cyber-green/50' 
              : 'bg-cyber-green text-neutral-900 hover:bg-[#00e600] shadow-[0_0_15px_rgba(0,255,0,0.1)] hover:shadow-[0_0_20px_rgba(0,255,0,0.2)]'
          }`}
        >
          {isSubmitting ? (
            <div className="h-4 w-4 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin"></div>
          ) : success ? (
            <>
              <CheckCircle2 size={16} />
              Saved!
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              Save Activity
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
