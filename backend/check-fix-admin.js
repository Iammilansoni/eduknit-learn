const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

// Define User Schema directly
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  profileVisibility: {
    type: String,
    enum: ['PUBLIC', 'PRIVATE', 'CONNECTIONS_ONLY'],
    default: 'PUBLIC'
  },
  refreshTokens: [String],
  isActive: Boolean,
  isEmailVerified: Boolean,
  enrollmentStatus: String,
  loginAttempts: Number,
  verificationMessageSeen: Boolean
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function checkAndFixAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@eduknit.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      
      // List all users to see what's available
      const allUsers = await User.find({}, 'username email role');
      console.log('Available users:');
      allUsers.forEach(user => {
        console.log(`- ${user.username} (${user.email}) - Role: ${user.role}`);
      });
      
      process.exit(1);
    }

    console.log('✅ Found admin user:', adminUser.username, adminUser.email);
    console.log('Current admin data:', {
      role: adminUser.role,
      profileVisibility: adminUser.profileVisibility,
      isActive: adminUser.isActive,
      isEmailVerified: adminUser.isEmailVerified,
      refreshTokensCount: adminUser.refreshTokens?.length || 0
    });

    let updated = false;

    // Fix profileVisibility if needed
    if (adminUser.profileVisibility === 'public') {
      adminUser.profileVisibility = 'PUBLIC';
      updated = true;
      console.log('✅ Fixed profileVisibility: public -> PUBLIC');
    } else if (adminUser.profileVisibility === 'private') {
      adminUser.profileVisibility = 'PRIVATE';
      updated = true;
      console.log('✅ Fixed profileVisibility: private -> PRIVATE');
    } else if (!adminUser.profileVisibility) {
      adminUser.profileVisibility = 'PUBLIC';
      updated = true;
      console.log('✅ Set missing profileVisibility to PUBLIC');
    }

    // Clear refresh tokens to prevent JWT conflicts
    if (adminUser.refreshTokens && adminUser.refreshTokens.length > 0) {
      adminUser.refreshTokens = [];
      updated = true;
      console.log('✅ Cleared refresh tokens');
    }

    // Ensure user is active and verified
    if (!adminUser.isActive) {
      adminUser.isActive = true;
      updated = true;
      console.log('✅ Set isActive to true');
    }

    if (!adminUser.isEmailVerified) {
      adminUser.isEmailVerified = true;
      updated = true;
      console.log('✅ Set isEmailVerified to true');
    }

    if (adminUser.enrollmentStatus !== 'active') {
      adminUser.enrollmentStatus = 'active';
      updated = true;
      console.log('✅ Set enrollmentStatus to active');
    }

    if (adminUser.loginAttempts && adminUser.loginAttempts > 0) {
      adminUser.loginAttempts = 0;
      updated = true;
      console.log('✅ Reset loginAttempts to 0');
    }

    if (updated) {
      await adminUser.save();
      console.log('✅ Admin user updated successfully!');
    } else {
      console.log('✅ Admin user is already properly configured');
    }

    console.log('\nFinal admin user state:', {
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
      profileVisibility: adminUser.profileVisibility,
      isActive: adminUser.isActive,
      isEmailVerified: adminUser.isEmailVerified,
      enrollmentStatus: adminUser.enrollmentStatus,
      loginAttempts: adminUser.loginAttempts
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAndFixAdmin();
