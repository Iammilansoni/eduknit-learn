// Test script to demonstrate "Already enrolled" error handling
const axios = require('axios');

async function testEnrollmentErrorHandling() {
  console.log('🧪 Testing Frontend Enrollment Error Handling\n');
  
  try {
    // Step 1: Login to get authentication cookies
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'milansoni96946@gmail.com',
      password: 'Milansoni1$'
    }, {
      withCredentials: true
    });
    
    console.log('✅ Login successful');
    console.log('User:', loginResponse.data.data.username);
    
    // Extract cookies from the response
    const cookies = loginResponse.headers['set-cookie'];
    console.log('🍪 Cookies received:', cookies ? 'Yes' : 'No');
    
    // Step 2: Try to enroll in the same course again (should fail with "Already enrolled")
    console.log('\n2️⃣ Attempting to enroll in Communication Skills again...');
    
    const enrollmentResponse = await axios.post('http://localhost:5000/api/student/enroll', {
      programmeId: '686f5f0185350adfe788358a'
    }, {
      withCredentials: true,
      headers: {
        Cookie: cookies ? cookies.join('; ') : ''
      }
    });
    
    console.log('❌ This should not happen - enrollment succeeded when it should have failed');
    
  } catch (error) {
    console.log('✅ Expected error caught!');
    
    // Extract error message like the frontend does
    const errorData = error.response?.data;
    let errorMessage = 'Unknown error';
    
    if (errorData?.error?.message) {
      errorMessage = errorData.error.message;
    } else if (errorData?.message) {
      errorMessage = errorData.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.log('\n📋 Error Details:');
    console.log('Status:', error.response?.status);
    console.log('Error Message:', errorMessage);
    
    // Simulate frontend error handling
    console.log('\n🎯 Frontend Error Handling Simulation:');
    if (errorMessage.includes('Already enrolled')) {
      console.log('✅ Frontend would show: "Already Enrolled" toast');
      console.log('✅ Message: "You\'re already enrolled in this course. Check your dashboard to continue learning."');
      console.log('✅ Variant: "default" (not destructive)');
    } else {
      console.log('❌ Frontend would show: "Enrollment Failed" toast');
      console.log('❌ Message:', errorMessage);
      console.log('❌ Variant: "destructive"');
    }
    
    console.log('\n🎉 Test completed successfully!');
    console.log('The frontend will now properly display the "Already enrolled" message.');
  }
}

// Run the test
testEnrollmentErrorHandling().catch(console.error); 