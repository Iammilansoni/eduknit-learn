import express from 'express';
import {
  getModulesForCourse,
  getLessonsForModule,
  getLessonDetails,
  getLessonContent,
  updateLessonProgress,
  submitQuiz,
  getNextModule,
  getCourseProgress,
  getAllCourses,
  getCourseMapping
} from '../controllers/courseContentController';
import { getCourseBySlug, debugAllCourses } from '../controllers/courseController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

/**
 * @route GET /api/courses
 * @desc Get all active courses
 * @access Public
 */
router.get('/', getAllCourses);

/**
 * @route GET /api/courses/mapping
 * @desc Get course slug to ID mapping
 * @access Public
 */
router.get('/mapping', getCourseMapping);

/**
 * @route GET /api/courses/debug
 * @desc Debug endpoint to list all courses with slugs
 * @access Public
 */
router.get('/debug', debugAllCourses);

/**
 * @route GET /api/courses/slug/:slug
 * @desc Get course by slug
 * @access Public
 */
router.get('/slug/:slug', getCourseBySlug);

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
