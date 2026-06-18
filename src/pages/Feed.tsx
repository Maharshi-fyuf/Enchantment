import { Activity, Dumbbell } from 'lucide-react';

export default function Feed() {
  const activities = [
    { id: 1, type: 'Run', distance: '5.0 km', pace: '4:30 /km', time: '22:30', user: 'Alex' },
    { id: 2, type: 'Lift', workout: 'Upper Body', weight: '4500 kg', time: '1h 15m', user: 'Sam' },
    { id: 3, type: 'Study', module: 'Network Security', score: '95%', time: '45m', user: 'Alex' },
  ];

  return (
    <div className="parallax-wrapper">
      {/* Background layer moving slower */}
      <div className="parallax-layer-back absolute inset-0 flex items-center justify-center opacity-10">
        <div className="w-[800px] h-[800px] bg-cyber-green rounded-full blur-[120px]"></div>
      </div>

      {/* Foreground layer moving at normal speed */}
      <div className="parallax-layer-base pt-24 pb-12 px-4 max-w-2xl mx-auto relative min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-cyber-green">Recent Activity</h1>
        
        <div className="space-y-6">
          {activities.map((act) => (
            <div key={act.id} className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 p-6 rounded-xl shadow-lg hover:border-cyber-green/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-neutral-900 p-2 rounded-full text-cyber-green">
                    {act.type === 'Run' ? <Activity /> : <Dumbbell />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{act.user} <span className="text-neutral-400 font-normal">completed a {act.type}</span></h3>
                  </div>
                </div>
                <span className="text-sm text-neutral-500">2h ago</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 bg-neutral-900/50 rounded-lg p-4">
                {act.type === 'Run' && (
                  <>
                    <div><div className="text-neutral-400 text-sm">Distance</div><div className="text-xl font-semibold text-white">{act.distance}</div></div>
                    <div><div className="text-neutral-400 text-sm">Pace</div><div className="text-xl font-semibold text-white">{act.pace}</div></div>
                    <div><div className="text-neutral-400 text-sm">Time</div><div className="text-xl font-semibold text-white">{act.time}</div></div>
                  </>
                )}
                {act.type === 'Lift' && (
                  <>
                    <div><div className="text-neutral-400 text-sm">Workout</div><div className="text-xl font-semibold text-white">{act.workout}</div></div>
                    <div><div className="text-neutral-400 text-sm">Volume</div><div className="text-xl font-semibold text-white">{act.weight}</div></div>
                    <div><div className="text-neutral-400 text-sm">Time</div><div className="text-xl font-semibold text-white">{act.time}</div></div>
                  </>
                )}
                {act.type === 'Study' && (
                  <>
                    <div><div className="text-neutral-400 text-sm">Module</div><div className="text-xl font-semibold text-white">{act.module}</div></div>
                    <div><div className="text-neutral-400 text-sm">Score</div><div className="text-xl font-semibold text-white">{act.score}</div></div>
                    <div><div className="text-neutral-400 text-sm">Time</div><div className="text-xl font-semibold text-white">{act.time}</div></div>
                  </>
                )}
              </div>
            </div>
          ))}
          {/* Duplicate to make it scrollable to see parallax */}
          {activities.map((act) => (
            <div key={`dup-${act.id}`} className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 p-6 rounded-xl shadow-lg hover:border-cyber-green/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-neutral-900 p-2 rounded-full text-cyber-green">
                    {act.type === 'Run' ? <Activity /> : <Dumbbell />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{act.user} <span className="text-neutral-400 font-normal">completed a {act.type}</span></h3>
                  </div>
                </div>
                <span className="text-sm text-neutral-500">Yesterday</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
