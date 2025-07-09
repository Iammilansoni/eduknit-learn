const mongoose = require('mongoose');
require('dotenv').config();

async function fixProfileVisibilityEnum() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Simple update to set all users to PUBLIC if they have lowercase values
    const result1 = await usersCollection.updateMany(
      { profileVisibility: 'public' },
      { $set: { profileVisibility: 'PUBLIC' } }
    );
    
    const result2 = await usersCollection.updateMany(
      { profileVisibility: 'private' },
      { $set: { profileVisibility: 'PRIVATE' } }
    );
    
    const result3 = await usersCollection.updateMany(
      { profileVisibility: 'connections_only' },
      { $set: { profileVisibility: 'CONNECTIONS_ONLY' } }
    );

    console.log(`Updated ${result1.modifiedCount} public users`);
    console.log(`Updated ${result2.modifiedCount} private users`);
    console.log(`Updated ${result3.modifiedCount} connections_only users`);
    
    // Verify the update
    const users = await usersCollection.find({}, { projection: { username: 1, profileVisibility: 1 } }).limit(5).toArray();
    console.log('Sample users after update:');
    users.forEach(user => {
      console.log(`${user.username}: ${user.profileVisibility}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixProfileVisibilityEnum();
