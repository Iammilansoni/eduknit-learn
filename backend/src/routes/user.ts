import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateEnrollmentStatus,
  getUserStats,
  changePassword
} from '../controllers/userController';
import {
  validateUserUpdate,
  validatePasswordChange
} from '../middleware/validation';
import { 
  createJWTMiddleware, 
  requireAdmin, 
  requireUserOrAdmin 
} from '../utils/jwt';

const router = express.Router();

// All routes require authentication
router.use(createJWTMiddleware('access'));

/**
 * @route   GET /api/user
 * @desc    Get all users (Admin only)
 * @access  Admin
 */
router.get('/', requireAdmin, getAllUsers);

/**
 * @route   GET /api/user/stats
 * @desc    Get user statistics (Admin only)
 * @access  Admin
 */
router.get('/stats', requireAdmin, getUserStats);

/**
 * @route   GET /api/user/:id
 * @desc    Get user by ID (Admin or own profile)
 * @access  Admin or Own Profile
 */
router.get('/:id', getUserById);

/**
 * @route   PUT /api/user/:id
 * @desc    Update user profile (Admin or own profile)
 * @access  Admin or Own Profile
 */
router.put('/:id', validateUserUpdate, updateUser);

/**
 * @route   DELETE /api/user/:id
 * @desc    Delete user (Admin only)
 * @access  Admin
 */
router.delete('/:id', requireAdmin, deleteUser);

/**
 * @route   PATCH /api/user/:id/enrollment-status
 * @desc    Update user enrollment status (Admin only)
 * @access  Admin
 */
router.patch('/:id/enrollment-status', requireAdmin, updateEnrollmentStatus);

/**
 * @route   POST /api/user/change-password
 * @desc    Change user password
 * @access  Authenticated User
 */
router.post('/change-password', validatePasswordChange, changePassword);

export default router;
