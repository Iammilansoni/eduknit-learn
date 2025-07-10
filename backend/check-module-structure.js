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
    // Get a sample module to see its structure
    const sampleModule = await mongoose.connection.db.collection('programmemodules').findOne({});
    
    if (sampleModule) {
      console.log('Sample module structure:');
      console.log(JSON.stringify(sampleModule, null, 2));
    } else {
      console.log('No modules found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
});
