const axios = require('axios');

async function testEnrollEndpoint() {
  console.log('Testing backend server...');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health endpoint working:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health endpoint failed:', error.message);
    return;
  }

  try {
    // Test student test endpoint (no auth required)
    console.log('2. Testing student test endpoint...');
    const testResponse = await axios.get('http://localhost:5000/api/student/test');
    console.log('✅ Student test endpoint working:', testResponse.data);
  } catch (error) {
    console.log('❌ Student test endpoint failed:', error.message);
    console.log('Error details:', error.response?.data || error.message);
  }

  try {
    // Test enroll endpoint (auth required - should get 401)
    console.log('3. Testing enroll endpoint without auth...');
    const enrollResponse = await axios.post('http://localhost:5000/api/student/enroll', {
      programmeId: 'test123'
    });
    console.log('✅ Enroll endpoint response:', enrollResponse.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Enroll endpoint working (401 expected):', error.response.data);
    } else {
      console.log('❌ Enroll endpoint failed:', error.message);
      console.log('Error details:', error.response?.data || error.message);
    }
  }
}

testEnrollEndpoint();
