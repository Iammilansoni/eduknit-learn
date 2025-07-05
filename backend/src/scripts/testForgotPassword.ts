import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';
import User from '../models/User';
import emailService from '../services/emailService';
import logger from '../config/logger';

async function testForgotPasswordFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit');
    logger.info('Connected to MongoDB');

    // Test email service connection
    const isEmailServiceWorking = await emailService.testConnection();
    if (!isEmailServiceWorking) {
      logger.error('Email service is not working. Please check SMTP configuration.');
      return;
    }
    logger.info('Email service connection test passed');

    // Check if we have any users in the system
    const userCount = await User.countDocuments();
    logger.info(`Total users in system: ${userCount}`);

    if (userCount === 0) {
      logger.info('No users found. The forgot password flow requires existing users.');
      return;
    }

    // List some users (without passwords)
    const users = await User.find({}, 'email username role isEmailVerified').limit(5);
    logger.info('Sample users:');
    users.forEach(user => {
      logger.info(`  - ${user.email} (${user.username}) - Role: ${user.role} - Verified: ${user.isEmailVerified}`);
    });

    logger.info('\nForgot password flow setup is ready!');
    logger.info('You can test the flow by:');
    logger.info('1. Going to http://localhost:5173/forgot-password');
    logger.info('2. Entering an email address from the list above');
    logger.info('3. Checking your email for the reset link');
    logger.info('4. Following the reset link to http://localhost:5173/reset-password?token=...');

  } catch (error) {
    logger.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

testForgotPasswordFlow();
