const axios = require('axios');

async function testDeleteAccount() {
  try {
    const response = await axios.post('http://localhost:5000/api/privacy/delete-account', {
      reason: 'Test deletion',
      password: 'wrongpassword',
      confirmText: 'DELETE MY ACCOUNT'
    }, {
      headers: {
        'Content-Type': 'application/json',
        // You'll need to add actual auth token here
        'Cookie': 'accessToken=your_token_here'
      }
    });
    
    console.log('Success:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Error Status:', error.response.status);
      console.log('Error Data:', error.response.data);
    } else {
      console.log('Network Error:', error.message);
    }
  }
}

testDeleteAccount();
