const mongoose = require('mongoose');
const User = require('./dist/models/User').default;

// Database connection
mongoose.connect('mongodb://localhost:27017/eduknit-learn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('Database connection error:', error);
  process.exit(1);
});

db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@eduknit.com' });
    
    if (!adminUser) {
      console.log('Admin user not found!');
      process.exit(1);
    }

    console.log('Current admin user profileVisibility:', adminUser.profileVisibility);

    // Update the profileVisibility to uppercase if it's lowercase
    if (adminUser.profileVisibility === 'public') {
      adminUser.profileVisibility = 'PUBLIC';
      await adminUser.save();
      console.log('✅ Updated admin profileVisibility from "public" to "PUBLIC"');
    } else if (adminUser.profileVisibility === 'private') {
      adminUser.profileVisibility = 'PRIVATE';
      await adminUser.save();
      console.log('✅ Updated admin profileVisibility from "private" to "PRIVATE"');
    } else if (adminUser.profileVisibility === 'connections_only') {
      adminUser.profileVisibility = 'CONNECTIONS_ONLY';
      await adminUser.save();
      console.log('✅ Updated admin profileVisibility from "connections_only" to "CONNECTIONS_ONLY"');
    } else {
      console.log('✅ Admin profileVisibility is already valid:', adminUser.profileVisibility);
    }

    // Also clear any problematic refresh tokens
    adminUser.refreshTokens = [];
    await adminUser.save();
    console.log('✅ Cleared admin refresh tokens to prevent JWT conflicts');

    console.log('✅ Admin profile visibility fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing admin profile visibility:', error);
    process.exit(1);
  }
});
