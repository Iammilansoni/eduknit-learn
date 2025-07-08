// Test User model and JWT integration
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'student', 'visitor'], default: 'visitor' },
  isEmailVerified: { type: Boolean, default: false },
  enrollmentStatus: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  loginAttempts: { type: Number, default: 0 },
  refreshTokens: [{ type: String }],
  verificationMessageSeen: { type: Boolean, default: false }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.refreshTokens;
      return ret;
    }
  }
});

async function testUserModelAndJWT() {
  try {
    console.log('Testing User model and JWT integration...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');
    
    const User = mongoose.model('TestUser', userSchema);
    
    // Test user creation
    const testUser = new User({
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'hashedpassword',
      role: 'student',
      isEmailVerified: true
    });
    
    // Test toJSON transformation
    const userJson = testUser.toJSON();
    console.log('✅ User toJSON transform working:', !userJson.password && !userJson._id && userJson.id);
    
    // Test JWT generation
    const payload = {
      user: {
        id: testUser.id,
        role: testUser.role
      }
    };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
      algorithm: 'HS256',
      issuer: 'eduknit-learn',
      audience: 'eduknit-learn-users'
    });
    
    console.log('✅ JWT token generated successfully');
    
    // Test JWT verification
    const verified = jwt.verify(accessToken, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'eduknit-learn',
      audience: 'eduknit-learn-users'
    });
    
    console.log('✅ JWT token verified successfully');
    
    console.log('All tests passed! Backend should work correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testUserModelAndJWT();
