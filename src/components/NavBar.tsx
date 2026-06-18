import { Link, useLocation } from 'react-router-dom';
import { Activity, Dumbbell, BookOpen } from 'lucide-react';

export default function NavBar() {
  const location = useLocation();

  const navItems = [
    { name: 'Feed', path: '/', icon: <Activity className="w-5 h-5" /> },
    { name: 'Log', path: '/log', icon: <Dumbbell className="w-5 h-5" /> },
    { name: 'Study', path: '/study', icon: <BookOpen className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed top-0 w-full bg-neutral-900/80 backdrop-blur-md border-b border-cyber-green/20 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="text-cyber-green font-bold text-xl tracking-wider">
            ENCHANTMENT
          </div>
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-cyber-green bg-cyber-green/10'
                    : 'text-gray-300 hover:text-cyber-green hover:bg-cyber-green/5'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
