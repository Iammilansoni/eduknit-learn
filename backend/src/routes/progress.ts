import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import {
    getStudentProgress,
    getCourseProgress,
    markLessonCompleted,
    updateLessonProgress,
    recordQuizResult,
    getQuizResults,
    getProgressDashboard,
    getUserSmartProgress,
    getCourseProgressDetails,
    getGeneralProgress
} from '../controllers/progressController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

/**
 * @route GET /api/progress
 * @desc Get general progress overview for the authenticated user
 * @access Private
 */
router.get('/', getGeneralProgress);

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
 * @route GET /api/progress/course-details/:programmeId
 * @desc Get detailed progress structure for a specific course
 * @access Private
 */
router.get('/course-details/:programmeId', getCourseProgressDetails);

/**
 * @route POST /api/progress/lesson/:lessonId/complete
 * @desc Mark a lesson as completed
 * @body timeSpent, watchTimeVideo, notes
 * @access Private
 */
router.post('/lesson/:lessonId/complete', markLessonCompleted);

/**
 * @route PUT /api/progress/lesson/:lessonId/progress
 * @desc Update lesson progress (partial completion)
 * @body progressPercentage, timeSpent, watchTimeVideo, notes
 * @access Private
 */
router.put('/lesson/:lessonId/progress', updateLessonProgress);

/**
 * @route POST /api/progress/lesson/:lessonId/quiz
 * @desc Record quiz/assessment results
 * @body quizId, score, maxScore, passingScore, timeSpent, answers, feedback
 * @access Private
 */
router.post('/lesson/:lessonId/quiz', recordQuizResult);

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
// router.get('/analytics/:studentId/:programmeId', getCourseAnalytics); // TODO: Implement

/**
 * @route GET /api/progress/smart/:courseId
 * @desc Get smart progress calculation with deviation tracking for a specific course
 * @access Private
 */
router.get('/smart/:courseId', getUserSmartProgress);

export default router;
