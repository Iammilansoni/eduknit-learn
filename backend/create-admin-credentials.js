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

async function createDemoCredentials() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 Connected to MongoDB');
    
    // Demo credentials
    const demoCredentials = [
      {
        username: 'admin',
        email: 'admin@eduknit.com',
        password: 'Admin123!',
        role: 'ADMIN',
        firstName: 'Demo',
        lastName: 'Admin'
      },
      {
        username: 'user',
        email: 'user@eduknit.com',
        password: 'User123!',
        role: 'USER',
        firstName: 'Demo',
        lastName: 'User'
      },
      {
        username: 'visitor',
        email: 'visitor@eduknit.com',
        password: 'Visitor123!',
        role: 'VISITOR',
        firstName: 'Demo',
        lastName: 'Visitor'
      }
    ];

    console.log('🔧 Creating demo users...\n');

    for (const userData of demoCredentials) {
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        console.log(`⚠️  User already exists: ${userData.email} (${userData.username})`);
        continue;
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enrollmentStatus: 'active',
        enrollmentDate: new Date(),
        isEmailVerified: true,
        verificationMessageSeen: true,
        loginAttempts: 0,
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
      });

      await user.save();
      
      console.log(`✅ Created ${userData.role.toLowerCase()} user:`);
      console.log(`   Username: ${userData.username}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   ID: ${user._id}`);
      console.log('');
    }

    // List all demo users
    const allUsers = await User.find({ 
      email: { $in: ['admin@eduknit.com', 'user@eduknit.com', 'visitor@eduknit.com'] }
    }).select('username email firstName lastName role createdAt');
    
    console.log('📋 All Demo Users:');
    console.log('=' .repeat(50));
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.role})`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Created: ${user.createdAt?.toISOString().split('T')[0]}`);
      console.log(`   ID: ${user._id}`);
      console.log('');
    });

    console.log('🎉 Demo credentials setup completed!');
    console.log('\n🔐 Demo Login Credentials:');
    console.log('=' .repeat(50));
    demoCredentials.forEach((cred, index) => {
      console.log(`${index + 1}. ${cred.role}: ${cred.email} / ${cred.password}`);
    });

  } catch (error) {
    console.error('❌ Error creating admin credentials:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔚 Database connection closed');
  }
}

// Run the script
createDemoCredentials();
