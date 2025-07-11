const mongoose = require('mongoose');
require('dotenv').config();

// Import the compiled models
const ProgrammeLesson = require('./dist/models/ProgrammeLesson').default;

async function listLessons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find lessons
    const lessons = await ProgrammeLesson.find({ isActive: true }).limit(10);
    
    if (lessons.length === 0) {
      console.log('No lessons found');
      return;
    }

    console.log(`\n📚 Available Lessons for Testing (${lessons.length} total):\n`);
    
    lessons.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title}`);
      console.log(`   ID: ${lesson._id}`);
      console.log(`   Type: ${lesson.type}`);
      console.log(`   Content Format: ${lesson.content?.contentFormat || 'LEGACY'}`);
      console.log(`   Frontend URL: http://localhost:3000/lessons/${lesson._id}`);
      console.log(`   API URL: http://localhost:5000/api/courses/lesson-content/${lesson._id}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error fetching lessons:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

listLessons();
