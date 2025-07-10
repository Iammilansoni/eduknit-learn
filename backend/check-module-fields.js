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
    // Get all modules and check their field names
    const modules = await mongoose.connection.db.collection('programmemodules').find({}).toArray();
    
    console.log(`Total modules: ${modules.length}`);
    
    let programmeIdCount = 0;
    let courseIdCount = 0;
    
    modules.forEach(module => {
      if (module.programmeId) programmeIdCount++;
      if (module.courseId) courseIdCount++;
    });
    
    console.log(`Modules with programmeId: ${programmeIdCount}`);
    console.log(`Modules with courseId: ${courseIdCount}`);
    
    // Show sample of each type
    const moduleWithProgrammeId = modules.find(m => m.programmeId);
    const moduleWithCourseId = modules.find(m => m.courseId);
    
    if (moduleWithProgrammeId) {
      console.log('\nSample module with programmeId:');
      console.log(`  Title: ${moduleWithProgrammeId.title}`);
      console.log(`  programmeId: ${moduleWithProgrammeId.programmeId}`);
    }
    
    if (moduleWithCourseId) {
      console.log('\nSample module with courseId:');
      console.log(`  Title: ${moduleWithCourseId.title}`);
      console.log(`  courseId: ${moduleWithCourseId.courseId}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
});
