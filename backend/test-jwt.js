// Simple test to verify JWT functions work
import { JWTUtils } from './src/config/jwt';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing JWT configuration...');

try {
  const testPayload = {
    user: {
      id: 'test123',
      role: 'student'
    }
  };

  console.log('Generating access token...');
  const accessToken = JWTUtils.generateAccessToken(testPayload);
  console.log('✅ Access token generated successfully');

  console.log('Generating refresh token...');
  const refreshToken = JWTUtils.generateRefreshToken(testPayload);
  console.log('✅ Refresh token generated successfully');

  console.log('Verifying access token...');
  const verifiedPayload = JWTUtils.verifyAccessToken(accessToken);
  console.log('✅ Access token verified successfully');

  console.log('JWT configuration is working correctly!');
} catch (error) {
  console.error('❌ JWT configuration error:', error);
}
