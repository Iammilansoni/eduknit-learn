import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { AuthenticatedRequest } from '../utils/jwt';
import logger from '../config/logger';

// Get all users (Admin only)
export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const status = req.query.status as string;

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (status) filter.enrollmentStatus = status;

    const users = await User.find(filter)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user by ID (Admin or own profile)
export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    // Users can only access their own profile unless they're admin
    if (requestingUser?.role !== 'admin' && requestingUser?.id !== id) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    const user = await User.findById(id)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      user
    });
    return;
  } catch (error) {
    logger.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user profile
export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;
    const updateData = req.body;

    // Users can only update their own profile unless they're admin
    if (requestingUser?.role !== 'admin' && requestingUser?.id !== id) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.role; // Only admins should be able to change roles
    delete updateData.email; // Email changes should go through a separate process
    delete updateData.refreshTokens;
    delete updateData.emailVerificationToken;
    delete updateData.passwordResetToken;

    // If not admin, prevent updating certain fields
    if (requestingUser?.role !== 'admin') {
      delete updateData.enrollmentStatus;
      delete updateData.isEmailVerified;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens -emailVerificationToken -passwordResetToken');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    logger.info(`User updated: ${user.email} by ${requestingUser?.id}`);

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
    return;
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Prevent admin from deleting themselves
    if (req.user?.id === id) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
      return;
    }

    await User.findByIdAndDelete(id);

    logger.info(`User deleted: ${user.email} by ${req.user?.id}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    return;
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Change user enrollment status (Admin only)
export const updateEnrollmentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { enrollmentStatus } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(enrollmentStatus)) {
      res.status(400).json({
        success: false,
        message: 'Invalid enrollment status'
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { enrollmentStatus },
      { new: true }
    ).select('-password -refreshTokens -emailVerificationToken -passwordResetToken');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    logger.info(`User enrollment status updated: ${user.email} to ${enrollmentStatus} by ${req.user?.id}`);

    res.json({
      success: true,
      message: 'Enrollment status updated successfully',
      user
    });
    return;
  } catch (error) {
    logger.error('Update enrollment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user statistics (Admin only)
export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ enrollmentStatus: 'active' });
    const inactiveUsers = await User.countDocuments({ enrollmentStatus: 'inactive' });
    const suspendedUsers = await User.countDocuments({ enrollmentStatus: 'suspended' });
    
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    res.json({
      success: true,
      stats: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        suspended: suspendedUsers,
        byRole: usersByRole,
        recentRegistrations
      }
    });
    return;
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Change password
export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12'));
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    return;
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new user (Admin only)
export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, email, password, role, firstName, lastName, enrollmentStatus } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
      return;
    }

    // Create new user
    const user = new User({
      username,
      email,
      password, // This will be hashed by the pre-save middleware
      role: role || 'student',
      firstName,
      lastName,
      enrollmentStatus: enrollmentStatus || 'active',
      isEmailVerified: true, // Admin created users are auto-verified
      verificationMessageSeen: true
    });

    await user.save();

    logger.info(`User created: ${user.email} by admin ${req.user?.id}`);

    // Return user without sensitive data
    const userResponse = await User.findById(user._id)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    });
    return;
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};