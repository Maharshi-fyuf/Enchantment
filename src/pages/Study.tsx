import { CheckCircle, Circle } from 'lucide-react';
import { useState } from 'react';

export default function Study() {
  const [modules, setModules] = useState([
    { id: 1, title: 'Network Security Fundamentals', completed: true },
    { id: 2, title: 'Cryptography 101', completed: false },
    { id: 3, title: 'Web Application Vulnerabilities', completed: false },
    { id: 4, title: 'Incident Response & Forensics', completed: false },
    { id: 5, title: 'Cloud Security Architectures', completed: false },
  ]);

  const toggleModule = (id: number) => {
    setModules(modules.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const progress = Math.round((modules.filter(m => m.completed).length / modules.length) * 100);

  return (
    <div className="pt-24 pb-12 px-4 max-w-2xl mx-auto min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold text-cyber-green m-0">Study Modules</h1>
        <div className="text-xl font-mono text-white bg-neutral-800 px-4 py-2 rounded-lg border border-neutral-700">
          {progress}%
        </div>
      </div>

      <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 mb-8">
        <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-cyber-green transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,255,0,0.5)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="space-y-4">
          {modules.map((mod) => (
            <div 
              key={mod.id} 
              onClick={() => toggleModule(mod.id)}
              className="flex items-center space-x-4 p-4 rounded-lg bg-neutral-900/50 border border-neutral-700/50 hover:border-cyber-green/50 cursor-pointer transition-colors group"
            >
              <div className="text-cyber-green">
                {mod.completed ? (
                  <CheckCircle className="w-6 h-6 fill-cyber-green/20" />
                ) : (
                  <Circle className="w-6 h-6 text-neutral-500 group-hover:text-cyber-green/50 transition-colors" />
                )}
              </div>
              <div className={`font-medium text-lg ${mod.completed ? 'text-neutral-400 line-through' : 'text-white'}`}>
                {mod.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
