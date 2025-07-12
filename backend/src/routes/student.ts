import express from 'express';
import { body } from 'express-validator';
import { autoSyncLessonCompletion, autoSyncEnrollmentStats } from '../middleware/realtimeSync';
import {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  getProfilePhotoUrl,
  getStudentEnrollments,
  getEnrollmentDetails,
  getEnrolledPrograms,
  updateLearningActivity,
  getStudentAnalytics,
  getCourseAnalytics,
  upload,
  enrollInProgram,
  markLessonCompleted,
  updateLessonProgress,
  updateEnrollmentStatus
} from '../controllers/studentController';
import { 
  createJWTMiddleware, 
  authorizeRoles 
} from '../utils/jwt';

const router = express.Router();

// All routes require authentication
router.use(createJWTMiddleware('access'));

// All routes require student or user role (user role should have student access)
const requireStudent = authorizeRoles('student', 'user');

// Validation middleware for profile updates
const profileValidation = [
  body('contactInfo.phoneNumber').optional().matches(/^\+?[\d\s\-\(\)]{10,15}$/).withMessage('Invalid phone number format'),
  body('contactInfo.alternateEmail').optional().isEmail().withMessage('Invalid email format'),
  body('contactInfo.socialMedia.linkedin').optional().isURL().withMessage('Invalid LinkedIn URL'),
  body('contactInfo.socialMedia.twitter').optional().isURL().withMessage('Invalid Twitter URL'),
  body('contactInfo.socialMedia.github').optional().isURL().withMessage('Invalid GitHub URL'),
  body('contactInfo.socialMedia.portfolio').optional().isURL().withMessage('Invalid portfolio URL'),
  body('academicInfo.graduationYear').optional().isInt({ min: 1950, max: new Date().getFullYear() + 10 }).withMessage('Invalid graduation year'),
  body('professionalInfo.skills').optional().isArray().withMessage('Skills must be an array'),
  body('professionalInfo.interests').optional().isArray().withMessage('Interests must be an array'),
  body('learningPreferences.availabilityHours').optional().isInt({ min: 0, max: 168 }).withMessage('Availability hours must be between 0 and 168'),
  body('privacy.dataProcessingConsent').optional().isBoolean().withMessage('Data processing consent must be boolean'),
  body('privacy.marketingConsent').optional().isBoolean().withMessage('Marketing consent must be boolean')
];

/**
 * @route   GET /api/student/dashboard
 * @desc    Get student dashboard data
 * @access  Student only
 */
router.get('/dashboard', requireStudent, getStudentDashboard);

/**
 * @route   GET /api/student/profile
 * @desc    Get student profile
 * @access  Student only
 */
router.get('/profile', requireStudent, getStudentProfile);

/**
 * @route   PUT /api/student/profile
 * @desc    Update student profile
 * @access  Student only
 */
router.put('/profile', requireStudent, profileValidation, updateStudentProfile);

/**
 * @route   POST /api/student/profile/photo
 * @desc    Upload profile photo
 * @access  Student only
 */
router.post('/profile/photo', requireStudent, upload.single('profilePhoto'), uploadProfilePhoto);

/**
 * @route   DELETE /api/student/profile/photo
 * @desc    Delete profile photo
 * @access  Student only
 */
router.delete('/profile/photo', requireStudent, deleteProfilePhoto);

/**
 * @route   GET /api/student/profile/photo-url
 * @desc    Get profile photo URL with Gravatar fallback
 * @access  Student only
 */
router.get('/profile/photo-url', requireStudent, getProfilePhotoUrl);

/**
 * @route   GET /api/student/enrollments
 * @desc    Get student enrollments with optional filtering and pagination
 * @access  Student only
 * @query   status - Filter by enrollment status (ACTIVE, COMPLETED, PAUSED, CANCELLED, EXPIRED)
 * @query   page - Page number for pagination (default: 1)
 * @query   limit - Number of items per page (default: 10)
 */
router.get('/enrollments', requireStudent, getStudentEnrollments);

/**
 * @route   GET /api/student/enrollments/:enrollmentId
 * @desc    Get specific enrollment details
 * @access  Student only
 */
router.get('/enrollments/:enrollmentId', requireStudent, getEnrollmentDetails);

/**
 * @route   PUT /api/student/enrollment/:enrollmentId/status
 * @desc    Update enrollment status
 * @access  Student only
 */
router.put('/enrollment/:enrollmentId/status', requireStudent, [
  body('status').notEmpty().isIn(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', 'EXPIRED']).withMessage('Invalid enrollment status')
], updateEnrollmentStatus);

/**
 * @route   GET /api/student/enrolled-programs
 * @desc    Get enrolled programs for profile management with detailed information
 * @access  Student only
 * @query   status - Filter by enrollment status (ACTIVE, COMPLETED, PAUSED, CANCELLED, EXPIRED)
 * @query   category - Filter by programme category
 * @query   search - Search in programme title, description, or category
 */
router.get('/enrolled-programs', requireStudent, getEnrolledPrograms);

/**
 * @route   POST /api/student/activity
 * @desc    Update learning activity and progress
 * @access  Student only
 */
router.post('/activity', requireStudent, [
  body('enrollmentId').notEmpty().withMessage('Enrollment ID is required'),
  body('moduleId').optional().isString().withMessage('Module ID must be a string'),
  body('lessonId').optional().isString().withMessage('Lesson ID must be a string'),
  body('timeSpent').optional().isNumeric().withMessage('Time spent must be a number')
], updateLearningActivity);

/**
 * @route   POST /api/student/enroll
 * @desc    Enroll in a program
 * @access  Authenticated Student
 */
router.post('/enroll', autoSyncEnrollmentStats, enrollInProgram);

/**
 * @route   POST /api/student/lesson/complete
 * @desc    Mark lesson as completed
 * @access  Authenticated Student
 */
router.post('/lesson/complete', autoSyncLessonCompletion, markLessonCompleted);

/**
 * @route   PUT /api/student/lesson/progress
 * @desc    Update lesson progress
 * @access  Authenticated Student
 */
router.put('/lesson/progress', autoSyncLessonCompletion, updateLessonProgress);

/**
 * @route   GET /api/student/analytics
 * @desc    Get student analytics and statistics
 * @access  Student only
 */
router.get('/analytics', requireStudent, getStudentAnalytics);

/**
 * @route   GET /api/student/analytics/course/:courseId
 * @desc    Get detailed analytics for a specific course
 * @access  Student only
 */
router.get('/analytics/course/:courseId', requireStudent, getCourseAnalytics);

/**
 * @route   GET /api/student/test
 * @desc    Test endpoint to verify routing is working
 * @access  Public (for testing)
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Student routes are working',
    timestamp: new Date().toISOString()
  });
});

export default router;
