// Test backend connectivity
const testBackend = async () => {
  try {
    console.log('Testing backend connectivity...');
    
    // Test direct connection to backend
    const response = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Backend is running and responding:', data);
    } else {
      console.log('Backend responded with error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Backend connection failed:', error);
    console.log('Please check:');
    console.log('1. Backend server is running on port 5000');
    console.log('2. MongoDB is running');
    console.log('3. No firewall blocking the connection');
  }
};

testBackend();
