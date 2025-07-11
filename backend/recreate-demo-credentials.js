const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

// Define User Schema matching the TypeScript model
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  firstName: String,
  lastName: String,
  profilePicture: String,
  dateOfBirth: Date,
  phoneNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  enrollmentStatus: String,
  enrollmentDate: Date,
  lastLoginAt: Date,
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  verificationMessageSeen: Boolean,
  passwordResetToken: String,
  passwordResetExpires: Date,
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
  deletionRequestedAt: Date,
  deletionScheduledFor: Date,
  deletionReason: String,
  isDeleted: Boolean,
  deletedAt: Date,
  deletedBy: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function recreateDemoCredentials() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');
    
    // Demo credentials with CORRECT lowercase roles
    const demoCredentials = [
      {
        username: 'admin',
        email: 'admin@eduknit.com',
        password: 'Admin123!',
        role: 'admin',
        firstName: 'Demo',
        lastName: 'Admin'
      },
      {
        username: 'user',
        email: 'user@eduknit.com',
        password: 'User123!',
        role: 'user',
        firstName: 'Demo',
        lastName: 'User'
      },
      {
        username: 'visitor',
        email: 'visitor@eduknit.com',
        password: 'Visitor123!',
        role: 'visitor',
        firstName: 'Demo',
        lastName: 'Visitor'
      }
    ];

    console.log('🗑️  Deleting existing demo users...');
    
    // Delete existing demo users
    const deleteResult = await User.deleteMany({
      email: { $in: ['admin@eduknit.com', 'user@eduknit.com', 'visitor@eduknit.com'] }
    });
    
    console.log(`   Deleted ${deleteResult.deletedCount} existing users`);
    console.log('');

    console.log('🔧 Creating fresh demo credentials...\n');

    for (const userData of demoCredentials) {
      console.log(`Creating ${userData.role} user: ${userData.email}`);
      
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user with all required fields properly set
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,  // LOWERCASE role
        firstName: userData.firstName,
        lastName: userData.lastName,
        enrollmentStatus: 'active',  // ACTIVE status
        enrollmentDate: new Date(),
        isEmailVerified: true,  // EMAIL VERIFIED
        verificationMessageSeen: true,
        loginAttempts: 0,  // NO LOGIN ATTEMPTS
        refreshTokens: [],
        profileVisibility: 'PUBLIC',
        allowMessaging: true,
        allowConnectionRequests: true,
        dataProcessingConsent: true,
        marketingConsent: true,
        showProgress: true,
        showAchievements: true,
        deletionRequested: false,
        isDeleted: false
        // lockUntil is NOT set (no lock)
      });

      await user.save();
      
      console.log(`✅ Created ${userData.role} user successfully`);
      console.log(`   Username: ${userData.username}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Role: ${userData.role} (lowercase)`);
      console.log(`   Status: ${user.enrollmentStatus}`);
      console.log(`   Email Verified: ${user.isEmailVerified}`);
      console.log(`   ID: ${user._id}`);
      console.log('');
    }

    // Verify all demo users
    const allDemoUsers = await User.find({ 
      email: { $in: ['admin@eduknit.com', 'user@eduknit.com', 'visitor@eduknit.com'] }
    }).select('username email firstName lastName role enrollmentStatus isEmailVerified loginAttempts lockUntil createdAt');
    
    console.log('📋 All Demo Users Verification:');
    console.log('=' .repeat(60));
    allDemoUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.role.toUpperCase()})`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role} ✓`);
      console.log(`   Status: ${user.enrollmentStatus} ✓`);
      console.log(`   Email Verified: ${user.isEmailVerified} ✓`);
      console.log(`   Login Attempts: ${user.loginAttempts} ✓`);
      console.log(`   Locked: ${user.lockUntil ? 'Yes ❌' : 'No ✓'}`);
      console.log(`   Created: ${user.createdAt?.toISOString().split('T')[0]}`);
      console.log(`   ID: ${user._id}`);
      console.log('');
    });

    console.log('🎉 Demo credentials recreated successfully!');
    console.log('\n🔐 Ready to Use Demo Login Credentials:');
    console.log('=' .repeat(60));
    demoCredentials.forEach((cred, index) => {
      console.log(`${index + 1}. ${cred.role.toUpperCase()}: ${cred.email} / ${cred.password}`);
    });
    
    console.log('\n✅ All users should now be able to login without 401 errors!');

  } catch (error) {
    console.error('❌ Error recreating demo credentials:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔚 Database connection closed');
  }
}

// Run the script
recreateDemoCredentials();
