const axios = require('axios');

async function testAnalyticsEndpoint() {
  try {
    console.log('Testing analytics endpoint...');
    
    // First, try to login as a student
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'student@example.com', // You might need to use a real student email
      password: 'password123'
    });
    
    console.log('Login response:', loginResponse.data);
    
    if (loginResponse.data.token) {
      // Try to get analytics with the token
      const analyticsResponse = await axios.get('http://localhost:3000/api/student/analytics', {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      
      console.log('Analytics response:', analyticsResponse.data);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAnalyticsEndpoint();
