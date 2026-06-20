import React from 'react';
import StudyPlanTracker from '../components/tracker/StudyPlanTracker';

export default function Study() {
  return (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto min-h-screen">
      {/* We wrap the StudyPlanTracker in our app's layout, maintaining dark mode background */}
      <div className="dark bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 overflow-hidden">
        <StudyPlanTracker />
      </div>
    </div>
  );
}
