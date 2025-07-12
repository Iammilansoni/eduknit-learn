const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-db');

const lessonSchema = new mongoose.Schema({}, { strict: false });
const ProgrammeLesson = mongoose.model('ProgrammeLesson', lessonSchema);

async function createDemoQuizzesForAllLessons() {
  try {
    console.log('🎯 Creating demo quizzes for all lessons...\n');
    
    // Find all lessons
    const lessons = await ProgrammeLesson.find().limit(5);
    console.log(`Found ${lessons.length} lessons to add quizzes to.\n`);
    
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      
      // Create unique quiz for each lesson
      const quizData = {
        isActive: true,
        questions: [
          {
            id: `q1_${lesson._id}`,
            question: `What is the main focus of the lesson "${lesson.title}"?`,
            type: 'MULTIPLE_CHOICE',
            options: [
              'Understanding key concepts',
              'Memorizing facts',
              'Passing the test',
              'Reading quickly'
            ],
            correctAnswer: 'Understanding key concepts',
            points: 10,
            explanation: 'The main focus should always be understanding key concepts for practical application.'
          },
          {
            id: `q2_${lesson._id}`,
            question: 'True or False: Active learning is more effective than passive reading.',
            type: 'TRUE_FALSE',
            correctAnswer: true,
            points: 5,
            explanation: 'Active learning engages multiple cognitive processes and improves retention.'
          },
          {
            id: `q3_${lesson._id}`,
            question: 'List three key strategies for effective learning.',
            type: 'SHORT_ANSWER',
            correctAnswer: 'Practice, reflection, and application',
            points: 15,
            explanation: 'Effective learning requires practice, reflection on what was learned, and practical application.'
          },
          {
            id: `q4_${lesson._id}`,
            question: 'Which of the following is NOT a good study habit?',
            type: 'MULTIPLE_CHOICE',
            options: [
              'Taking regular breaks',
              'Cramming before exams',
              'Making notes',
              'Asking questions'
            ],
            correctAnswer: 'Cramming before exams',
            points: 10,
            explanation: 'Cramming leads to poor retention and understanding, while the others are effective strategies.'
          },
          {
            id: `q5_${lesson._id}`,
            question: 'Continuous learning is important for professional development.',
            type: 'TRUE_FALSE',
            correctAnswer: true,
            points: 5,
            explanation: 'Continuous learning keeps skills current and opens new opportunities.'
          }
        ],
        settings: {
          timeLimit: 20, // 20 minutes
          passingScore: 70,
          allowMultipleAttempts: true,
          showCorrectAnswers: true,
          showFeedback: true,
          maxAttempts: 3
        }
      };
      
      const updatedLesson = await ProgrammeLesson.findByIdAndUpdate(
        lesson._id,
        { $set: { quiz: quizData } },
        { new: true }
      );
      
      console.log(`✅ Added quiz to lesson: "${lesson.title}"`);
      console.log(`   - Lesson ID: ${lesson._id}`);
      console.log(`   - Quiz has ${quizData.questions.length} questions`);
      console.log(`   - Max score: ${quizData.questions.reduce((sum, q) => sum + q.points, 0)} points`);
      console.log(`   - Time limit: ${quizData.settings.timeLimit} minutes\n`);
    }
    
    console.log('🎉 Successfully added demo quizzes to all lessons!');
    console.log('\n📝 Quiz System Features:');
    console.log('✅ Multiple choice questions');
    console.log('✅ True/False questions');
    console.log('✅ Short answer questions');
    console.log('✅ Timer functionality');
    console.log('✅ Scoring and grading');
    console.log('✅ Progress tracking');
    console.log('✅ Multiple attempts allowed');
    console.log('✅ Detailed feedback');
    console.log('✅ Analytics support');
    
    console.log('\n🚀 To test the quiz system:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Start the frontend: npm run dev');
    console.log('3. Navigate to any lesson and look for the quiz option');
    console.log('4. Use the route: /lessons/{lessonId}/quiz');
    
  } catch (error) {
    console.error('❌ Error creating demo quizzes:', error);
  } finally {
    mongoose.connection.close();
  }
}

createDemoQuizzesForAllLessons();
