const mongoose = require('mongoose');
const User = require('./src/models/User');
const QuizResult = require('./src/models/QuizResult');
const Programme = require('./src/models/Programme');
const ProgrammeModule = require('./src/models/ProgrammeModule');
const ProgrammeLesson = require('./src/models/ProgrammeLesson');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/eduknit_learn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createTestQuizResults = async () => {
  try {
    console.log('Creating test quiz results...');

    // Find a student user
    const student = await User.findOne({ role: 'student' });
    if (!student) {
      console.log('No student user found');
      return;
    }

    console.log(`Found student: ${student.email}`);

    // Find a programme
    const programme = await Programme.findOne();
    if (!programme) {
      console.log('No programme found');
      return;
    }

    console.log(`Found programme: ${programme.title}`);

    // Find a module
    const module = await ProgrammeModule.findOne({ programmeId: programme._id });
    if (!module) {
      console.log('No module found');
      return;
    }

    console.log(`Found module: ${module.title}`);

    // Find a lesson
    const lesson = await ProgrammeLesson.findOne({ moduleId: module._id });
    if (!lesson) {
      console.log('No lesson found');
      return;
    }

    console.log(`Found lesson: ${lesson.title}`);

    // Create test quiz results
    const testQuizResults = [
      {
        studentId: student._id,
        programmeId: programme._id,
        moduleId: module._id,
        lessonId: lesson._id,
        quizId: 'test-quiz-1',
        score: 8,
        maxScore: 10,
        percentage: 80,
        passingScore: 70,
        isPassed: true,
        timeSpent: 15,
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        attempt: 1,
        answers: [
          { questionId: 'q1', answer: 'A', isCorrect: true, pointsAwarded: 1 },
          { questionId: 'q2', answer: 'B', isCorrect: true, pointsAwarded: 1 },
          { questionId: 'q3', answer: 'C', isCorrect: false, pointsAwarded: 0 },
          { questionId: 'q4', answer: 'A', isCorrect: true, pointsAwarded: 1 },
          { questionId: 'q5', answer: 'B', isCorrect: true, pointsAwarded: 1 },
        ]
      },
      {
        studentId: student._id,
        programmeId: programme._id,
        moduleId: module._id,
        lessonId: lesson._id,
        quizId: 'test-quiz-2',
        score: 9,
        maxScore: 10,
        percentage: 90,
        passingScore: 70,
        isPassed: true,
        timeSpent: 12,
        startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        attempt: 1,
        answers: [
          { questionId: 'q1', answer: 'A', isCorrect: true, pointsAwarded: 1 },
          { questionId: 'q2', answer: 'B', isCorrect: true, pointsAwarded: 1 },
          { questionId: 'q3', answer: 'C', isCorrect: true, pointsAwarded: 1 },
          { questionId: 'q4', answer: 'A', isCorrect: true, pointsAwarded: 1 },
          { questionId: 'q5', answer: 'B', isCorrect: false, pointsAwarded: 0 },
        ]
      },
      {
        studentId: student._id,
        programmeId: programme._id,
        moduleId: module._id,
        lessonId: lesson._id,
        quizId: 'test-quiz-3',
        score: 6,
        maxScore: 10,
        percentage: 60,
        passingScore: 70,
        isPassed: false,
        timeSpent: 18,
        startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        attempt: 1,
        answers: [
          { questionId: 'q1', answer: 'A', isCorrect: true, pointsAwarded: 1 },
          { questionId: 'q2', answer: 'B', isCorrect: false, pointsAwarded: 0 },
          { questionId: 'q3', answer: 'C', isCorrect: true, pointsAwarded: 1 },
          { questionId: 'q4', answer: 'A', isCorrect: false, pointsAwarded: 0 },
          { questionId: 'q5', answer: 'B', isCorrect: true, pointsAwarded: 1 },
        ]
      },
      {
        studentId: student._id,
        programmeId: programme._id,
        moduleId: module._id,
        lessonId: lesson._id,
        quizId: 'test-quiz-4',
        score: 10,
        maxScore: 10,
        percentage: 100,
        passingScore: 70,
        isPassed: true,
        timeSpent: 10,
        startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        attempt: 1,
        answers: [
          { questionId: 'q1', answer: 'A', isCorrect: true, pointsAwarded: 1 },
          { questionId: 'q2', answer: 'B', isCorrect: true, pointsAwarded: 1 },
          { questionId: 'q3', answer: 'C', isCorrect: true, pointsAwarded: 1 },
          { questionId: 'q4', answer: 'A', isCorrect: true, pointsAwarded: 1 },
          { questionId: 'q5', answer: 'B', isCorrect: true, pointsAwarded: 1 },
        ]
      }
    ];

    // Delete existing test quiz results for this student
    await QuizResult.deleteMany({ studentId: student._id, quizId: { $regex: '^test-quiz-' } });

    // Insert test quiz results
    const results = await QuizResult.insertMany(testQuizResults);
    console.log(`Created ${results.length} test quiz results`);

    // Calculate expected analytics
    const totalQuizzes = results.length;
    const averageScore = Math.round(results.reduce((sum, quiz) => sum + quiz.percentage, 0) / totalQuizzes);
    const passedQuizzes = results.filter(quiz => quiz.isPassed).length;
    const passRate = Math.round((passedQuizzes / totalQuizzes) * 100);
    const bestScore = Math.max(...results.map(quiz => quiz.percentage));

    console.log('\nExpected Analytics:');
    console.log(`Quizzes Taken: ${totalQuizzes}`);
    console.log(`Average Score: ${averageScore}%`);
    console.log(`Pass Rate: ${passRate}%`);
    console.log(`Best Score: ${bestScore}%`);

    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating test quiz results:', error);
    mongoose.disconnect();
  }
};

createTestQuizResults();
