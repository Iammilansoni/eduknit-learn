const mongoose = require('mongoose');
const User = require('./backend/src/models/User').default;

async function checkExistingUsers() {
  try {
    // Connect to MongoDB (make sure to use your actual connection string)
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit_learn');
    
    console.log('Connected to MongoDB');
    
    // Get all users
    const users = await User.find({}, 'username email role createdAt').sort({ createdAt: -1 });
    
    console.log(`\nFound ${users.length} users in database:`);
    console.log('==========================================');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('---');
    });
    
    // Check for common test emails
    const commonTestEmails = [
      'test@example.com',
      'admin@example.com',
      'user@example.com',
      'student@example.com'
    ];
    
    console.log('\nChecking for common test emails:');
    for (const email of commonTestEmails) {
      const user = await User.findOne({ email });
      if (user) {
        console.log(`❌ ${email} - ALREADY EXISTS (username: ${user.username})`);
      } else {
        console.log(`✅ ${email} - Available`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkExistingUsers();
