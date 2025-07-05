import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  validateResetToken,
  verifyEmail,
  resendEmailVerification
} from '../controllers/authController';
import {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateResetPassword,
  validateForgotPassword,
  handleValidationErrors
} from '../middleware/validation';
import { createJWTMiddleware } from '../utils/jwt';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', ...validateRegistration, register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', ...validateLogin, login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate tokens
 * @access  Private
 */
router.post('/logout', createJWTMiddleware('access'), logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', refreshToken);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', createJWTMiddleware('access'), getCurrentUser);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', ...validateForgotPassword, forgotPassword);

/**
 * @route   GET /api/auth/reset-password
 * @desc    Validate reset password token
 * @access  Public
 */
router.get('/reset-password', validateResetToken);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', ...validateResetPassword, resetPassword);

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.get('/verify-email', verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post('/resend-verification', resendEmailVerification);

export default router;
