const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduknit-db');

const programmeSchema = new mongoose.Schema({}, { strict: false });
const Programme = mongoose.model('Programme', programmeSchema);

const lessonSchema = new mongoose.Schema({}, { strict: false });
const ProgrammeLesson = mongoose.model('ProgrammeLesson', lessonSchema);

async function addQuizToLesson() {
  try {
    // Find a lesson to add quiz to
    const lesson = await ProgrammeLesson.findOne().limit(1);
    if (!lesson) {
      console.log('No lessons found');
      return;
    }
    
    console.log('Found lesson:', lesson.title);
    console.log('Lesson ID:', lesson._id);
    
    // Add a comprehensive quiz to this lesson
    const quizData = {
      isActive: true,
      questions: [
        {
          id: 'q1',
          question: 'What is the primary purpose of effective communication?',
          type: 'MULTIPLE_CHOICE',
          options: [
            'To impress others with vocabulary',
            'To share information clearly and build understanding',
            'To dominate conversations',
            'To avoid silence'
          ],
          correctAnswer: 'To share information clearly and build understanding',
          points: 10,
          explanation: 'Effective communication is about clarity, understanding, and connection between people.'
        },
        {
          id: 'q2',
          question: 'Active listening involves interrupting the speaker to show engagement.',
          type: 'TRUE_FALSE',
          correctAnswer: false,
          points: 5,
          explanation: 'Active listening means giving your full attention without interrupting, showing respect for the speaker.'
        },
        {
          id: 'q3',
          question: 'Describe three key elements of non-verbal communication.',
          type: 'SHORT_ANSWER',
          correctAnswer: 'Body language, facial expressions, and tone of voice',
          points: 15,
          explanation: 'Non-verbal communication includes body language, facial expressions, tone of voice, eye contact, and gestures.'
        },
        {
          id: 'q4',
          question: 'Which of the following is NOT a barrier to effective communication?',
          type: 'MULTIPLE_CHOICE',
          options: [
            'Language differences',
            'Emotional state',
            'Clear articulation',
            'Physical distractions'
          ],
          correctAnswer: 'Clear articulation',
          points: 10,
          explanation: 'Clear articulation actually helps communication, while the others can create barriers.'
        },
        {
          id: 'q5',
          question: 'Empathy in communication means understanding and sharing the feelings of others.',
          type: 'TRUE_FALSE',
          correctAnswer: true,
          points: 5,
          explanation: 'Empathy is crucial for building trust and connection in communication.'
        }
      ],
      settings: {
        timeLimit: 15,
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
    
    console.log('Successfully added quiz to lesson:', updatedLesson.title);
    console.log('Quiz has', updatedLesson.quiz.questions.length, 'questions');
    console.log('Lesson ID for testing:', lesson._id.toString());
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

addQuizToLesson();
