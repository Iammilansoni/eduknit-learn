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
  enrollmentStatus: String,
  enrollmentDate: Date,
  isEmailVerified: Boolean,
  verificationMessageSeen: Boolean,
  loginAttempts: Number,
  lockUntil: Date,
  deletionRequested: Boolean,
  isDeleted: Boolean,
}, { timestamps: true });

// Add isLocked method
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

const User = mongoose.model('User', userSchema);

async function debugAdminLogin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');
    
    const email = 'admin@eduknit.com';
    const password = 'Admin123!';
    
    console.log('🔍 Debugging login for:', email);
    console.log('📋 Testing password:', password);
    console.log('');
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:');
    console.log('   ID:', user._id);
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   First Name:', user.firstName);
    console.log('   Last Name:', user.lastName);
    console.log('   Enrollment Status:', user.enrollmentStatus);
    console.log('   Email Verified:', user.isEmailVerified);
    console.log('   Verification Message Seen:', user.verificationMessageSeen);
    console.log('   Login Attempts:', user.loginAttempts);
    console.log('   Lock Until:', user.lockUntil);
    console.log('   Deletion Requested:', user.deletionRequested);
    console.log('   Is Deleted:', user.isDeleted);
    console.log('   Created At:', user.createdAt);
    console.log('   Updated At:', user.updatedAt);
    console.log('');
    
    // Check if account is locked
    const isLocked = user.isLocked();
    console.log('🔒 Account Locked:', isLocked);
    
    // Check email verification
    console.log('📧 Email Verified:', user.isEmailVerified);
    
    // Check enrollment status
    console.log('📝 Enrollment Status Active:', user.enrollmentStatus === 'active');
    
    // Test password
    console.log('🔑 Testing password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔑 Password Valid:', isPasswordValid);
    
    // Check all login conditions
    console.log('');
    console.log('🚦 Login Conditions Check:');
    console.log('   ✅ User exists:', !!user);
    console.log('   ✅ Account not locked:', !isLocked);
    console.log('   ✅ Email verified:', user.isEmailVerified);
    console.log('   ✅ Account active:', user.enrollmentStatus === 'active');
    console.log('   ✅ Password valid:', isPasswordValid);
    
    const canLogin = !!user && !isLocked && user.isEmailVerified && user.enrollmentStatus === 'active' && isPasswordValid;
    console.log('');
    console.log('🎯 CAN LOGIN:', canLogin);
    
    if (!canLogin) {
      console.log('');
      console.log('❌ Login Issues Found:');
      if (!user) console.log('   - User does not exist');
      if (isLocked) console.log('   - Account is locked');
      if (!user.isEmailVerified) console.log('   - Email not verified');
      if (user.enrollmentStatus !== 'active') console.log('   - Account not active (status:', user.enrollmentStatus, ')');
      if (!isPasswordValid) console.log('   - Password is invalid');
    }
    
  } catch (error) {
    console.error('❌ Error debugging admin login:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔚 Database connection closed');
  }
}

// Run the script
debugAdminLogin();
