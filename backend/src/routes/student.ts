import express from 'express';
import {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile
} from '../controllers/studentController';
import { 
  createJWTMiddleware, 
  authorizeRoles 
} from '../utils/jwt';

const router = express.Router();

// All routes require authentication
router.use(createJWTMiddleware('access'));

// All routes require student role
const requireStudent = authorizeRoles('student');

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
router.put('/profile', requireStudent, updateStudentProfile);

export default router;
