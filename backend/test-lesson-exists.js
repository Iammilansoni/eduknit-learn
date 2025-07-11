const mongoose = require('mongoose');

// Define the schema first
const programmeModuleSchema = new mongoose.Schema({
  programmeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme', required: true },
  title: { type: String, required: true },
  description: String,
  order: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  estimatedDuration: Number,
  learningObjectives: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const programmeLessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProgrammeModule', required: true },
  programmeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme', required: true },
  title: { type: String, required: true },
  description: String,
  order: { type: Number, required: true },
  type: { type: String, enum: ['VIDEO', 'TEXT', 'INTERACTIVE', 'ASSESSMENT'], default: 'TEXT' },
  isActive: { type: Boolean, default: true },
  estimatedDuration: Number,
  content: {
    text: String,
    videoUrl: String,
    videoThumbnail: String,
    resources: [{
      title: String,
      url: String,
      type: { type: String, enum: ['PDF', 'LINK', 'VIDEO', 'IMAGE'] }
    }],
    quiz: {
      timeLimit: Number,
      passingScore: Number,
      questions: [{
        id: String,
        question: String,
        type: { type: String, enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'] },
        options: [String],
        correctAnswer: String,
        points: Number,
        explanation: String
      }]
    }
  },
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProgrammeLesson' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ProgrammeLesson = mongoose.model('ProgrammeLesson', programmeLessonSchema);

async function testLessonContent() {
  try {
    await mongoose.connect('mongodb://localhost:27017/eduknit-learn');
    console.log('Connected to MongoDB');
    
    // Find the lesson ID from the error
    const lessonId = '6870c07711c5ed1e9f1e53ea';
    const lesson = await ProgrammeLesson.findById(lessonId);
    
    if (lesson) {
      console.log('✓ Lesson found:', lesson.title);
      console.log('✓ Lesson ID:', lesson._id.toString());
      console.log('✓ Module ID:', lesson.moduleId);
      console.log('✓ Programme ID:', lesson.programmeId);
      console.log('✓ Lesson type:', lesson.type);
      console.log('✓ Has content:', !!lesson.content);
    } else {
      console.log('✗ Lesson not found with ID:', lessonId);
      
      // Check if there are any lessons at all
      const lessonsCount = await ProgrammeLesson.countDocuments();
      console.log('Total lessons in database:', lessonsCount);
      
      if (lessonsCount > 0) {
        const sampleLesson = await ProgrammeLesson.findOne();
        console.log('Sample lesson ID:', sampleLesson._id.toString());
      }
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testLessonContent();
