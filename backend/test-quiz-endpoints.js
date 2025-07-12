// Test the quiz endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const lessonId = '6871418b22d319e99ce98ff1';

// First, get a valid JWT token (using demo credentials)
async function getAuthToken() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student@demo.com',
      password: 'demo123'
    });
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data);
    return null;
  }
}

async function testQuizEndpoints() {
  console.log('🧪 Testing Quiz Endpoints...\n');
  
  const token = await getAuthToken();
  if (!token) {
    console.log('❌ Could not get auth token');
    return;
  }
  
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    // Test 1: Get lesson quiz
    console.log('1️⃣ Testing GET /quiz/lesson/' + lessonId);
    const quizResponse = await axios.get(`${BASE_URL}/quiz/lesson/${lessonId}`, { headers });
    console.log('✅ Quiz retrieved successfully');
    console.log(`   - Quiz has ${quizResponse.data.data.questions.length} questions`);
    console.log(`   - Max score: ${quizResponse.data.data.maxScore}`);
    console.log(`   - Time limit: ${quizResponse.data.data.settings.timeLimit} minutes\n`);
    
    // Test 2: Start quiz attempt
    console.log('2️⃣ Testing POST /quiz/lesson/' + lessonId + '/start');
    const startResponse = await axios.post(`${BASE_URL}/quiz/lesson/${lessonId}/start`, {}, { headers });
    console.log('✅ Quiz attempt started successfully');
    const attemptId = startResponse.data.data.attemptId;
    console.log(`   - Attempt ID: ${attemptId}`);
    console.log(`   - Attempt number: ${startResponse.data.data.attemptNumber}\n`);
    
    // Test 3: Submit quiz attempt
    console.log('3️⃣ Testing POST /quiz/attempt/' + attemptId + '/submit');
    const answers = [
      { questionId: 'q1', answer: 'To share information clearly and build understanding', timeSpent: 30 },
      { questionId: 'q2', answer: false, timeSpent: 15 },
      { questionId: 'q3', answer: 'Body language, facial expressions, tone of voice', timeSpent: 45 },
      { questionId: 'q4', answer: 'Clear articulation', timeSpent: 25 },
      { questionId: 'q5', answer: true, timeSpent: 20 }
    ];
    
    const submitResponse = await axios.post(`${BASE_URL}/quiz/attempt/${attemptId}/submit`, { answers }, { headers });
    console.log('✅ Quiz submitted successfully');
    console.log(`   - Score: ${submitResponse.data.data.score}/${submitResponse.data.data.maxScore}`);
    console.log(`   - Percentage: ${submitResponse.data.data.percentage}%`);
    console.log(`   - Grade: ${submitResponse.data.data.gradeLetter}`);
    console.log(`   - Passed: ${submitResponse.data.data.isPassed ? 'Yes' : 'No'}\n`);
    
    // Test 4: Get quiz results
    console.log('4️⃣ Testing GET /quiz/attempt/' + attemptId + '/results');
    const resultsResponse = await axios.get(`${BASE_URL}/quiz/attempt/${attemptId}/results`, { headers });
    console.log('✅ Quiz results retrieved successfully');
    console.log(`   - Feedback: ${resultsResponse.data.data.feedback}`);
    console.log(`   - Can retake: ${resultsResponse.data.data.canRetake ? 'Yes' : 'No'}\n`);
    
    console.log('🎉 All quiz endpoints working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testQuizEndpoints();
