import express from 'express';
import { body } from 'express-validator';
import {
  getStudentCoursesProgress,
  updateCourseProgressRealtime,
  getCourseAnalytics
} from '../controllers/courseProgressController';
import { createJWTMiddleware, authorizeRoles } from '../utils/jwt';
import { autoSyncLessonCompletion } from '../middleware/realtimeSync';

const router = express.Router();

// All routes require authentication
router.use(createJWTMiddleware('access'));

// All routes require student or user role
const requireStudent = authorizeRoles('student', 'user');

/**
 * @route   GET /api/course-progress/courses
 * @desc    Get comprehensive course progress data for student dashboard courses page
 * @access  Student only
 * @query   status - Filter by enrollment status (ACTIVE, COMPLETED, PAUSED, etc.)
 * @query   category - Filter by course category
 * @query   search - Search in course title, description, or category
 * @query   sortBy - Sort by field (lastActivity, progress, title, enrollmentDate)
 * @query   sortOrder - Sort order (asc, desc)
 */
router.get('/courses', requireStudent, getStudentCoursesProgress);

/**
 * @route   POST /api/course-progress/update
 * @desc    Update course progress in real-time
 * @access  Student only
 */
router.post('/update', requireStudent, autoSyncLessonCompletion, [
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('lessonId').notEmpty().withMessage('Lesson ID is required'),
  body('timeSpent').optional().isNumeric().withMessage('Time spent must be a number'),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  body('moduleId').optional().isString().withMessage('Module ID must be a string')
], updateCourseProgressRealtime);

/**
 * @route   GET /api/course-progress/analytics/:courseId
 * @desc    Get detailed analytics for a specific course
 * @access  Student only
 */
router.get('/analytics/:courseId', requireStudent, getCourseAnalytics);

export default router;
