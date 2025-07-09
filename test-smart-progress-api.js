#!/usr/bin/env node

/**
 * Test script for Smart Progress Dashboard APIs
 * Run this after starting the backend server
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testData = {
  studentId: '507f1f77bcf86cd799439011', // Example ObjectId
  programmeId: '507f1f77bcf86cd799439012',
  moduleId: '507f1f77bcf86cd799439013',
  lessonId: '507f1f77bcf86cd799439014'
};

async function testAPI() {
  console.log('🧪 Testing Smart Progress Dashboard APIs...\n');

  try {
    // Test 1: Get dashboard data
    console.log('1. Testing dashboard endpoint...');
    try {
      const dashboardResponse = await axios.get(`${API_BASE}/progress/dashboard/${testData.studentId}`);
      console.log('✅ Dashboard endpoint working');
      console.log(`   Response: ${JSON.stringify(dashboardResponse.data).substring(0, 100)}...\n`);
    } catch (error) {
      console.log('❌ Dashboard endpoint failed:', error.response?.data?.message || error.message);
    }

    // Test 2: Get smart progress
    console.log('2. Testing smart progress endpoint...');
    try {
      const progressResponse = await axios.get(`${API_BASE}/progress/smart/${testData.programmeId}`);
      console.log('✅ Smart progress endpoint working');
      console.log(`   Response: ${JSON.stringify(progressResponse.data).substring(0, 100)}...\n`);
    } catch (error) {
      console.log('❌ Smart progress endpoint failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Test lesson completion
    console.log('3. Testing lesson completion endpoint...');
    try {
      const completionResponse = await axios.post(`${API_BASE}/progress/lesson/complete`, {
        studentId: testData.studentId,
        programmeId: testData.programmeId,
        moduleId: testData.moduleId,
        lessonId: testData.lessonId,
        timeSpent: 30
      });
      console.log('✅ Lesson completion endpoint working');
      console.log(`   Response: ${JSON.stringify(completionResponse.data).substring(0, 100)}...\n`);
    } catch (error) {
      console.log('❌ Lesson completion endpoint failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Test analytics overview
    console.log('4. Testing analytics overview endpoint...');
    try {
      const analyticsResponse = await axios.get(`${API_BASE}/analytics/overview`);
      console.log('✅ Analytics overview endpoint working');
      console.log(`   Response: ${JSON.stringify(analyticsResponse.data).substring(0, 100)}...\n`);
    } catch (error) {
      console.log('❌ Analytics overview endpoint failed:', error.response?.data?.message || error.message);
    }

    console.log('🎉 API testing complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Export for use in other scripts
module.exports = { testAPI, testData };

// Run if called directly
if (require.main === module) {
  testAPI();
}
