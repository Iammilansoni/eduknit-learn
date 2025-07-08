const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('Testing JWT configuration...');

// Test environment variables
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_REFRESH_SECRET exists:', !!process.env.JWT_REFRESH_SECRET);
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);

try {
  const testPayload = {
    user: {
      id: 'test123',
      role: 'student'
    }
  };

  console.log('Generating access token...');
  const accessToken = jwt.sign(testPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    algorithm: 'HS256',
    issuer: process.env.JWT_ISSUER || 'eduknit-learn',
    audience: process.env.JWT_AUDIENCE || 'eduknit-learn-users'
  });
  console.log('✅ Access token generated successfully');

  console.log('Verifying access token...');
  const verifiedPayload = jwt.verify(accessToken, process.env.JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: process.env.JWT_ISSUER || 'eduknit-learn',
    audience: process.env.JWT_AUDIENCE || 'eduknit-learn-users'
  });
  console.log('✅ Access token verified successfully');

  console.log('JWT configuration is working correctly!');
} catch (error) {
  console.error('❌ JWT configuration error:', error);
}
