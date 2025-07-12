const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./src/models/User').default;
const Enrollment = require('./src/models/Enrollment').default;
const LessonCompletion = require('./src/models/LessonCompletion').default;
const StudentProfile = require('./src/models/StudentProfile').default;
const Programme = require('./src/models/Programme').default;

// Import services
const RealtimeSyncService = require('./src/services/realtimeSyncService').default;

async function testRealtimeSync() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn');
    console.log('Connected to database');

    // Find a test student
    const testStudent = await User.findOne({ role: 'student' });
    if (!testStudent) {
      console.log('No student found. Please create a student user first.');
      return;
    }

    console.log(`Testing with student: ${testStudent.email} (${testStudent._id})`);

    // Find a test course
    const testCourse = await Programme.findOne();
    if (!testCourse) {
      console.log('No programme found. Please create a programme first.');
      return;
    }

    console.log(`Testing with course: ${testCourse.title} (${testCourse._id})`);

    // Test 1: Check initial dashboard data
    console.log('\n=== Test 1: Initial Dashboard Data ===');
    const initialData = await RealtimeSyncService.getRealTimeDashboardData(testStudent._id.toString());
    console.log('Initial Dashboard Data:', {
      enrolledCourses: initialData.enrolledCourses,
      averageProgress: initialData.averageProgress,
      totalHoursLearned: initialData.totalHoursLearned,
      learningStreak: initialData.learningStreak,
      totalPoints: initialData.totalPoints
    });

    // Test 2: Create or find enrollment
    console.log('\n=== Test 2: Enrollment Check ===');
    let enrollment = await Enrollment.findOne({
      studentId: testStudent._id,
      programmeId: testCourse._id
    });

    if (!enrollment) {
      enrollment = new Enrollment({
        studentId: testStudent._id,
        programmeId: testCourse._id,
        enrollmentDate: new Date(),
        status: 'ACTIVE',
        progress: {
          completedModules: [],
          completedLessons: [],
          totalProgress: 0,
          lastActivityDate: new Date(),
          timeSpent: 0
        },
        paymentStatus: 'COMPLETED',
        certificateIssued: false,
        metadata: { enrollmentSource: 'TEST' }
      });
      await enrollment.save();
      console.log('Created new enrollment');
    } else {
      console.log('Using existing enrollment');
    }

    // Test 3: Simulate lesson completion
    console.log('\n=== Test 3: Lesson Completion Sync ===');
    const testLessonId = new mongoose.Types.ObjectId();
    const testModuleId = new mongoose.Types.ObjectId();
    const timeSpent = 30; // 30 minutes

    await RealtimeSyncService.syncLessonCompletion(
      testStudent._id.toString(),
      testCourse._id.toString(),
      testModuleId.toString(),
      testLessonId.toString(),
      timeSpent
    );

    console.log('Lesson completion synced successfully');

    // Test 4: Check updated dashboard data
    console.log('\n=== Test 4: Updated Dashboard Data ===');
    const updatedData = await RealtimeSyncService.getRealTimeDashboardData(testStudent._id.toString());
    console.log('Updated Dashboard Data:', {
      enrolledCourses: updatedData.enrolledCourses,
      averageProgress: updatedData.averageProgress,
      totalHoursLearned: updatedData.totalHoursLearned,
      learningStreak: updatedData.learningStreak,
      totalPoints: updatedData.totalPoints
    });

    // Test 5: Check lesson completion record
    console.log('\n=== Test 5: Lesson Completion Record ===');
    const lessonCompletion = await LessonCompletion.findOne({
      userId: testStudent._id,
      lessonId: testLessonId
    });
    console.log('Lesson Completion:', lessonCompletion ? {
      lessonId: lessonCompletion.lessonId,
      completedAt: lessonCompletion.completedAt,
      timeSpent: lessonCompletion.timeSpent
    } : 'Not found');

    // Test 6: Check updated enrollment
    console.log('\n=== Test 6: Updated Enrollment ===');
    const updatedEnrollment = await Enrollment.findOne({
      studentId: testStudent._id,
      programmeId: testCourse._id
    });
    console.log('Updated Enrollment Progress:', {
      completedLessons: updatedEnrollment.progress.completedLessons.length,
      totalProgress: updatedEnrollment.progress.totalProgress,
      timeSpent: updatedEnrollment.progress.timeSpent,
      lastActivityDate: updatedEnrollment.progress.lastActivityDate
    });

    // Test 7: Check updated student profile
    console.log('\n=== Test 7: Updated Student Profile ===');
    const updatedProfile = await StudentProfile.findOne({ userId: testStudent._id });
    console.log('Updated Student Profile:', updatedProfile ? {
      totalLearningHours: updatedProfile.statistics.totalLearningHours,
      currentStreak: updatedProfile.gamification.streaks.currentLearningStreak,
      longestStreak: updatedProfile.gamification.streaks.longestLearningStreak,
      totalPoints: updatedProfile.gamification.totalPoints,
      level: updatedProfile.gamification.level
    } : 'Profile not found');

    // Test 8: Simulate quiz completion
    console.log('\n=== Test 8: Quiz Completion Sync ===');
    await RealtimeSyncService.syncQuizCompletion(
      testStudent._id.toString(),
      testCourse._id.toString(),
      testLessonId.toString(),
      {
        score: 85,
        maxScore: 100,
        timeSpent: 15,
        passed: true
      }
    );

    console.log('Quiz completion synced successfully');

    // Test 9: Final dashboard data
    console.log('\n=== Test 9: Final Dashboard Data ===');
    const finalData = await RealtimeSyncService.getRealTimeDashboardData(testStudent._id.toString());
    console.log('Final Dashboard Data:', {
      enrolledCourses: finalData.enrolledCourses,
      averageProgress: finalData.averageProgress,
      totalHoursLearned: finalData.totalHoursLearned,
      learningStreak: finalData.learningStreak,
      totalPoints: finalData.totalPoints,
      level: finalData.level
    });

    console.log('\n=== Real-time Sync Test Completed Successfully ===');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run the test
if (require.main === module) {
  testRealtimeSync();
}

module.exports = testRealtimeSync;
