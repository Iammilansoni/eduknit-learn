import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  setTokensInCookies,
  clearTokensFromCookies,
  AuthenticatedRequest
} from '../utils/jwt';
import { 
  success, 
  created, 
  authenticationError, 
  conflict, 
  validationError 
} from '../utils/response';
import { 
  AuthenticationError, 
  ConflictError, 
  ValidationError 
} from '../utils/errors';
import emailService from '../services/emailService';
import logger from '../config/logger';

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, firstName, lastName, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      const message = existingUser.email === email ? 'Email already registered' : 'Username already taken';
      conflict(res, message);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12'));
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // DEBUG: Log token details
    logger.info(`Generated verification token for ${email}:`);
    logger.info(`  Token length: ${emailVerificationToken.length}`);
    logger.info(`  Token value: ${emailVerificationToken}`);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      emailVerificationToken,
      emailVerificationExpires,
      enrollmentStatus: 'inactive' // Set to inactive until email is verified
    });

    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
    
    // DEBUG: Log verification URL details
    logger.info(`Constructed verification URL for ${email}:`);
    logger.info(`  URL length: ${verificationUrl.length}`);
    logger.info(`  URL: ${verificationUrl}`);
    logger.info(`  Token in URL length: ${emailVerificationToken.length}`);
    
    await emailService.sendEmailVerification(email, emailVerificationToken, verificationUrl);
    // Do not generate tokens until email verification is complete

    logger.info(`New user registered: ${user.email}`);

    created(res, {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    }, 'User registered successfully. Please check your email for verification.');

  } catch (error) {
    logger.error('Registration error:', error);
    throw error; // Let the global error handler deal with it
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      authenticationError(res, 'Invalid credentials');
      return;
    }

    // Check if account is locked
    if (user.isLocked()) {
      authenticationError(res, 'Account is temporarily locked due to too many failed login attempts. Please try again later.');
      return;
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      authenticationError(res, 'Please verify your email before logging in. Check your email for the verification link.');
      return;
    }

    // Check if user is active
    if (user.enrollmentStatus !== 'active') {
      authenticationError(res, 'Account is not active. Please contact support.');
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      authenticationError(res, 'Invalid credentials');
      return;
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Add refresh token to user's refresh tokens array
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Set tokens in cookies
    setTokensInCookies(res, accessToken, refreshToken);

    logger.info(`User logged in: ${user.email}`);

    success(res, {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      enrollmentStatus: user.enrollmentStatus
    }, 'Login successful');

  } catch (error) {
    logger.error('Login error:', error);
    throw error; // Let the global error handler deal with it
  }
};

// Logout user
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const user = (req as any).user;
    
    if (refreshToken && user) {
      // Remove refresh token from user's refresh tokens array
      await User.findByIdAndUpdate(user.id, {
        $pull: { refreshTokens: refreshToken }
      });
    }

    // Clear cookies
    clearTokensFromCookies(res);

    logger.info(`User logged out: ${user?.id}`);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// Refresh access token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
      return;
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    // Check if refresh token exists in user's refresh tokens array
    const user = await User.findById(payload.user.id);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
      return;
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Update user's refresh tokens array
    user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    // Set new tokens in cookies
    setTokensInCookies(res, newAccessToken, newRefreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userDoc = await User.findById(user?.id).select('-password -refreshTokens');
    
    if (!userDoc) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    success(res, {
      id: userDoc.id,
      username: userDoc.username,
      email: userDoc.email,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      role: userDoc.role,
      isEmailVerified: userDoc.isEmailVerified,
      enrollmentStatus: userDoc.enrollmentStatus
    }, 'User retrieved successfully');
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      success(res, null, 'If an account with that email exists, a password reset link has been sent.');
      return;
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailSent = await emailService.sendPasswordResetEmail(email, resetToken, resetUrl);

    if (!emailSent) {
      logger.error(`Failed to send password reset email to: ${email}`);
      // Still return success to not reveal if email exists
      success(res, null, 'If an account with that email exists, a password reset link has been sent.');
      return;
    }

    logger.info(`Password reset email sent to: ${email}`);

    success(res, null, 'If an account with that email exists, a password reset link has been sent.');

  } catch (error) {
    logger.error('Forgot password error:', error);
    throw error; // Let the global error handler deal with it
  }
};

// Validate reset token
export const validateResetToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
      return;
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
      return;
    }

    // Token is valid
    res.json({
      success: true,
      message: 'Reset token is valid',
      email: user.email // Optionally return email to pre-fill forms
    });
  } catch (error) {
    logger.error('Validate reset token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12'));
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info(`Password reset successful for: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Verify email with token
// Resend email verification
export const resendEmailVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      success(res, null, 'If an account with that email exists and is not verified, a verification email has been sent.');
      return;
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
      return;
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
    await emailService.sendEmailVerification(email, emailVerificationToken, verificationUrl);

    logger.info(`Verification email resent to: ${email}`);

    success(res, null, 'If an account with that email exists and is not verified, a verification email has been sent.');

  } catch (error) {
    logger.error('Resend verification email error:', error);
    throw error; // Let the global error handler deal with it
  }
};

// Verify email with token
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    logger.info(`Email verification attempt with token: ${token}`);

    if (!token || typeof token !== 'string') {
      logger.warn('Email verification failed: No token provided');
      res.status(400).json({
        success: false,
        message: 'Verification token is required',
        shouldRedirect: false
      });
      return;
    }

    // Find user with matching verification token that hasn't expired (fresh verification)
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    // If user found with valid token - perform fresh verification
    if (user) {
      logger.info(`Fresh email verification for user: ${user.email}`);
      
      // Update user as verified but don't mark message as seen yet
      user.isEmailVerified = true;
      user.enrollmentStatus = 'active';
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      user.verificationMessageSeen = false; // User hasn't seen the success message yet
      await user.save();

      logger.info(`Email verified successfully for: ${user.email}`);

      // Return success message - no auto redirect
      res.json({
        success: true,
        message: 'Email verified successfully. You can now log in to your account.',
        shouldRedirect: false,
        showActions: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          enrollmentStatus: user.enrollmentStatus,
          isEmailVerified: user.isEmailVerified
        }
      });
      return;
    }

    // Check for already verified user who hasn't seen the message yet
    const verifiedUserNotSeen = await User.findOne({
      isEmailVerified: true,
      verificationMessageSeen: false
    });

    if (verifiedUserNotSeen) {
      logger.info(`Showing verification success message for already verified user: ${verifiedUserNotSeen.email}`);
      
      // Mark that the user has now seen the verification message
      verifiedUserNotSeen.verificationMessageSeen = true;
      await verifiedUserNotSeen.save();
      
      // Return success message - no auto redirect
      res.json({
        success: true,
        message: 'Email verified successfully. You can now log in to your account.',
        shouldRedirect: false,
        showActions: true,
        user: {
          id: verifiedUserNotSeen.id,
          email: verifiedUserNotSeen.email,
          username: verifiedUserNotSeen.username,
          firstName: verifiedUserNotSeen.firstName,
          lastName: verifiedUserNotSeen.lastName,
          role: verifiedUserNotSeen.role,
          enrollmentStatus: verifiedUserNotSeen.enrollmentStatus,
          isEmailVerified: verifiedUserNotSeen.isEmailVerified
        }
      });
      return;
    }

    // Check if user has already seen the verification message
    const userWhoSawMessage = await User.findOne({
      isEmailVerified: true,
      verificationMessageSeen: true
    });

    if (userWhoSawMessage) {
      // User already verified and has seen the message - show different message
      res.status(200).json({
        success: true,
        message: 'Your email has already been verified. Please proceed to login.',
        code: 'ALREADY_VERIFIED_AND_SEEN',
        shouldRedirect: false,
        showActions: true,
        canResend: false
      });
      return;
    }

    // No user found - check for expired or invalid tokens
    logger.warn(`Email verification failed: No user found with token ${token}`);
    
    // Check if token exists but is expired
    const expiredUser = await User.findOne({ emailVerificationToken: token });
    if (expiredUser) {
      logger.warn(`Token found but expired for user: ${expiredUser.email}`);
      res.status(400).json({
        success: false,
        message: 'Verification link has expired (15 minutes). Please request a new verification email.',
        code: 'EXPIRED_TOKEN',
        shouldRedirect: false,
        canResend: true
      });
    } else {
      // Token doesn't exist - either already used or invalid
      logger.warn('Token not found in database');
      
      res.status(400).json({
        success: false,
        message: 'This verification link is invalid or has already been used. If you have already verified your email, you can proceed to login.',
        code: 'INVALID_OR_USED_TOKEN',
        shouldRedirect: false,
        canResend: false
      });
    }
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification',
      shouldRedirect: false
    });
  }
};
