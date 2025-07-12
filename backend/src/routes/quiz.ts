import express from 'express';
import {
    getLessonQuiz,
    startQuizAttempt,
    submitQuizAttempt,
    getQuizAttemptResults,
    getStudentQuizAttempts,
    getQuizAnalytics,
    createOrUpdateQuiz,
    deleteQuiz,
    getDetailedQuizAnalytics
} from '../controllers/quizController';
import { createJWTMiddleware } from '../utils/jwt';
import ProgrammeLesson from '../models/ProgrammeLesson';

const router = express.Router();

/**
 * Debug Routes (for development only)
 */

/**
 * @route   GET /api/quiz/debug/lesson/:lessonId
 * @desc    Debug endpoint to check lesson quiz data (no auth)
 * @access  Public (for debugging only)
 */
router.get('/debug/lesson/:lessonId', async (req, res) => {
    try {
        const { lessonId } = req.params;
        
        // Check if lesson ID is valid ObjectId format
        if (!lessonId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid lesson ID format',
                debug: { 
                    lessonId,
                    expectedFormat: '24-character hex string',
                    receivedFormat: `${lessonId.length}-character string`
                }
            });
        }
        
        const lesson = await ProgrammeLesson.findById(lessonId);
        
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found',
                debug: { 
                    lessonId,
                    searchedInCollection: 'ProgrammeLesson',
                    suggestion: 'Check if lesson ID is correct and lesson exists in database'
                }
            });
        }
        
        const quizData = lesson.quiz || lesson.content?.quiz;
        const hasQuiz = !!(quizData && quizData.questions && quizData.questions.length > 0);
        
        res.json({
            success: true,
            debug: {
                lessonId: lesson._id,
                lessonTitle: lesson.title,
                lessonType: lesson.type,
                hasContent: !!lesson.content,
                hasQuizInContent: !!lesson.content?.quiz,
                hasQuizInRoot: !!lesson.quiz,
                hasQuestions: !!(quizData?.questions),
                hasQuiz,
                questionCount: quizData?.questions?.length || 0,
                quizSettings: quizData ? {
                    timeLimit: quizData.timeLimit || (quizData as any).settings?.timeLimit,
                    passingScore: quizData.passingScore || (quizData as any).settings?.passingScore
                } : null,
                contentStructure: {
                    hasVideoUrl: !!lesson.content?.videoUrl,
                    hasTextContent: !!lesson.content?.textContent,
                    hasRichContent: !!lesson.content?.richContent,
                    contentFormat: lesson.content?.contentFormat
                },
                rawQuizData: quizData || null
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Debug endpoint error',
            error: error instanceof Error ? error.message : 'Unknown error',
            debug: {
                errorType: error instanceof Error ? error.constructor.name : typeof error,
                suggestion: 'Check database connection and lesson collection'
            }
        });
    }
});

/**
 * Student Quiz Routes
 */

/**
 * @route   GET /api/quiz/lesson/:lessonId
 * @desc    Get quiz for a specific lesson
 * @access  Private (Student)
 */
router.get('/lesson/:lessonId', createJWTMiddleware('access'), getLessonQuiz);

/**
 * @route   POST /api/quiz/lesson/:lessonId/start
 * @desc    Start a new quiz attempt
 * @access  Private (Student)
 */
router.post('/lesson/:lessonId/start', createJWTMiddleware('access'), startQuizAttempt);

/**
 * @route   POST /api/quiz/attempt/:attemptId/submit
 * @desc    Submit a quiz attempt with answers
 * @access  Private (Student)
 */
router.post('/attempt/:attemptId/submit', createJWTMiddleware('access'), submitQuizAttempt);

/**
 * @route   GET /api/quiz/attempt/:attemptId
 * @desc    Get results for a specific quiz attempt
 * @access  Private (Student)
 */
router.get('/attempt/:attemptId', createJWTMiddleware('access'), getQuizAttemptResults);

/**
 * @route   GET /api/quiz/student/attempts
 * @desc    Get all quiz attempts for the authenticated student
 * @access  Private (Student)
 */
router.get('/student/attempts', createJWTMiddleware('access'), getStudentQuizAttempts);

/**
 * Admin Analytics Routes
 */

/**
 * @route   GET /api/quiz/lesson/:lessonId/analytics
 * @desc    Get quiz analytics for a lesson (admin only)
 * @access  Private (Admin)
 */
router.get('/lesson/:lessonId/analytics', createJWTMiddleware('access'), getQuizAnalytics);

/**
 * Admin Quiz Management Routes
 */

/**
 * @route   POST /api/quiz/lesson/:lessonId/manage
 * @desc    Create or update quiz for a lesson (admin only)
 * @access  Private (Admin)
 */
router.post('/lesson/:lessonId/manage', createJWTMiddleware('access'), createOrUpdateQuiz);

/**
 * @route   DELETE /api/quiz/lesson/:lessonId/manage
 * @desc    Delete quiz from a lesson (admin only)
 * @access  Private (Admin)
 */
router.delete('/lesson/:lessonId/manage', createJWTMiddleware('access'), deleteQuiz);

/**
 * @route   GET /api/quiz/lesson/:lessonId/admin-analytics
 * @desc    Get detailed quiz analytics for admin
 * @access  Private (Admin)
 */
router.get('/lesson/:lessonId/admin-analytics', createJWTMiddleware('access'), getDetailedQuizAnalytics);

export default router;
