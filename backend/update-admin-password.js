const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

// Define User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  isVerified: Boolean,
  isEmailVerified: Boolean,
  enrollmentStatus: String,
  loginAttempts: Number,
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
  verificationMessageSeen: Boolean
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function updateAdminPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const newPassword = 'admin123';
    
    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the admin user
    const result = await User.updateOne(
      { email: 'admin@eduknit.com' },
      { 
        password: hashedPassword,
        isActive: true,
        isEmailVerified: true,
        enrollmentStatus: 'active',
        loginAttempts: 0,
        verificationMessageSeen: true
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('Admin password updated successfully!');
      console.log('Email: admin@eduknit.com');
      console.log('Password: admin123');
    } else {
      console.log('No admin user found to update');
    }
    
    // Verify the update
    const updatedUser = await User.findOne({ email: 'admin@eduknit.com' });
    console.log('Updated user:', {
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      isEmailVerified: updatedUser.isEmailVerified
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  }
}

updateAdminPassword();
