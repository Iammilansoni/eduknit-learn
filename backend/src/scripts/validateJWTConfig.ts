import dotenv from 'dotenv';
import { JWTUtils, JWT_CONFIG } from '../config/jwt';

// Load environment variables
dotenv.config();

console.log('🔐 Validating JWT Configuration...\n');

// Check if all required environment variables are set
const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN'
];

console.log('📋 Environment Variables Check:');
let allEnvVarsSet = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${envVar.includes('SECRET') ? '***SET***' : value}`);
  } else {
    console.log(`❌ ${envVar}: NOT SET`);
    allEnvVarsSet = false;
  }
});

console.log('\n🔧 JWT Configuration Validation:');
const configValid = JWTUtils.validateConfig();
if (configValid) {
  console.log('✅ JWT Configuration is valid');
} else {
  console.log('❌ JWT Configuration is invalid');
  console.log('   - Check that JWT_SECRET and JWT_REFRESH_SECRET are at least 32 characters long');
}

console.log('\n📊 JWT Configuration Details:');
console.log(`   Access Token Expiration: ${JWT_CONFIG.ACCESS_TOKEN.EXPIRES_IN}`);
console.log(`   Refresh Token Expiration: ${JWT_CONFIG.REFRESH_TOKEN.EXPIRES_IN}`);
console.log(`   Algorithm: ${JWT_CONFIG.ACCESS_TOKEN.ALGORITHM}`);
console.log(`   Issuer: ${JWT_CONFIG.ACCESS_TOKEN.ISSUER}`);
console.log(`   Audience: ${JWT_CONFIG.ACCESS_TOKEN.AUDIENCE}`);

console.log('\n🍪 Cookie Configuration:');
console.log(`   Access Token Cookie: ${JWT_CONFIG.COOKIE.ACCESS_TOKEN_NAME}`);
console.log(`   Refresh Token Cookie: ${JWT_CONFIG.COOKIE.REFRESH_TOKEN_NAME}`);
console.log(`   HTTP Only: ${JWT_CONFIG.COOKIE.HTTP_ONLY}`);
console.log(`   Secure: ${JWT_CONFIG.COOKIE.SECURE}`);
console.log(`   Same Site: ${JWT_CONFIG.COOKIE.SAME_SITE}`);

// Test token generation
console.log('\n🧪 Testing Token Generation:');
try {
  const testPayload = {
    user: {
      id: 'test-user-id',
      role: 'user'
    }
  };

  const accessToken = JWTUtils.generateAccessToken(testPayload);
  const refreshToken = JWTUtils.generateRefreshToken(testPayload);
  
  console.log('✅ Access token generated successfully');
  console.log('✅ Refresh token generated successfully');
  
  // Test token verification
  const verifiedAccessPayload = JWTUtils.verifyAccessToken(accessToken);
  const verifiedRefreshPayload = JWTUtils.verifyRefreshToken(refreshToken);
  
  console.log('✅ Access token verification successful');
  console.log('✅ Refresh token verification successful');
  
  // Test token expiration check
  const isExpired = JWTUtils.isTokenExpired(accessToken);
  console.log(`✅ Token expiration check: ${isExpired ? 'EXPIRED' : 'VALID'}`);
  
  // Test token decoding
  const decodedAccess = JWTUtils.decodeToken(accessToken);
  const decodedRefresh = JWTUtils.decodeToken(refreshToken);
  
  console.log('✅ Token decoding successful');
  console.log(`   Access Token Payload: ${JSON.stringify(decodedAccess, null, 2)}`);
  console.log(`   Refresh Token Payload: ${JSON.stringify(decodedRefresh, null, 2)}`);
  
} catch (error: any) {
  console.log('❌ Token generation/verification failed:', error.message);
}

console.log('\n🎯 Summary:');
if (allEnvVarsSet && configValid) {
  console.log('✅ JWT Configuration is ready for production use');
  console.log('\n📝 Next Steps:');
  console.log('   1. Ensure your .env file contains all required variables');
  console.log('   2. Keep your JWT secrets secure and never commit them to version control');
  console.log('   3. Rotate your JWT secrets periodically in production');
  console.log('   4. Monitor token usage and expiration patterns');
} else {
  console.log('❌ JWT Configuration needs attention');
  console.log('\n🔧 Fix the issues above before proceeding');
  process.exit(1);
}

console.log('\n🚀 JWT Configuration validation complete!'); 