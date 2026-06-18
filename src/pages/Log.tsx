import { useState } from 'react';

export default function Log() {
  const [type, setType] = useState('Run');

  return (
    <div className="pt-24 pb-12 px-4 max-w-xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-cyber-green">Log Activity</h1>
      
      <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
        <div className="flex space-x-4 mb-8">
          <button 
            onClick={() => setType('Run')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${type === 'Run' ? 'bg-cyber-green text-neutral-900' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
          >
            Run
          </button>
          <button 
            onClick={() => setType('Lift')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${type === 'Lift' ? 'bg-cyber-green text-neutral-900' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
          >
            Lift
          </button>
        </div>

        <form className="space-y-6">
          {type === 'Run' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Distance (km)</label>
                <input type="number" step="0.1" className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyber-green transition-colors" placeholder="e.g. 5.0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Time (mm:ss)</label>
                <input type="text" className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyber-green transition-colors" placeholder="e.g. 25:00" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Workout Focus</label>
                <select className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyber-green transition-colors">
                  <option>Upper Body</option>
                  <option>Lower Body</option>
                  <option>Full Body</option>
                  <option>Core</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Total Volume (kg)</label>
                <input type="number" className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyber-green transition-colors" placeholder="e.g. 4500" />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Notes</label>
            <textarea rows={3} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyber-green transition-colors" placeholder="How did it feel?"></textarea>
          </div>

          <button type="submit" className="w-full bg-cyber-green text-neutral-900 font-bold text-lg py-4 rounded-lg hover:bg-[#00e600] transition-colors shadow-[0_0_15px_rgba(0,255,0,0.3)] hover:shadow-[0_0_25px_rgba(0,255,0,0.5)]">
            Save Activity
          </button>
        </form>
      </div>
    </div>
  );
}
