import { Link, useLocation } from 'react-router-dom';
import { Activity, Dumbbell, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NavBar() {
  const location = useLocation();

  const navItems = [
    { name: 'Today', path: '/', icon: <Dumbbell className="w-5 h-5" /> },
    { name: 'Progress', path: '/progress', icon: <Activity className="w-5 h-5" /> },
    { name: 'Study', path: '/study', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'History', path: '/history', icon: <Clock className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Only (as per v2 plan) */}
      <nav className="fixed bottom-0 left-0 w-full bg-[var(--color-surface)]/80 backdrop-blur-xl border-t border-[var(--color-glass-border)] z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div key={item.name} whileTap={{ scale: 0.9 }} className="flex-1">
                <Link
                  to={item.path}
                  className={`flex flex-col items-center justify-center h-full space-y-1 transition-colors ${
                    isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  <div className={`p-1.5 rounded-full ${isActive ? 'bg-[var(--color-accent-muted)]' : 'bg-transparent'}`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>
    </>
  );
}
