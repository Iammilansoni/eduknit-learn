import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import User from '../models/User';
import logger from '../config/logger';

dotenv.config();

const createStudentUser = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('Connected to database');

    // Check if student user already exists
    const existingStudent = await User.findOne({ email: 'student@eduknit.com' });
    if (existingStudent) {
      logger.info('Student user already exists');
      process.exit(0);
    }

    // Create student user
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12'));
    const hashedPassword = await bcrypt.hash('Student123!', salt);

    const studentUser = new User({
      username: 'demo_student',
      email: 'student@eduknit.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'Student',
      role: 'student',
      enrollmentStatus: 'active',
      isEmailVerified: true,
    });

    await studentUser.save();
    logger.info('✅ Student user created successfully');
    logger.info('Email: student@eduknit.com');
    logger.info('Password: Student123!');

    process.exit(0);
  } catch (error) {
    logger.error('Error creating student user:', error);
    process.exit(1);
  }
};

createStudentUser();
