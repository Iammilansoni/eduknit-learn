import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

// Production user setup
async function setupProductionUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const salt = await bcrypt.genSalt(12);
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
    console.log('✅ Admin user created successfully');
    console.log('Email: admin@eduknit.com');
    console.log('Password: Admin123!');

    // Create demo student
    const studentHashedPassword = await bcrypt.hash('Student123!', salt);
    const studentUser = new User({
      username: 'student_demo',
      email: 'student@eduknit.com',
      password: studentHashedPassword,
      firstName: 'Demo',
      lastName: 'Student',
      role: 'student',
      enrollmentStatus: 'active',
      isEmailVerified: true,
    });

    await studentUser.save();
    console.log('✅ Demo student created successfully');
    console.log('Email: student@eduknit.com');
    console.log('Password: Student123!');

  } catch (error) {
    console.error('Error setting up users:', error);
  } finally {
    await mongoose.disconnect();
  }
}

setupProductionUsers();
