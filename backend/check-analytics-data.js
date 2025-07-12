const mongoose = require('mongoose');
require('dotenv').config();

async function checkAnalyticsData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn');
    console.log('✅ Connected to MongoDB');
    
    // Check all collections for student data
    console.log('\n🔍 Checking collections for student analytics data...');
    
    // Check users
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const users = await User.find({ role: 'student' }).limit(5);
    console.log(`\n👥 Students found: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user._id} | Email: ${user.email} | Name: ${user.firstName} ${user.lastName}`);
    });
    
    if (users.length === 0) {
      console.log('❌ No students found in database');
      return;
    }
    
    const studentId = users[0]._id;
    console.log(`\n🎯 Using student ID: ${studentId} for analytics check`);
    
    // Check enrollments
    const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({}, { strict: false }));
    const enrollments = await Enrollment.find({ studentId });
    console.log(`\n📚 Enrollments for student: ${enrollments.length}`);
    enrollments.forEach((enrollment, index) => {
      console.log(`  ${index + 1}. Programme: ${enrollment.programmeId} | Status: ${enrollment.status} | Progress: ${enrollment.progress?.totalProgress || 0}%`);
    });
    
    // Check lesson completions
    const LessonCompletion = mongoose.model('LessonCompletion', new mongoose.Schema({}, { strict: false }));
    const lessonCompletions = await LessonCompletion.find({ userId: studentId });
    console.log(`\n✅ Lesson completions: ${lessonCompletions.length}`);
    
    // Check quiz results
    const QuizResult = mongoose.model('QuizResult', new mongoose.Schema({}, { strict: false }));
    const quizResults = await QuizResult.find({ studentId });
    console.log(`\n🎯 Quiz results: ${quizResults.length}`);
    
    // Check student profile
    const StudentProfile = mongoose.model('StudentProfile', new mongoose.Schema({}, { strict: false }));
    const profile = await StudentProfile.findOne({ userId: studentId });
    console.log(`\n👤 Student profile exists: ${!!profile}`);
    if (profile) {
      console.log(`   Gamification data: ${!!profile.gamification}`);
      if (profile.gamification) {
        console.log(`   Points: ${profile.gamification.totalPoints || 0}`);
        console.log(`   Level: ${profile.gamification.level || 1}`);
        console.log(`   Badges: ${profile.gamification.badges?.length || 0}`);
      }
    }
    
    // Check user courses
    const UserCourse = mongoose.model('UserCourse', new mongoose.Schema({}, { strict: false }));
    const userCourses = await UserCourse.find({ userId: studentId });
    console.log(`\n📖 User courses: ${userCourses.length}`);
    userCourses.forEach((course, index) => {
      console.log(`  ${index + 1}. Course: ${course.courseId} | Progress: ${course.progressPercent}% | Status: ${course.status}`);
    });
    
    // Summary
    console.log('\n📊 ANALYTICS DATA SUMMARY:');
    console.log('=' + '='.repeat(50));
    console.log(`Students: ${users.length}`);
    console.log(`Enrollments: ${enrollments.length}`);
    console.log(`Lesson Completions: ${lessonCompletions.length}`);
    console.log(`Quiz Results: ${quizResults.length}`);
    console.log(`User Courses: ${userCourses.length}`);
    console.log(`Profile: ${profile ? 'Exists' : 'Missing'}`);
    
    if (enrollments.length === 0 && lessonCompletions.length === 0 && quizResults.length === 0) {
      console.log('\n❌ NO REAL DATA FOUND - This explains why analytics is empty!');
      console.log('💡 SOLUTION: Need to create real student activity data');
    } else {
      console.log('\n✅ Real data found - analytics should work');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAnalyticsData();
