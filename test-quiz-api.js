/**
 * Test script to verify quiz functionality
 * Run this with: node test-quiz-api.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const LESSON_ID = '6871418b22d319e99ce98ff1';

async function testQuizAPI() {
    console.log('🧪 Testing Quiz API...\n');
    
    try {
        // Test 1: Check if lesson exists
        console.log('1️⃣ Testing lesson existence...');
        try {
            const lessonResponse = await axios.get(`${API_BASE}/lessons/${LESSON_ID}`);
            console.log('✅ Lesson found:', lessonResponse.data.data?.title || 'Unknown title');
        } catch (error) {
            console.log('❌ Lesson not found:', error.response?.status, error.response?.data?.message);
            return;
        }
        
        // Test 2: Check quiz endpoint without auth
        console.log('\n2️⃣ Testing quiz endpoint (no auth)...');
        try {
            const quizResponse = await axios.get(`${API_BASE}/quiz/lesson/${LESSON_ID}`);
            console.log('✅ Quiz found:', {
                success: quizResponse.data.success,
                questionCount: quizResponse.data.data?.questions?.length || 0,
                settings: quizResponse.data.data?.settings || 'No settings'
            });
        } catch (error) {
            console.log('❌ Quiz API error:', error.response?.status, error.response?.data?.message);
            
            if (error.response?.status === 401) {
                console.log('🔐 Authentication required - this is expected for students');
            }
        }
        
        // Test 3: Check programme lesson directly in DB format
        console.log('\n3️⃣ Testing raw lesson data...');
        try {
            const rawResponse = await axios.get(`${API_BASE}/lessons/${LESSON_ID}/raw`);
            console.log('✅ Raw lesson data available');
        } catch (error) {
            console.log('❌ Raw lesson data error:', error.response?.status);
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

// Test backend connectivity
async function testBackend() {
    console.log('🔌 Testing backend connectivity...\n');
    
    try {
        const healthResponse = await axios.get(`${API_BASE}/health`);
        console.log('✅ Backend is running:', healthResponse.data);
        
        await testQuizAPI();
        
    } catch (error) {
        console.log('❌ Backend not accessible:', error.message);
        console.log('💡 Make sure backend is running on http://localhost:5000');
    }
}

testBackend();
