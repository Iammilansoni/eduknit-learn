import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit_learn';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

async function listUsers() {
  try {
    const users = await User.find({}, 'email username firstName lastName role enrollmentStatus isEmailVerified createdAt');
    console.log('\n=== Registered Users ===');
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Enrollment Status: ${user.enrollmentStatus}`);
        console.log(`   Email Verified: ${user.isEmailVerified}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

async function deleteUserByEmail(email: string) {
  try {
    const result = await User.deleteOne({ email });
    if (result.deletedCount > 0) {
      console.log(`✅ User with email '${email}' has been deleted.`);
    } else {
      console.log(`❌ No user found with email '${email}'.`);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

async function activateUser(email: string) {
  try {
    const result = await User.updateOne(
      { email }, 
      { 
        enrollmentStatus: 'active',
        isEmailVerified: true 
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`✅ User with email '${email}' has been activated and email verified.`);
    } else {
      console.log(`❌ No user found with email '${email}' or user was already active.`);
    }
  } catch (error) {
    console.error('Error activating user:', error);
  }
}

async function resetPassword(email: string, newPassword: string) {
  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const result = await User.updateOne(
      { email }, 
      { password: hashedPassword }
    );
    if (result.modifiedCount > 0) {
      console.log(`✅ Password for user '${email}' has been reset.`);
    } else {
      console.log(`❌ No user found with email '${email}'.`);
    }
  } catch (error) {
    console.error('Error resetting password:', error);
  }
}

async function clearAllUsers() {
  try {
    const result = await User.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} users from the database.`);
  } catch (error) {
    console.error('Error clearing users:', error);
  }
}

async function main() {
  await connectDB();
  
  const action = process.argv[2];
  const email = process.argv[3];
  
  switch (action) {
    case 'list':
      await listUsers();
      break;
      
    case 'delete':
      if (!email) {
        console.log('Please provide an email address to delete.');
        console.log('Usage: npm run manage-users delete user@example.com');
        break;
      }
      await deleteUserByEmail(email);
      break;
      
    case 'activate':
      if (!email) {
        console.log('Please provide an email address to activate.');
        console.log('Usage: npm run manage-users activate user@example.com');
        break;
      }
      await activateUser(email);
      break;
      
    case 'reset-password':
      const password = process.argv[4];
      if (!email || !password) {
        console.log('Please provide both email and new password.');
        console.log('Usage: npm run manage-users reset-password user@example.com newpassword123');
        break;
      }
      await resetPassword(email, password);
      break;
      
    case 'clear':
      console.log('⚠️  WARNING: This will delete ALL users from the database!');
      console.log('Are you sure? This action cannot be undone.');
      console.log('If you are sure, run: npm run manage-users clear-confirmed');
      break;
      
    case 'clear-confirmed':
      await clearAllUsers();
      break;
      
    default:
      console.log('User Management Utility');
      console.log('Usage:');
      console.log('  npm run manage-users list                        - List all users');
      console.log('  npm run manage-users delete <email>              - Delete user by email');
      console.log('  npm run manage-users activate <email>            - Activate user and verify email');
      console.log('  npm run manage-users reset-password <email> <pw> - Reset user password');
      console.log('  npm run manage-users clear                       - Get warning about clearing all users');
      console.log('  npm run manage-users clear-confirmed             - Clear all users (USE WITH CAUTION)');
      break;
  }
  
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch(console.error);
