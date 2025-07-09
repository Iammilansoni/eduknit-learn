import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import {
    getAllCourses,
    getCourseDetails,
    getModulesForCourse,
    getLessonsForModule,
    getLessonDetails,
    getLessonContent,
    submitQuiz,
    getNextModule
} from '../controllers/courseContentController';

const router = express.Router();

/**
 * @route GET /api/courses
 * @desc Get all available courses
 * @access Public
 */
router.get('/', getAllCourses);

/**
 * @route GET /api/courses/:id
 * @desc Get specific course details
 * @access Public
 */
router.get('/:id', getCourseDetails);

/**
 * @route GET /api/courses/:id/modules
 * @desc Get all modules for a specific course
 * @access Public
 */
router.get('/:id/modules', getModulesForCourse);

/**
 * @route GET /api/courses/:id/modules/:moduleId/lessons
 * @desc Get all lessons for a specific module
 * @access Public
 */
router.get('/:id/modules/:moduleId/lessons', getLessonsForModule);

/**
 * @route GET /api/lessons/:id
 * @desc Get specific lesson details
 * @access Public
 */
router.get('/lessons/:id', getLessonDetails);

/**
 * @route GET /api/lessons/:lessonId/content
 * @desc Get lesson content with quiz if available
 * @query studentId - Student ID for progress tracking
 * @access Private
 */
router.get('/lessons/:lessonId/content', authenticateJWT, getLessonContent);

/**
 * @route POST /api/lessons/:lessonId/quiz
 * @desc Submit quiz answers and get results
 * @body studentId, answers, timeSpent
 * @access Private
 */
router.post('/lessons/:lessonId/quiz', authenticateJWT, submitQuiz);

/**
 * @route GET /api/courses/:programmeId/next-module
 * @desc Get next recommended module for a student
 * @query studentId - Student ID
 * @access Private
 */
router.get('/:programmeId/next-module', authenticateJWT, getNextModule);

export default router;
