import { Link, useLocation } from 'react-router-dom';
import { Activity, Dumbbell, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NavBar() {
  const location = useLocation();

  const navItems = [
    { name: 'Feed', path: '/', icon: <Activity className="w-5 h-5" /> },
    { name: 'Log', path: '/log', icon: <Dumbbell className="w-5 h-5" /> },
    { name: 'Workout', path: '/workout', icon: <Dumbbell className="w-5 h-5" /> },
    { name: 'Study', path: '/study', icon: <BookOpen className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Desktop Top Navigation */}
      <nav className="hidden md:block fixed top-0 w-full bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-800 z-50 transition-all">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="text-cyber-green font-bold text-xl tracking-widest font-mono">
              ENCHANTMENT
            </div>
            <div className="flex space-x-6">
              {navItems.map((item) => (
                <motion.div key={item.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'text-cyber-green bg-cyber-green/10 shadow-[0_0_15px_rgba(0,255,0,0.05)]'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-neutral-900/85 backdrop-blur-xl border-t border-neutral-800 z-50 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div key={item.name} whileTap={{ scale: 0.9 }} className="flex-1">
                <Link
                  to={item.path}
                  className={`flex flex-col items-center justify-center h-full space-y-1 transition-colors ${
                    isActive ? 'text-cyber-green' : 'text-neutral-500'
                  }`}
                >
                  <div className={`p-1.5 rounded-full ${isActive ? 'bg-cyber-green/10' : 'bg-transparent'}`}>
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
