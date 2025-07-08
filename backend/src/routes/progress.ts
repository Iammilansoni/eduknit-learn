import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import {
    getStudentProgress,
    getCourseProgress,
    markLessonCompleted,
    updateLessonProgress,
    recordQuizResults,
    getQuizResults,
    getProgressDashboard,
    getCourseAnalytics,
    getNextModule,
    getLearningStatistics
} from '../controllers/progressController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

/**
 * @route GET /api/progress/student/:studentId
 * @desc Get comprehensive progress for a student's enrolled courses
 * @query programmeId (optional) - Filter by specific programme
 * @access Private
 */
router.get('/student/:studentId', getStudentProgress);

/**
 * @route GET /api/progress/course/:studentId/:programmeId
 * @desc Get detailed progress for a specific course
 * @access Private
 */
router.get('/course/:studentId/:programmeId', getCourseProgress);

/**
 * @route GET /api/progress/next-module/:studentId/:programmeId
 * @desc Get the next module to complete based on prerequisites and progress
 * @access Private
 */
router.get('/next-module/:studentId/:programmeId', getNextModule);

/**
 * @route GET /api/progress/statistics/:studentId
 * @desc Get learning statistics and history for a student
 * @query programmeId (optional), timeframe (optional, default 30 days)
 * @access Private
 */
router.get('/statistics/:studentId', getLearningStatistics);

/**
 * @route POST /api/progress/lesson/complete
 * @desc Mark a lesson as completed
 * @body studentId, programmeId, moduleId, lessonId, timeSpent (optional)
 * @access Private
 */
router.post('/lesson/complete', markLessonCompleted);

/**
 * @route PUT /api/progress/lesson/update
 * @desc Update lesson progress (for partial completion)
 * @body studentId, programmeId, moduleId, lessonId, progressPercentage, timeSpent, watchTimeVideo
 * @access Private
 */
router.put('/lesson/update', updateLessonProgress);

/**
 * @route POST /api/progress/quiz/submit
 * @desc Record quiz/assessment results
 * @body studentId, programmeId, moduleId, lessonId, quizId, score, maxScore, timeSpent, answers, passingScore
 * @access Private
 */
router.post('/quiz/submit', recordQuizResults);

/**
 * @route GET /api/progress/quiz/:studentId/:lessonId
 * @desc Get quiz results for a lesson
 * @access Private
 */
router.get('/quiz/:studentId/:lessonId', getQuizResults);

/**
 * @route GET /api/progress/dashboard/:studentId
 * @desc Get comprehensive progress dashboard for a student
 * @access Private
 */
router.get('/dashboard/:studentId', getProgressDashboard);

/**
 * @route GET /api/progress/analytics/:studentId/:programmeId
 * @desc Get detailed analytics for a specific course
 * @access Private
 */
router.get('/analytics/:studentId/:programmeId', getCourseAnalytics);

export default router;
