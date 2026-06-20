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
  const todayRes = await honoApp.request(new Request('http://localhost/api/today'));
  const todayData = await todayRes.json();
  console.log('GET /api/today ->', todayRes.status, 'Exercises count:', todayData.exercises?.length ?? 0);

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
