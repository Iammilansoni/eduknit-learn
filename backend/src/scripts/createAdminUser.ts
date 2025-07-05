import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import User from '../models/User';
import logger from '../config/logger';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('Connected to database');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      logger.info('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12'));
    const hashedPassword = await bcrypt.hash('Admin123!', salt);

    const adminUser = new User({
      username: 'admin',
      email: 'admin@eduknit.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      enrollmentStatus: 'active',
      isEmailVerified: true,
    });

    await adminUser.save();
    logger.info('Admin user created successfully');
    logger.info('Email: admin@eduknit.com');
    logger.info('Password: Admin123!');

    process.exit(0);
  } catch (error) {
    logger.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Create demo users
const createDemoUsers = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('Connected to database');

    // Create demo user
    const existingUser = await User.findOne({ email: 'user@eduknit.com' });
    if (!existingUser) {
      const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12'));
      const hashedPassword = await bcrypt.hash('User123!', salt);

      const demoUser = new User({
        username: 'demo_user',
        email: 'user@eduknit.com',
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'User',
        role: 'user',
        enrollmentStatus: 'active',
        isEmailVerified: true,
      });

      await demoUser.save();
      logger.info('Demo user created successfully');
    }

    // Create demo visitor
    const existingVisitor = await User.findOne({ email: 'visitor@eduknit.com' });
    if (!existingVisitor) {
      const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12'));
      const hashedPassword = await bcrypt.hash('Visitor123!', salt);

      const demoVisitor = new User({
        username: 'demo_visitor',
        email: 'visitor@eduknit.com',
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'Visitor',
        role: 'visitor',
        enrollmentStatus: 'active',
        isEmailVerified: true,
      });

      await demoVisitor.save();
      logger.info('Demo visitor created successfully');
    }

    logger.info('All demo users created successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error creating demo users:', error);
    process.exit(1);
  }
};

// Run based on command line argument
const command = process.argv[2];

if (command === 'admin') {
  createAdminUser();
} else if (command === 'demo') {
  createDemoUsers();
} else {
  logger.info('Usage: npm run create-admin or npm run create-demo');
  process.exit(1);
} 