const https = require('http');

// Test the admin modules endpoint
async function testModulesEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/modules?page=1&limit=10',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response Headers:', res.headers);
        
        try {
          const jsonData = JSON.parse(data);
          console.log('Response Body:', JSON.stringify(jsonData, null, 2));
          resolve(jsonData);
        } catch (error) {
          console.log('Raw Response Body:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request Error:', error);
      reject(error);
    });

    req.end();
  });
}

testModulesEndpoint()
  .then(() => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
