const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

// Define User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  firstName: String,
  lastName: String,
  enrollmentStatus: String,
  enrollmentDate: Date,
  isEmailVerified: Boolean,
  verificationMessageSeen: Boolean,
  loginAttempts: Number,
  lockUntil: Date,
  refreshTokens: [String],
  profileVisibility: String,
  allowMessaging: Boolean,
  allowConnectionRequests: Boolean,
  dataProcessingConsent: Boolean,
  marketingConsent: Boolean,
  showProgress: Boolean,
  showAchievements: Boolean,
  deletionRequested: Boolean,
  isDeleted: Boolean,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function fixUserRoles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');
    
    // Update all users with uppercase roles to lowercase
    const updates = [
      { from: 'ADMIN', to: 'admin' },
      { from: 'USER', to: 'user' }, 
      { from: 'VISITOR', to: 'visitor' },
      { from: 'STUDENT', to: 'student' }
    ];
    
    for (const update of updates) {
      const result = await User.updateMany(
        { role: update.from },
        { 
          $set: { 
            role: update.to,
            enrollmentStatus: 'active',
            isEmailVerified: true,
            verificationMessageSeen: true,
            loginAttempts: 0,
            $unset: { lockUntil: 1 }
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${result.modifiedCount} users from ${update.from} to ${update.to}`);
      }
    }
    
    // List all demo users
    const demoUsers = await User.find({ 
      email: { $in: ['admin@eduknit.com', 'user@eduknit.com', 'visitor@eduknit.com'] }
    }).select('username email role enrollmentStatus isEmailVerified loginAttempts lockUntil');
    
    console.log('');
    console.log('📋 Demo Users Status:');
    console.log('=' .repeat(50));
    demoUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Enrollment Status: ${user.enrollmentStatus}`);
      console.log(`   Email Verified: ${user.isEmailVerified}`);
      console.log(`   Login Attempts: ${user.loginAttempts}`);
      console.log(`   Locked: ${user.lockUntil ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    console.log('🎉 User roles fixed! All demo users should now be able to login.');
    
  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔚 Database connection closed');
  }
}

// Run the script
fixUserRoles();
