const mongoose = require('mongoose');
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
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  profileData: {
    firstName: String,
    lastName: String,
    profilePicture: String,
    bio: String,
    dateOfBirth: Date,
    phoneNumber: String,
    address: String,
    city: String,
    country: String,
    profileVisibility: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String,
      website: String
    },
    interests: [String],
    skills: [String],
    experience: String,
    education: String,
    certifications: [String],
    languages: [String],
    timezone: String,
    preferredLanguage: String,
    preferences: {
      theme: String,
      emailNotifications: Boolean,
      smsNotifications: Boolean,
      marketingEmails: Boolean,
      courseReminders: Boolean,
      progressUpdates: Boolean,
      achievements: Boolean,
      weeklyDigest: Boolean,
      monthlyReport: Boolean
    }
  },
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

async function checkAdminUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get all users
    const users = await User.find({});
    console.log(`Total users in database: ${users.length}`);
    
    // Check for admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`Admin users: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      console.log('\n=== Admin Users ===');
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.email}) - Active: ${user.isActive}, Verified: ${user.isVerified}`);
      });
    } else {
      console.log('\nNo admin users found!');
    }
    
    // Check for any users with email containing "admin"
    const possibleAdmins = await User.find({ 
      $or: [
        { email: /admin/i },
        { username: /admin/i }
      ]
    });
    
    if (possibleAdmins.length > 0) {
      console.log('\n=== Possible Admin Users ===');
      possibleAdmins.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking admin users:', error);
    process.exit(1);
  }
}

checkAdminUsers();
