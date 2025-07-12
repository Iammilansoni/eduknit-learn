const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupOrphanedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn');
    console.log('✅ Connected to MongoDB');
    
    // Define schemas
    const Programme = mongoose.model('Programme', new mongoose.Schema({}, { strict: false }));
    const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({}, { strict: false }));
    const ProgrammeModule = mongoose.model('ProgrammeModule', new mongoose.Schema({}, { strict: false }));
    const ProgrammeLesson = mongoose.model('ProgrammeLesson', new mongoose.Schema({}, { strict: false }));
    
    console.log('\n🧹 Checking for orphaned data...');
    
    // Check all enrollments
    const enrollments = await Enrollment.find({});
    console.log(`Total enrollments: ${enrollments.length}`);
    
    let orphanedEnrollments = 0;
    for (const enrollment of enrollments) {
      const programme = await Programme.findById(enrollment.programmeId);
      if (!programme) {
        console.log(`Orphaned enrollment found: ${enrollment._id} -> Programme ${enrollment.programmeId} (doesn't exist)`);
        orphanedEnrollments++;
        
        // Uncomment to delete orphaned enrollments
        // await Enrollment.findByIdAndDelete(enrollment._id);
        // console.log(`  ✅ Deleted orphaned enrollment`);
      }
    }
    
    console.log(`\nOrphaned enrollments found: ${orphanedEnrollments}`);
    
    // Check modules
    const modules = await ProgrammeModule.find({});
    console.log(`Total modules: ${modules.length}`);
    
    let orphanedModules = 0;
    for (const module of modules) {
      const programme = await Programme.findById(module.programmeId);
      if (!programme) {
        console.log(`Orphaned module found: ${module._id} -> Programme ${module.programmeId} (doesn't exist)`);
        orphanedModules++;
      }
    }
    
    console.log(`Orphaned modules found: ${orphanedModules}`);
    
    // Check lessons
    const lessons = await ProgrammeLesson.find({});
    console.log(`Total lessons: ${lessons.length}`);
    
    let orphanedLessons = 0;
    for (const lesson of lessons) {
      if (lesson.programmeId) {
        const programme = await Programme.findById(lesson.programmeId);
        if (!programme) {
          console.log(`Orphaned lesson found: ${lesson._id} -> Programme ${lesson.programmeId} (doesn't exist)`);
          orphanedLessons++;
        }
      }
    }
    
    console.log(`Orphaned lessons found: ${orphanedLessons}`);
    
    // Check specific courses that are failing to delete
    const problematicCourses = [
      '68713f4e5a9f28413d25510d',
      '68712d75b2d0c0162634ad69'
    ];
    
    console.log('\n🔍 Checking problematic courses...');
    for (const courseId of problematicCourses) {
      console.log(`\nCourse: ${courseId}`);
      
      const course = await Programme.findById(courseId);
      if (course) {
        console.log(`  ✅ Course exists: ${course.title}`);
        
        const enrollmentCount = await Enrollment.countDocuments({ programmeId: courseId });
        console.log(`  📚 Enrollments: ${enrollmentCount}`);
        
        if (enrollmentCount > 0) {
          console.log(`  ⚠️  Cannot delete - has ${enrollmentCount} enrollments`);
          
          // Show enrollment details
          const enrollmentDetails = await Enrollment.find({ programmeId: courseId }).select('studentId enrollmentDate status');
          enrollmentDetails.forEach((enrollment, index) => {
            console.log(`    ${index + 1}. Student: ${enrollment.studentId} | Status: ${enrollment.status} | Date: ${enrollment.enrollmentDate}`);
          });
          
          console.log(`  💡 To force delete, you can remove enrollments first`);
          console.log(`     Run: db.enrollments.deleteMany({programmeId: ObjectId("${courseId}")})`);
        } else {
          console.log(`  ✅ Safe to delete - no enrollments`);
        }
      } else {
        console.log(`  ❌ Course doesn't exist`);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`- Orphaned enrollments: ${orphanedEnrollments}`);
    console.log(`- Orphaned modules: ${orphanedModules}`);
    console.log(`- Orphaned lessons: ${orphanedLessons}`);
    
    if (orphanedEnrollments > 0) {
      console.log('\n💡 To clean up orphaned enrollments, uncomment the deletion code in this script and run again.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupOrphanedData();
