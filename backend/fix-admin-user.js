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

async function fixAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');
    
    const email = 'admin@eduknit.com';
    
    // Find the admin user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('📋 Current admin user state:');
    console.log('   Role:', user.role);
    console.log('   Enrollment Status:', user.enrollmentStatus);
    console.log('   Email Verified:', user.isEmailVerified);
    console.log('   Login Attempts:', user.loginAttempts);
    console.log('   Lock Until:', user.lockUntil);
    console.log('');
    
    // Fix any issues
    let updated = false;
    
    // Ensure role is lowercase 'admin' to match the TypeScript interface
    if (user.role !== 'admin') {
      console.log('🔧 Fixing role from', user.role, 'to admin');
      user.role = 'admin';
      updated = true;
    }
    
    // Ensure enrollment status is 'active'
    if (user.enrollmentStatus !== 'active') {
      console.log('🔧 Fixing enrollment status from', user.enrollmentStatus, 'to active');
      user.enrollmentStatus = 'active';
      updated = true;
    }
    
    // Ensure email is verified
    if (!user.isEmailVerified) {
      console.log('🔧 Setting email as verified');
      user.isEmailVerified = true;
      updated = true;
    }
    
    // Reset any login attempts and locks
    if (user.loginAttempts > 0) {
      console.log('🔧 Resetting login attempts from', user.loginAttempts, 'to 0');
      user.loginAttempts = 0;
      updated = true;
    }
    
    if (user.lockUntil) {
      console.log('🔧 Removing account lock');
      user.lockUntil = undefined;
      updated = true;
    }
    
    // Ensure verification message is seen
    if (!user.verificationMessageSeen) {
      console.log('🔧 Setting verification message as seen');
      user.verificationMessageSeen = true;
      updated = true;
    }
    
    // Test password hash
    const testPassword = 'Admin123!';
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    console.log('🔑 Password test result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('🔧 Regenerating password hash for:', testPassword);
      const saltRounds = 12;
      user.password = await bcrypt.hash(testPassword, saltRounds);
      updated = true;
    }
    
    if (updated) {
      await user.save();
      console.log('✅ Admin user updated successfully');
    } else {
      console.log('✅ Admin user already in correct state');
    }
    
    console.log('');
    console.log('📋 Final admin user state:');
    console.log('   Role:', user.role);
    console.log('   Enrollment Status:', user.enrollmentStatus);
    console.log('   Email Verified:', user.isEmailVerified);
    console.log('   Verification Message Seen:', user.verificationMessageSeen);
    console.log('   Login Attempts:', user.loginAttempts);
    console.log('   Lock Until:', user.lockUntil);
    console.log('');
    console.log('🎯 Admin should now be able to login with:');
    console.log('   Email: admin@eduknit.com');
    console.log('   Password: Admin123!');
    
  } catch (error) {
    console.error('❌ Error fixing admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔚 Database connection closed');
  }
}

// Run the script
fixAdminUser();
