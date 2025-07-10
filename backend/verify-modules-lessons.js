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
    // Get counts
    const modules = await mongoose.connection.db.collection('programmemodules').find({}).toArray();
    const lessons = await mongoose.connection.db.collection('programmelessons').find({}).toArray();
    const programmes = await mongoose.connection.db.collection('programmes').find({}).toArray();
    
    console.log(`📊 Database Summary:`);
    console.log(`   Programmes: ${programmes.length}`);
    console.log(`   Modules: ${modules.length}`);
    console.log(`   Lessons: ${lessons.length}`);
    
    console.log(`\n📚 Modules by Course:`);
    for (const programme of programmes) {
      const courseModules = modules.filter(m => m.courseId?.toString() === programme._id.toString());
      if (courseModules.length > 0) {
        console.log(`   ${programme.title}: ${courseModules.length} modules`);
        
        for (const module of courseModules) {
          const moduleLessons = lessons.filter(l => l.moduleId?.toString() === module._id.toString());
          console.log(`     - ${module.title}: ${moduleLessons.length} lessons`);
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
});
