const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

// Define User Schema to match the backend exactly
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
  profileVisibility: String, // Will check the value
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

async function checkAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get the admin user
    const adminUser = await User.findOne({ email: 'admin@eduknit.com' });
    
    if (!adminUser) {
      console.log('Admin user not found!');
      process.exit(1);
    }
    
    console.log('Admin user details:');
    console.log('- Email:', adminUser.email);
    console.log('- Username:', adminUser.username);
    console.log('- Role:', adminUser.role);
    console.log('- Enrollment Status:', adminUser.enrollmentStatus);
    console.log('- Email Verified:', adminUser.isEmailVerified);
    console.log('- Profile Visibility:', adminUser.profileVisibility);
    console.log('- Login Attempts:', adminUser.loginAttempts);
    console.log('- Deletion Requested:', adminUser.deletionRequested);
    console.log('- Is Deleted:', adminUser.isDeleted);
    console.log('- Verification Message Seen:', adminUser.verificationMessageSeen);
    console.log('- Last Login:', adminUser.lastLoginAt);
    
    // Check for potential validation issues
    const issues = [];
    
    if (!adminUser.enrollmentStatus) {
      issues.push('Missing enrollmentStatus');
    } else if (!['active', 'inactive', 'suspended'].includes(adminUser.enrollmentStatus)) {
      issues.push(`Invalid enrollmentStatus: ${adminUser.enrollmentStatus}`);
    }
    
    if (adminUser.profileVisibility && !['PUBLIC', 'PRIVATE', 'CONNECTIONS_ONLY'].includes(adminUser.profileVisibility)) {
      issues.push(`Invalid profileVisibility: ${adminUser.profileVisibility} (should be uppercase)`);
    }
    
    if (adminUser.role !== 'admin') {
      issues.push(`Incorrect role: ${adminUser.role} (should be 'admin')`);
    }
    
    if (adminUser.isEmailVerified !== true) {
      issues.push('Email not verified');
    }
    
    if (issues.length > 0) {
      console.log('\n⚠️  Potential Issues:');
      issues.forEach(issue => console.log('  -', issue));
    } else {
      console.log('\n✅ No obvious validation issues found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking admin user:', error);
    process.exit(1);
  }
}

checkAdminUser();
