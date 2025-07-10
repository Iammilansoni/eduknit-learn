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
    // Find Communication Skills course
    const commSkillsCourse = await mongoose.connection.db.collection('programmes')
      .findOne({ title: 'Communication Skills' });
    
    if (!commSkillsCourse) {
      console.log('Communication Skills course not found');
      process.exit(1);
    }
    
    // Get all modules for Communication Skills
    const modules = await mongoose.connection.db.collection('programmemodules')
      .find({ courseId: commSkillsCourse._id }).toArray();
    
    console.log(`Found ${modules.length} modules for Communication Skills`);
    
    // Group modules by title to find duplicates
    const moduleGroups = {};
    modules.forEach(module => {
      if (!moduleGroups[module.title]) {
        moduleGroups[module.title] = [];
      }
      moduleGroups[module.title].push(module);
    });
    
    console.log('Module groups:');
    Object.keys(moduleGroups).forEach(title => {
      console.log(`  ${title}: ${moduleGroups[title].length} instances`);
    });
    
    // Remove duplicates (keep the first one, remove the rest)
    for (const title in moduleGroups) {
      const moduleGroup = moduleGroups[title];
      if (moduleGroup.length > 1) {
        console.log(`\nRemoving duplicates for: ${title}`);
        
        // Keep the first module, remove the rest
        const toKeep = moduleGroup[0];
        const toRemove = moduleGroup.slice(1);
        
        for (const module of toRemove) {
          console.log(`  Removing module: ${module._id}`);
          
          // First remove all lessons for this module
          const lessonsResult = await mongoose.connection.db.collection('programmelessons')
            .deleteMany({ moduleId: module._id });
          console.log(`    Removed ${lessonsResult.deletedCount} lessons`);
          
          // Then remove the module
          await mongoose.connection.db.collection('programmemodules')
            .deleteOne({ _id: module._id });
          console.log(`    Removed module`);
        }
      }
    }
    
    // Final verification
    const finalModules = await mongoose.connection.db.collection('programmemodules')
      .find({ courseId: commSkillsCourse._id }).toArray();
    const finalLessons = await mongoose.connection.db.collection('programmelessons')
      .find({ moduleId: { $in: finalModules.map(m => m._id) } }).toArray();
    
    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Communication Skills now has ${finalModules.length} modules`);
    console.log(`   Communication Skills now has ${finalLessons.length} lessons`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
});
