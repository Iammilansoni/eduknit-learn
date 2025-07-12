// Simple registration test to help debug the 409 error
// Run this in the browser console on the registration page

async function testRegistration() {
  try {
    console.log('Testing registration with random email...');
    
    const randomId = Date.now();
    const testData = {
      username: `testuser${randomId}`,
      email: `test${randomId}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'student'
    };
    
    console.log('Test data:', testData);
    
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(testData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const result = await response.text();
    console.log('Response body:', result);
    
    if (response.status === 409) {
      console.log('🔴 409 Conflict: Email or username already exists');
      try {
        const jsonResult = JSON.parse(result);
        console.log('Error message:', jsonResult.message);
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
    } else if (response.status === 201) {
      console.log('✅ Registration successful');
    } else {
      console.log('❌ Unexpected status code:', response.status);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Also test with a known conflicting email
async function testWithExistingEmail() {
  try {
    console.log('Testing with potentially existing email...');
    
    const testData = {
      username: 'admin123',
      email: 'admin@example.com', // This might already exist
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'student'
    };
    
    console.log('Test data:', testData);
    
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(testData)
    });
    
    console.log('Response status:', response.status);
    const result = await response.text();
    console.log('Response body:', result);
    
    if (response.status === 409) {
      console.log('🔴 409 Conflict confirmed: Email or username already exists');
      try {
        const jsonResult = JSON.parse(result);
        console.log('Error message:', jsonResult.message);
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

console.log('Registration debug functions loaded!');
console.log('Run testRegistration() to test with a unique email');
console.log('Run testWithExistingEmail() to test with a potentially existing email');
