// Simple test to check if the enrollment endpoint exists
// Run this in browser console while on the frontend

console.log('🔍 Testing enrollment endpoint...');

// Test the /test endpoint first to verify routing
fetch('/api/student/test')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Test endpoint response:', data);
    
    // Now test the enrollment endpoint
    return fetch('/api/student/enroll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ programmeId: '686eaa88199d34040b718dc4' }),
      credentials: 'include'
    });
  })
  .then(response => {
    console.log('📊 Enrollment endpoint status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📝 Enrollment endpoint response:', data);
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });
