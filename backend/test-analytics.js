const axios = require('axios');

// Test the analytics endpoint directly
async function testAnalyticsEndpoint() {
  try {
    // You'll need to replace this with a valid JWT token
    const token = 'your-jwt-token-here';
    
    const response = await axios.get('http://localhost:8000/api/analytics/student', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Analytics Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Error calling analytics endpoint:');
    console.error(error.response?.data || error.message);
  }
}

// Alternative test without authentication (for debugging)
async function testAnalyticsEndpointNoAuth() {
  try {
    const response = await axios.get('http://localhost:8000/api/analytics/student');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error (expected - no auth):');
    console.error(error.response?.status, error.response?.data);
  }
}

console.log('Testing analytics endpoint...');
testAnalyticsEndpointNoAuth();
