const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

console.log('🔍 LMS System Diagnostic...\n');

async function runDiagnostic() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Database Collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    console.log();
    
    // Check if main collections exist
    const hasPrograms = collections.some(c => c.name === 'programmes');
    const hasModules = collections.some(c => c.name === 'programmemodules');
    const hasLessons = collections.some(c => c.name === 'programmelessons');
    const hasEnrollments = collections.some(c => c.name === 'usercourses');
    
    console.log('🏗️  Collection Status:');
    console.log(`  Programs/Courses: ${hasPrograms ? '✅' : '❌'}`);
    console.log(`  Modules: ${hasModules ? '✅' : '❌'}`);
    console.log(`  Lessons: ${hasLessons ? '✅' : '❌'}`);
    console.log(`  Enrollments: ${hasEnrollments ? '✅' : '❌'}`);
    console.log();
    
    if (hasPrograms) {
      const programmesCollection = mongoose.connection.db.collection('programmes');
      const programCount = await programmesCollection.countDocuments();
      console.log(`📚 Total Programs: ${programCount}`);
      
      if (programCount > 0) {
        const programs = await programmesCollection.find({}).limit(10).toArray();
        console.log('📝 Sample Programs:');
        programs.forEach((prog, index) => {
          console.log(`  ${index + 1}. ${prog.title} (${prog.slug}) - Active: ${prog.isActive}`);
        });
        console.log();
        
        // Create mapping
        const mapping = {};
        programs.forEach(prog => {
          mapping[prog.slug] = prog._id.toString();
        });
        console.log('🔗 Current Course Mapping:');
        console.log(JSON.stringify(mapping, null, 2));
        console.log();
      }
    }
    
    if (hasModules) {
      const modulesCollection = mongoose.connection.db.collection('programmemodules');
      const moduleCount = await modulesCollection.countDocuments();
      console.log(`📖 Total Modules: ${moduleCount}`);
    }
    
    if (hasLessons) {
      const lessonsCollection = mongoose.connection.db.collection('programmelessons');
      const lessonCount = await lessonsCollection.countDocuments();
      console.log(`📝 Total Lessons: ${lessonCount}`);
    }
    
    if (hasEnrollments) {
      const enrollmentsCollection = mongoose.connection.db.collection('usercourses');
      const enrollmentCount = await enrollmentsCollection.countDocuments();
      console.log(`🎓 Total Enrollments: ${enrollmentCount}`);
    }
    
    console.log('\n🎯 Recommended Actions:');
    if (!hasPrograms || await mongoose.connection.db.collection('programmes').countDocuments() === 0) {
      console.log('  ⚠️  Run course setup script to create programs');
    }
    if (!hasModules || await mongoose.connection.db.collection('programmemodules').countDocuments() === 0) {
      console.log('  ⚠️  Run module creation script');
    }
    if (!hasLessons || await mongoose.connection.db.collection('programmelessons').countDocuments() === 0) {
      console.log('  ⚠️  Run lesson creation script');
    }
    
    console.log('\n✅ Diagnostic complete!');
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

runDiagnostic();
