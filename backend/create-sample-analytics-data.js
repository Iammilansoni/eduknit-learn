const mongoose = require('mongoose');
require('dotenv').config();

async function createSampleAnalyticsData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn');
    console.log('✅ Connected to MongoDB');
    
    // Find a student user
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    let student = await User.findOne({ email: 'milansoni96946@gmail.com' });
    
    if (!student) {
      console.log('❌ Student not found. Creating sample data for any student...');
      student = await User.findOne({ role: 'student' });
      if (!student) {
        console.log('❌ No students found in database');
        return;
      }
    }
    
    const studentId = student._id;
    console.log(`🎯 Creating analytics data for student: ${student.email} (${studentId})`);
    
    // 1. Create/Update Student Profile with gamification data
    const StudentProfile = mongoose.model('StudentProfile', new mongoose.Schema({}, { strict: false }));
    let profile = await StudentProfile.findOne({ userId: studentId });
    
    if (!profile) {
      profile = new StudentProfile({
        userId: studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        isProfileComplete: true,
        completionPercentage: 85,
        enrollmentStatus: 'active'
      });
    }
    
    // Add gamification data
    profile.gamification = {
      totalPoints: 1250,
      level: 5,
      badges: [
        { name: 'First Steps', description: 'Completed first lesson', earnedAt: new Date() },
        { name: 'Quiz Master', description: 'Passed 5 quizzes', earnedAt: new Date() },
        { name: 'Streak Champion', description: '7-day learning streak', earnedAt: new Date() }
      ]
    };
    
    await profile.save();
    console.log('✅ Student profile updated with gamification data');
    
    // 2. Create sample enrollments
    const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({}, { strict: false }));
    
    // First, check if we have any programmes
    const Programme = mongoose.model('Programme', new mongoose.Schema({}, { strict: false }));
    const programmes = await Programme.find({}).limit(3);
    
    if (programmes.length === 0) {
      console.log('❌ No programmes found. Creating sample programme...');
      const sampleProgramme = new Programme({
        title: 'Sample Programming Course',
        description: 'A comprehensive programming course for beginners',
        category: 'Technology',
        level: 'Beginner',
        status: 'PUBLISHED',
        createdBy: studentId
      });
      await sampleProgramme.save();
      programmes.push(sampleProgramme);
    }
    
    // Create enrollments if they don't exist
    for (let i = 0; i < Math.min(programmes.length, 2); i++) {
      const existingEnrollment = await Enrollment.findOne({ 
        studentId, 
        programmeId: programmes[i]._id 
      });
      
      if (!existingEnrollment) {
        const enrollment = new Enrollment({
          studentId,
          programmeId: programmes[i]._id,
          status: 'ACTIVE',
          enrollmentDate: new Date(),
          progress: {
            totalProgress: 65 + (i * 20),
            lessonsCompleted: 8 + (i * 3),
            totalLessons: 12 + (i * 2),
            timeSpent: 240 + (i * 120), // minutes
            lastActivityDate: new Date()
          }
        });
        await enrollment.save();
        console.log(`✅ Created enrollment for programme: ${programmes[i].title}`);
      }
    }
    
    // 3. Create sample lesson completions
    const LessonCompletion = mongoose.model('LessonCompletion', new mongoose.Schema({}, { strict: false }));
    
    // Create some lesson completions over the past week
    const completionDates = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      completionDates.push(date);
    }
    
    for (let i = 0; i < 12; i++) {
      const existingCompletion = await LessonCompletion.findOne({ 
        userId: studentId,
        lessonId: `lesson_${i + 1}`
      });
      
      if (!existingCompletion) {
        const completion = new LessonCompletion({
          userId: studentId,
          lessonId: `lesson_${i + 1}`,
          courseId: programmes[0]._id,
          progressPercentage: 100,
          timeSpent: 15 + Math.floor(Math.random() * 30), // 15-45 minutes
          completed: true,
          createdAt: completionDates[Math.floor(Math.random() * completionDates.length)]
        });
        await completion.save();
      }
    }
    console.log('✅ Created sample lesson completions');
    
    // 4. Create sample quiz results
    const QuizResult = mongoose.model('QuizResult', new mongoose.Schema({}, { strict: false }));
    
    for (let i = 0; i < 8; i++) {
      const existingQuiz = await QuizResult.findOne({ 
        studentId,
        quizId: `quiz_${i + 1}`
      });
      
      if (!existingQuiz) {
        const quizResult = new QuizResult({
          studentId,
          quizId: `quiz_${i + 1}`,
          programmeId: programmes[0]._id,
          score: 70 + Math.floor(Math.random() * 30), // 70-100
          maxScore: 100,
          timeSpent: 5 + Math.floor(Math.random() * 15), // 5-20 minutes
          passed: true,
          answers: [],
          submittedAt: completionDates[Math.floor(Math.random() * completionDates.length)]
        });
        await quizResult.save();
      }
    }
    console.log('✅ Created sample quiz results');
    
    // 5. Create UserCourse records if they don't exist
    const UserCourse = mongoose.model('UserCourse', new mongoose.Schema({}, { strict: false }));
    
    for (let i = 0; i < programmes.length; i++) {
      const existingUserCourse = await UserCourse.findOne({ 
        userId: studentId,
        courseId: programmes[i]._id
      });
      
      if (!existingUserCourse) {
        const userCourse = new UserCourse({
          userId: studentId,
          courseId: programmes[i]._id,
          progressPercent: 65 + (i * 15),
          status: i === 0 ? 'IN_PROGRESS' : 'ENROLLED',
          enrolledAt: new Date(),
          lastAccessedAt: new Date()
        });
        await userCourse.save();
        console.log(`✅ Created UserCourse record for: ${programmes[i].title}`);
      }
    }
    
    console.log('\n🎉 Sample analytics data created successfully!');
    console.log('\n📊 Summary of created data:');
    console.log(`- Student Profile: Updated with gamification`);
    console.log(`- Enrollments: ${Math.min(programmes.length, 2)}`);
    console.log(`- Lesson Completions: 12`);
    console.log(`- Quiz Results: 8`);
    console.log(`- UserCourse Records: ${programmes.length}`);
    
    console.log('\n✨ Now try refreshing the analytics page - it should show real data!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
}

createSampleAnalyticsData();
