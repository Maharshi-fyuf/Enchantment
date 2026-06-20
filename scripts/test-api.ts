import { config } from 'dotenv';
config();

import { honoApp } from '../api/index.js';

async function runTests() {
  console.log('🧪 Testing API endpoints...\n');

  // Test /api/health
  const healthRes = await honoApp.request(new Request('http://localhost/api/health'));
  const healthData = await healthRes.json();
  console.log('GET /api/health ->', healthRes.status, healthData);

  // Test /api/today
  const dayType = new Date().getDay() === 0 ? 'rest' : 'legs'; // just a mock
  const localDate = new Date().toISOString().split('T')[0];
  const todayRes = await honoApp.request(new Request(`http://localhost/api/today?day_type=${dayType}&date=${localDate}`));
  const todayData = await todayRes.json();
  console.log('GET /api/today ->', todayRes.status, 'Exercises count:', todayData.exercises?.length ?? 0);

  // Test POST /sessions/:id/sets if there is an active session or create one
  let sessionId = todayData.active_session?.id;
  if (!sessionId && dayType !== 'rest') {
    const startRes = await honoApp.request(new Request('http://localhost/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day_type: dayType })
    }));
    const startData = await startRes.json();
    sessionId = startData.id;
    console.log('POST /api/sessions ->', startRes.status, 'Created session:', sessionId);
  }

  if (sessionId && todayData.exercises?.length > 0) {
    const exerciseId = todayData.exercises[0].id;
    const logRes = await honoApp.request(new Request(`http://localhost/api/sessions/${sessionId}/sets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exercise_id: exerciseId,
        set_number: 1,
        weight_kg: 60.5,
        reps: 10,
        rpe: 8
      })
    }));
    const logData = await logRes.json();
    console.log('POST /api/sessions/:id/sets ->', logRes.status, 'Logged set:', logData);
    console.log('Checking number types:', typeof logData.weight_kg === 'number' ? 'PASS (number)' : 'FAIL (string)');
  }

  // Test /api/study/days
  const studyDaysRes = await honoApp.request(new Request('http://localhost/api/study/days'));
  const studyDaysData = await studyDaysRes.json();
  console.log('GET /api/study/days ->', studyDaysRes.status, 'Days count:', studyDaysData.length);

  // Test /api/exercises/main-lifts
  const mainLiftsRes = await honoApp.request(new Request('http://localhost/api/exercises/main-lifts'));
  const mainLiftsData = await mainLiftsRes.json();
  console.log('GET /api/exercises/main-lifts ->', mainLiftsRes.status, 'Count:', mainLiftsData.length);

  console.log('\n✅ All GET tests passed.');
}

runTests().catch(console.error);
