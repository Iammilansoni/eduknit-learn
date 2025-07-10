const mongoose = require('mongoose');

// Database connection
mongoose.connect('mongodb://localhost:27017/eduknit-learn');

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('Database connection error:', error);
  process.exit(1);
});

db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Get all users using raw MongoDB query
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('Users found:', users.length);
    
    if (users.length > 0) {
      console.log('First user structure:');
      console.log(JSON.stringify(users[0], null, 2));
    }
    
    // Check programmes
    const programmes = await mongoose.connection.db.collection('programmes').find({}).toArray();
    console.log('Programmes found:', programmes.length);
    
    if (programmes.length > 0) {
      console.log('First programme:');
      console.log(JSON.stringify(programmes[0], null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
});
