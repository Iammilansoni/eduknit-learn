// Test server startup
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db';
import { JWTUtils } from './src/config/jwt';

dotenv.config();

const app = express();

async function testServer() {
  try {
    console.log('Testing server startup...');
    
    // Test database connection
    console.log('Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Test JWT utilities
    console.log('Testing JWT utilities...');
    const testPayload = {
      user: {
        id: 'test123',
        role: 'student'
      }
    };
    
    const accessToken = JWTUtils.generateAccessToken(testPayload);
    console.log('✅ JWT utilities working correctly');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server started successfully on port ${PORT}`);
      console.log('All systems are working correctly!');
    });
    
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

testServer();
