import express from 'express';
import { body } from 'express-validator';
import {
  getRealTimeDashboard,
  updateCourseProgress,
  getLearningStatistics
} from '../controllers/dashboardController';
import { createJWTMiddleware, authorizeRoles } from '../utils/jwt';

const router = express.Router();

// All routes require authentication
router.use(createJWTMiddleware('access'));

// All routes require student or user role
const requireStudent = authorizeRoles('student', 'user');

/**
 * @route   GET /api/dashboard/realtime
 * @desc    Get real-time synchronized dashboard data
 * @access  Student only
 */
router.get('/realtime', requireStudent, getRealTimeDashboard);

/**
 * @route   POST /api/dashboard/progress/update
 * @desc    Update course progress in real-time
 * @access  Student only
 */
router.post('/progress/update', requireStudent, [
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('lessonId').notEmpty().withMessage('Lesson ID is required'),
  body('timeSpent').optional().isNumeric().withMessage('Time spent must be a number'),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  body('moduleId').optional().isString().withMessage('Module ID must be a string')
], updateCourseProgress);

/**
 * @route   GET /api/dashboard/statistics
 * @desc    Get real-time learning statistics
 * @access  Student only
 * @query   days - Number of days to look back (default: 30)
 */
router.get('/statistics', requireStudent, getLearningStatistics);

export default router;
