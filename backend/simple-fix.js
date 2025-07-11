console.log('Starting user role fix script...');

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';
console.log('MongoDB URI:', MONGODB_URI);

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    // Find admin user
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    console.log('Looking for admin user...');
    const adminUser = await User.findOne({ email: 'admin@eduknit.com' });
    
    if (!adminUser) {
      console.log('Admin user not found!');
      return;
    }
    
    console.log('Admin user found:');
    console.log('Current role:', adminUser.role);
    console.log('Current enrollmentStatus:', adminUser.enrollmentStatus);
    console.log('Current isEmailVerified:', adminUser.isEmailVerified);
    
    // Update admin user
    const updateResult = await User.updateOne(
      { email: 'admin@eduknit.com' },
      { 
        $set: {
          role: 'admin',
          enrollmentStatus: 'active',
          isEmailVerified: true,
          verificationMessageSeen: true,
          loginAttempts: 0
        },
        $unset: {
          lockUntil: 1
        }
      }
    );
    
    console.log('Update result:', updateResult);
    
    // Verify the update
    const updatedUser = await User.findOne({ email: 'admin@eduknit.com' });
    console.log('Updated user:');
    console.log('New role:', updatedUser.role);
    console.log('New enrollmentStatus:', updatedUser.enrollmentStatus);
    console.log('New isEmailVerified:', updatedUser.isEmailVerified);
    
    console.log('Admin user should now be able to login!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

run();
