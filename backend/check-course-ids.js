const mongoose = require('mongoose');
require('dotenv').config();

async function checkCourseIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn');
    console.log('✅ Connected to MongoDB');
    
    // Define the schema
    const ProgrammeSchema = new mongoose.Schema({}, { strict: false });
    const Programme = mongoose.model('Programme', ProgrammeSchema);
    
    const courseIds = [
      '68713f4e5a9f28413d25510d',
      '68712d75b2d0c0162634ad69'
    ];
    
    console.log('\n🔍 Checking course IDs from the error...');
    
    for (const courseId of courseIds) {
      console.log(`\n📝 Checking course: ${courseId}`);
      
      // Check if it's a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        console.log('❌ Invalid ObjectId format');
        continue;
      }
      
      try {
        const course = await Programme.findById(courseId);
        if (course) {
          console.log('✅ Course found!');
          console.log(`   Title: ${course.title}`);
          console.log(`   Status: ${course.isActive ? 'Active' : 'Inactive'}`);
          console.log(`   Created: ${course.createdAt}`);
        } else {
          console.log('❌ Course not found in database');
        }
      } catch (error) {
        console.log('❌ Error fetching course:', error.message);
      }
    }
    
    // Also check all courses
    console.log('\n📚 All courses in database:');
    const allCourses = await Programme.find({}).select('_id title isActive').limit(10);
    allCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course._id} | ${course.title} | ${course.isActive ? 'Active' : 'Inactive'}`);
    });
    
    // Check enrollments for these courses
    console.log('\n🎓 Checking enrollments...');
    const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({}, { strict: false }));
    
    for (const courseId of courseIds) {
      const enrollmentCount = await Enrollment.countDocuments({ programmeId: courseId });
      console.log(`Course ${courseId}: ${enrollmentCount} enrollments`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCourseIds();
