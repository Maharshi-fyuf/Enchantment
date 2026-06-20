# 30-Day Study Plan Tracker

A modular, dark-mode-ready React + Tailwind widget for the 30-day cybersecurity foundation curriculum.

## File structure

```
src/
├── data/
│   └── studyPlan.js          ← All 30 days of content + PILLAR_CONFIG
├── hooks/
│   └── useStudyProgress.js   ← All state logic (swap this to change persistence)
└── components/
    ├── StudyPlanTracker.jsx  ← Root orchestrator — import this in your app
    ├── PillarCard.jsx        ← Clickable pillar summary cards
    ├── DayTimeline.jsx       ← 30-dot visual timeline
    ├── FilterBar.jsx         ← Pillar filter buttons
    └── DayRow.jsx            ← Expandable accordion row per day
```

## Setup

### Prerequisites
- React 18+
- Tailwind CSS v3+

### Tailwind config

Add these paths to your `tailwind.config.js` content array so class scanning finds all classes:

```js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class', // or 'media' — both work
  theme: { extend: {} },
  plugins: [],
};
```

### Usage

Drop the component into any page:

```jsx
import StudyPlanTracker from './components/StudyPlanTracker';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <StudyPlanTracker />
    </div>
  );
}
```

## Connecting to your own backend

**All persistence logic lives in one place: `src/hooks/useStudyProgress.js`.**

By default, completed days are saved to `localStorage` under the key `studyPlanProgress_v1`.
To swap this for your own API, replace the two blocks labelled `PERSISTENCE LAYER` in that file:

```js
// ON MOUNT — load from your API
useEffect(() => {
  fetch('/api/progress', { credentials: 'include' })
    .then(r => r.json())
    .then(data => setCompletedDays(new Set(data.completedDays)));
}, []);

// ON CHANGE — save to your API
useEffect(() => {
  if (completedDays.size === 0) return; // skip initial empty render
  fetch('/api/progress', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completedDays: [...completedDays] }),
  });
}, [completedDays]);
```

Your API just needs to store and return an array of integers (the completed day numbers). Nothing else in the codebase changes.

## Customising the curriculum

Edit `src/data/studyPlan.js` only. The rest of the code reads from it automatically.

- **Add a day**: push a new object to the `STUDY_DAYS` array with `{ day, pillar, title, theory, lab, platform, platformUrl }`.
- **Change a pillar's colour**: update the Tailwind class strings in `PILLAR_CONFIG[id]`. All class names are written in full so Tailwind's scanner keeps them.
- **Add a fifth pillar**: add a new key to `PILLAR_CONFIG`, add a filter button in `FilterBar.jsx`, and a `PillarCard` in `StudyPlanTracker.jsx`.

## State shape (for backend schema design)

```json
{
  "completedDays": [1, 2, 5],
  "userId": "user_abc123"
}
```

That's the only data you need to persist per user. Everything else (titles, theory, lab content) is static and lives in `studyPlan.js`.
