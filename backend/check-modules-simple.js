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
    // Check collections directly
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(col => console.log(' -', col.name));
    
    // Check modules collection
    const modules = await mongoose.connection.db.collection('programmemodules').find({}).toArray();
    console.log(`\nTotal modules in database: ${modules.length}`);
    
    if (modules.length > 0) {
      console.log('\n=== Sample Modules ===');
      modules.slice(0, 5).forEach((module, index) => {
        console.log(`${index + 1}. ${module.title} - Active: ${module.isActive}`);
      });
    } else {
      console.log('\nNo modules found in database!');
    }
    
    // Check courses collection
    const courses = await mongoose.connection.db.collection('programmes').find({}).toArray();
    console.log(`\nTotal courses in database: ${courses.length}`);
    
    if (courses.length > 0) {
      console.log('\n=== Sample Courses ===');
      courses.slice(0, 5).forEach((course, index) => {
        console.log(`${index + 1}. ${course.title} - Active: ${course.isActive}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
});
