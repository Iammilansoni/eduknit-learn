const mongoose = require('mongoose');

async function getLessonIds() {
  try {
    await mongoose.connect('mongodb://localhost:27017/eduknit-learn');
    console.log('Connected to MongoDB');
    
    // Simple query to get lesson IDs
    const lessons = await mongoose.connection.db.collection('programmelessons').find({}, { _id: 1, title: 1 }).limit(5).toArray();
    
    console.log('Available lesson IDs:');
    lessons.forEach(lesson => {
      console.log(`ID: ${lesson._id}, Title: ${lesson.title || 'No title'}`);
    });
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getLessonIds();
