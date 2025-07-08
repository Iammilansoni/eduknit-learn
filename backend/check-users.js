const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  firstName: String,
  lastName: String,
  isEmailVerified: { type: Boolean, default: true },
  enrollmentStatus: { type: String, default: 'active' },
  loginAttempts: { type: Number, default: 0 },
  refreshTokens: [String],
  verificationMessageSeen: { type: Boolean, default: false }
}, { timestamps: true });

async function checkUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const User = mongoose.model('User', userSchema);
    
    // Check existing users
    const users = await User.find({});
    console.log('Existing users:', users.length);
    
    if (users.length === 0) {
      console.log('No users found. Creating a test user...');
      
      // Create a test user
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('testpassword', salt);
      
      const testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'student',
        firstName: 'Test',
        lastName: 'User',
        isEmailVerified: true,
        enrollmentStatus: 'active',
        loginAttempts: 0,
        refreshTokens: [],
        verificationMessageSeen: false
      });
      
      await testUser.save();
      console.log('✅ Test user created successfully!');
      console.log('Email: test@example.com');
      console.log('Password: testpassword');
    } else {
      console.log('Users found:');
      users.forEach(user => {
        console.log(`- ${user.email} (${user.role}) - Verified: ${user.isEmailVerified}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

checkUsers();
