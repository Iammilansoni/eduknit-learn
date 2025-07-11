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
    // Check courses
    const courses = await mongoose.connection.db.collection('programmes').find({}).toArray();
    console.log(`\n=== Current Courses (${courses.length}) ===`);
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} (${course.category}) - Active: ${course.isActive}`);
    });
    
    // Check modules per course
    console.log('\n=== Modules per Course ===');
    for (const course of courses) {
      const modules = await mongoose.connection.db.collection('programmemodules').find({ programmeId: course._id }).toArray();
      console.log(`${course.title}: ${modules.length} modules`);
      
      if (modules.length > 0) {
        modules.forEach((module, idx) => {
          console.log(`  ${idx + 1}. ${module.title}`);
        });
      }
    }
    
    // Check lessons
    const allLessons = await mongoose.connection.db.collection('programmelessons').find({}).toArray();
    console.log(`\n=== Total Lessons: ${allLessons.length} ===`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
});
