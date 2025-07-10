import express from 'express';
import {
  getModulesForCourse,
  getLessonsForModule,
  getLessonDetails,
  getLessonContent,
  updateLessonProgress,
  submitQuiz,
  getNextModule,
  getCourseProgress
} from '../controllers/courseContentController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

/**
 * @route GET /api/course-content/modules/:programmeId
 * @desc Get all modules for a course with progress information
 * @access Public (with optional studentId query param)
 */
router.get('/modules/:programmeId', getModulesForCourse);

/**
 * @route GET /api/course-content/lessons/:moduleId
 * @desc Get all lessons for a module with progress information
 * @access Public (with optional studentId query param)
 */
router.get('/lessons/:moduleId', getLessonsForModule);

/**
 * @route GET /api/course-content/lesson/:lessonId
 * @desc Get detailed lesson information with navigation
 * @access Public (with optional studentId query param)
 */
router.get('/lesson/:lessonId', getLessonDetails);

/**
 * @route GET /api/course-content/lesson-content/:lessonId
 * @desc Get lesson content with quiz if available
 * @access Public (with optional studentId query param)
 */
router.get('/lesson-content/:lessonId', getLessonContent);

/**
 * @route PUT /api/course-content/lesson-progress/:lessonId
 * @desc Update lesson progress
 * @access Private
 */
router.put('/lesson-progress/:lessonId', authenticateJWT, updateLessonProgress);

/**
 * @route POST /api/course-content/quiz/:lessonId
 * @desc Submit quiz answers
 * @access Private
 */
router.post('/quiz/:lessonId', authenticateJWT, submitQuiz);

/**
 * @route GET /api/course-content/next-module/:programmeId
 * @desc Get next module recommendation
 * @access Public (with optional studentId query param)
 */
router.get('/next-module/:programmeId', getNextModule);

/**
 * @route GET /api/course-content/progress/:programmeId
 * @desc Get course progress overview
 * @access Public (with optional studentId query param)
 */
router.get('/progress/:programmeId', getCourseProgress);

export default router;
