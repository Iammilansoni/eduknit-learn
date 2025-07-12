const mongoose = require('mongoose');
require('dotenv').config();

async function testAnalyticsEndpoint() {
  try {
    // Test the analytics endpoint
    const fetch = require('node-fetch');
    
    console.log('🔍 Testing analytics endpoint...');
    
    // First login to get authentication
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'milansoni96946@gmail.com',
        password: 'Milan@123'
      }),
    });
    
    const loginText = await loginResponse.text();
    console.log('Login status:', loginResponse.status);
    console.log('Login response:', loginText);
    
    if (loginResponse.status === 200) {
      // Extract cookies for authentication
      const cookies = loginResponse.headers.get('set-cookie');
      console.log('Cookies received:', cookies);
      
      // Test analytics endpoint
      const analyticsResponse = await fetch('http://localhost:5000/api/analytics/student', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies || ''
        },
      });
      
      const analyticsText = await analyticsResponse.text();
      console.log('\n📊 Analytics endpoint status:', analyticsResponse.status);
      console.log('Analytics response:', analyticsText);
      
      if (analyticsResponse.status === 200) {
        try {
          const analyticsData = JSON.parse(analyticsText);
          console.log('\n✅ Analytics data structure:', JSON.stringify(analyticsData, null, 2));
        } catch (e) {
          console.log('Response is not valid JSON');
        }
      }
    } else {
      console.log('❌ Login failed, cannot test analytics');
    }
    
  } catch (error) {
    console.error('❌ Error testing analytics:', error.message);
  }
}

testAnalyticsEndpoint();
