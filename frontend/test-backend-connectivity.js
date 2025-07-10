// Test script to verify backend connectivity and enrollment endpoint
// Run this in the browser console on the frontend

async function testBackendConnectivity() {
  console.log('🔍 Testing backend connectivity...');
  
  try {
    // Test 1: Check if frontend can reach backend through proxy
    console.log('1. Testing health endpoint through proxy...');
    const healthResponse = await fetch('/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint response:', healthData);
  } catch (error) {
    console.log('❌ Health endpoint failed:', error);
    return;
  }

  try {
    // Test 2: Check if student test endpoint works
    console.log('2. Testing student test endpoint...');
    const testResponse = await fetch('/api/student/test');
    const testData = await testResponse.json();
    console.log('✅ Student test endpoint response:', testData);
  } catch (error) {
    console.log('❌ Student test endpoint failed:', error);
  }

  try {
    // Test 3: Check enrollment endpoint without auth (should get 401)
    console.log('3. Testing enrollment endpoint without auth...');
    const enrollResponse = await fetch('/api/student/enroll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ programmeId: '686eaa88199d34040b718dc4' }),
      credentials: 'include'
    });
    const enrollData = await enrollResponse.json();
    
    if (enrollResponse.status === 401) {
      console.log('✅ Enrollment endpoint working (401 expected):', enrollData);
    } else {
      console.log('⚠️ Unexpected response from enrollment endpoint:', enrollData);
    }
  } catch (error) {
    console.log('❌ Enrollment endpoint test failed:', error);
  }

  // Test 4: Check current user state
  console.log('4. Checking current user state...');
  const userString = localStorage.getItem('user');
  if (userString) {
    const user = JSON.parse(userString);
    console.log('✅ User logged in:', { id: user.id, role: user.role, email: user.email });
    
    // Test 5: Try enrollment with authentication
    try {
      console.log('5. Testing enrollment with authentication...');
      const authEnrollResponse = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ programmeId: '686eaa88199d34040b718dc4' }),
        credentials: 'include'
      });
      const authEnrollData = await authEnrollResponse.json();
      console.log('✅ Authenticated enrollment response:', authEnrollData);
    } catch (error) {
      console.log('❌ Authenticated enrollment failed:', error);
    }
  } else {
    console.log('⚠️ No user logged in');
  }
}

// Run the test
testBackendConnectivity();
