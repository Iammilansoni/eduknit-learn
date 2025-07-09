const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eduknit-learn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import the compiled User model
const User = require('./dist/models/User').default;

async function updateProfileVisibility() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connection.asPromise();
    console.log('Connected to MongoDB');

    // Update all users with profileVisibility: 'public' to 'PUBLIC'
    const result = await User.updateMany(
      { profileVisibility: 'public' },
      { profileVisibility: 'PUBLIC' }
    );

    console.log(`Updated ${result.modifiedCount} user(s) from 'public' to 'PUBLIC'`);
    
    // Also check for any other lowercase values
    const privateResult = await User.updateMany(
      { profileVisibility: 'private' },
      { profileVisibility: 'PRIVATE' }
    );
    
    const connectionsResult = await User.updateMany(
      { profileVisibility: 'connections_only' },
      { profileVisibility: 'CONNECTIONS_ONLY' }
    );

    console.log(`Updated ${privateResult.modifiedCount} user(s) from 'private' to 'PRIVATE'`);
    console.log(`Updated ${connectionsResult.modifiedCount} user(s) from 'connections_only' to 'CONNECTIONS_ONLY'`);

    // Show current distribution
    const stats = await User.aggregate([
      { $group: { _id: '$profileVisibility', count: { $sum: 1 } } }
    ]);
    
    console.log('\nCurrent profileVisibility distribution:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} user(s)`);
    });

  } catch (error) {
    console.error('Error updating profile visibility:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateProfileVisibility(); 