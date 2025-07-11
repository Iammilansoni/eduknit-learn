const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-learn';

async function createTestEnrollment() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the user with email milansoni96946@gmail.com
    const user = await mongoose.connection.db.collection('users').findOne({
      email: 'milansoni96946@gmail.com'
    });

    if (!user) {
      console.log('User not found!');
      return;
    }

    console.log('Found user:', user.email, 'ID:', user._id);

    // Find a course to enroll in (Communication Skills)
    const course = await mongoose.connection.db.collection('programmes').findOne({
      slug: 'communication-skills'
    });

    if (!course) {
      console.log('Communication Skills course not found!');
      return;
    }

    console.log('Found course:', course.title, 'ID:', course._id);

    // Check if enrollment already exists
    const existingEnrollment = await mongoose.connection.db.collection('enrollments').findOne({
      studentId: user._id,
      programmeId: course._id
    });

    if (existingEnrollment) {
      console.log('User already enrolled in this course');
      return;
    }

    // Create enrollment
    const enrollment = {
      _id: new mongoose.Types.ObjectId(),
      studentId: user._id,
      programmeId: course._id,
      enrollmentNumber: `ENR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
      status: 'ACTIVE',
      enrollmentDate: new Date(),
      progress: {
        totalProgress: 0,
        completedModules: 0,
        totalModules: course.totalModules || 0,
        completedLessons: 0,
        totalLessons: course.totalLessons || 0,
        timeSpent: 0,
        lastAccessed: new Date(),
        progressHistory: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await mongoose.connection.db.collection('enrollments').insertOne(enrollment);
    console.log('✅ Successfully created test enrollment!');
    console.log('Enrollment ID:', enrollment._id);

    // Also create a UserCourse entry if it doesn't exist
    const existingUserCourse = await mongoose.connection.db.collection('usercourses').findOne({
      studentId: user._id,
      courseId: course._id
    });

    if (!existingUserCourse) {
      const userCourse = {
        _id: new mongoose.Types.ObjectId(),
        studentId: user._id,
        courseId: course._id,
        enrolledAt: new Date(),
        status: 'ACTIVE',
        progressPercent: 0,
        completedLessons: [],
        studyTime: 0,
        lastAccessed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await mongoose.connection.db.collection('usercourses').insertOne(userCourse);
      console.log('✅ Successfully created UserCourse entry!');
    }

  } catch (error) {
    console.error('Error creating test enrollment:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

createTestEnrollment();
