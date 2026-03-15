const axios = require('axios');
const jwt = require('jsonwebtoken');

async function simulateSync() {
  const secret = 'super_secret_dev_key';
  // Create a mock user token
  const token = jwt.sign({ id: 'local_test_user' }, secret);
  const API_URL = 'http://localhost:3000';
  const now = new Date();
  const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  console.log(`Simulating sync for ${todayStr}...`);
  try {
    const res = await axios.post(`${API_URL}/api/scores/sync`, {
      date: todayStr,
      puzzleId: 'NUMBER_MATRIX',
      score: 450,
      timeTaken: 85,
      streakCount: 5,
      totalPoints: 2000
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Sync Response:', res.status, res.data.message);
    
    const lbRes = await axios.get(`${API_URL}/api/scores/leaderboard?date=${todayStr}`);
    console.log('Leaderboard Response:', lbRes.status, `Found ${lbRes.data.length} entries`);
    if (lbRes.data.length > 0) {
      console.log('First Entry:', lbRes.data[0].name, lbRes.data[0].score);
    }
  } catch (err) {
    console.error('Simulation failed:', err.response?.data || err.message);
  }
}

simulateSync();
