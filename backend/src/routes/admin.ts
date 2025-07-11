import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
  getCourseStats,
  getOverallCourseStats,
  getEnrollmentStats,
  getDashboardStats,
  getAdminAnalytics,
  createModule,
  getModulesByProgramme,
  getModuleById,
  updateModule,
  deleteModule,
  createLesson,
  getLessonsByModule,
  getLessonById,
  updateLesson,
  deleteLesson,
  toggleModuleStatus
} from '../controllers/adminController';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticateJWT);
router.use(authorizeRoles('admin'));

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get comprehensive dashboard statistics
 * @access  Admin only
 */
router.get('/dashboard/stats', getDashboardStats);

/**
 * @route   POST /api/admin/courses
 * @desc    Create a new course
 * @access  Admin only
 */
router.post('/courses', [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters'),
  body('category').isIn(['AI_CERTIFICATE', 'DATA_CERTIFICATION', 'PROFESSIONAL_SKILLS', 'TECHNICAL_SKILLS']).withMessage('Invalid category'),
  body('instructor').trim().isLength({ min: 1, max: 100 }).withMessage('Instructor is required and must be less than 100 characters'),
  body('duration').optional().trim().isLength({ max: 100 }),
  body('timeframe').optional().trim().isLength({ max: 100 }),
  body('level').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']).withMessage('Invalid level'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('overview').optional().trim().isLength({ max: 2000 }).withMessage('Overview must be less than 2000 characters'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('prerequisites').optional().isArray().withMessage('Prerequisites must be an array'),
  body('totalModules').optional().isInt({ min: 0 }).withMessage('Total modules must be a positive integer'),
  body('totalLessons').optional().isInt({ min: 0 }).withMessage('Total lessons must be a positive integer'),
  body('estimatedDuration').optional().isFloat({ min: 0 }).withMessage('Estimated duration must be a positive number'),
  body('durationDays').optional().isInt({ min: 1 }).withMessage('Duration days must be a positive integer'),
  body('certificateAwarded').optional().isBoolean().withMessage('Certificate awarded must be a boolean'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),
  handleValidationErrors
], createCourse);

/**
 * @route   GET /api/admin/courses/stats
 * @desc    Get overall course statistics for dashboard
 * @access  Admin only
 */
router.get('/courses/stats', getOverallCourseStats);

/**
 * @route   GET /api/admin/courses
 * @desc    Get all courses with pagination and filtering
 * @access  Admin only
 */
router.get('/courses', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term must be less than 100 characters'),
  query('category').optional().isIn(['AI_CERTIFICATE', 'DATA_CERTIFICATION', 'PROFESSIONAL_SKILLS', 'TECHNICAL_SKILLS']).withMessage('Invalid category'),
  query('level').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']).withMessage('Invalid level'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  handleValidationErrors
], getAllCourses);

/**
 * @route   GET /api/admin/courses/:id
 * @desc    Get course by ID with full details
 * @access  Admin only
 */
router.get('/courses/:id', [
  param('id').isMongoId().withMessage('Invalid course ID'),
  handleValidationErrors
], getCourseById);

/**
 * @route   PUT /api/admin/courses/:id
 * @desc    Update course
 * @access  Admin only
 */
router.put('/courses/:id', [
  param('id').isMongoId().withMessage('Invalid course ID'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('category').optional().isIn(['AI_CERTIFICATE', 'DATA_CERTIFICATION', 'PROFESSIONAL_SKILLS', 'TECHNICAL_SKILLS']).withMessage('Invalid category'),
  body('instructor').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Instructor must be less than 100 characters'),
  body('duration').optional().trim().isLength({ max: 100 }),
  body('timeframe').optional().trim().isLength({ max: 100 }),
  body('level').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']).withMessage('Invalid level'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('overview').optional().trim().isLength({ max: 2000 }).withMessage('Overview must be less than 2000 characters'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('prerequisites').optional().isArray().withMessage('Prerequisites must be an array'),
  body('totalModules').optional().isInt({ min: 0 }).withMessage('Total modules must be a positive integer'),
  body('totalLessons').optional().isInt({ min: 0 }).withMessage('Total lessons must be a positive integer'),
  body('estimatedDuration').optional().isFloat({ min: 0 }).withMessage('Estimated duration must be a positive number'),
  body('durationDays').optional().isInt({ min: 1 }).withMessage('Duration days must be a positive integer'),
  body('certificateAwarded').optional().isBoolean().withMessage('Certificate awarded must be a boolean'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),
  handleValidationErrors
], updateCourse);

/**
 * @route   DELETE /api/admin/courses/:id
 * @desc    Delete course
 * @access  Admin only
 */
router.delete('/courses/:id', [
  param('id').isMongoId().withMessage('Invalid course ID'),
  handleValidationErrors
], deleteCourse);

/**
 * @route   PATCH /api/admin/courses/:id/toggle-status
 * @desc    Toggle course status (active/inactive)
 * @access  Admin only
 */
router.patch('/courses/:id/toggle-status', [
  param('id').isMongoId().withMessage('Invalid course ID'),
  handleValidationErrors
], toggleCourseStatus);

/**
 * @route   GET /api/admin/courses/:id/stats
 * @desc    Get course statistics
 * @access  Admin only
 */
router.get('/courses/:id/stats', [
  param('id').isMongoId().withMessage('Invalid course ID'),
  handleValidationErrors
], getCourseStats);

/**
 * MODULE CRUD (Admin)
 */
router.post('/modules', createModule);
router.get('/modules', getModulesByProgramme); // ?programmeId=...
router.get('/modules/:id', getModuleById);
router.put('/modules/:id', updateModule);
router.delete('/modules/:id', deleteModule);
router.patch('/modules/:id/toggle-status', toggleModuleStatus);

/**
 * LESSON CRUD (Admin)
 */
router.post('/lessons', createLesson);
router.get('/lessons', getLessonsByModule); // ?moduleId=...
router.get('/lessons/:id', getLessonById);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);

/**
 * @route   GET /api/admin/enrollments/stats
 * @desc    Get enrollment statistics for dashboard
 * @access  Admin only
 */
router.get('/enrollments/stats', getEnrollmentStats);

/**
 * @route   GET /api/admin/analytics
 * @desc    Get comprehensive admin analytics data
 * @access  Admin only
 */
router.get('/analytics', getAdminAnalytics);

export default router; 