import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { AuthenticatedRequest } from '../utils/jwt';
import logger from '../config/logger';
import Enrollment from '../models/Enrollment';
import { Types } from 'mongoose';

// Get user's enrolled courses
export const getUserCourses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get all enrollments for the user
    const enrollments = await Enrollment.find({ studentId: userId })
      .populate('programmeId', 'title description category totalLessons estimatedDuration level price currency imageUrl')
      .sort({ enrollmentDate: -1 })
      .lean();

    // Transform the data for the response
    const courses = enrollments.map(enrollment => ({
      enrollmentId: enrollment._id,
      courseId: (enrollment.programmeId as any)._id,
      title: (enrollment.programmeId as any).title,
      description: (enrollment.programmeId as any).description,
      category: (enrollment.programmeId as any).category,
      level: (enrollment.programmeId as any).level,
      totalLessons: (enrollment.programmeId as any).totalLessons,
      estimatedDuration: (enrollment.programmeId as any).estimatedDuration,
      price: (enrollment.programmeId as any).price,
      currency: (enrollment.programmeId as any).currency,
      imageUrl: (enrollment.programmeId as any).imageUrl,
      enrollmentDate: enrollment.enrollmentDate,
      status: enrollment.status,
      progress: {
        totalProgress: enrollment.progress.totalProgress,
        completedLessons: enrollment.progress.completedLessons.length,
        timeSpent: enrollment.progress.timeSpent,
        lastActivityDate: enrollment.progress.lastActivityDate
      },
      completionDate: enrollment.completionDate,
      certificateIssued: enrollment.certificateIssued
    }));

    res.json({
      success: true,
      data: {
        userId,
        totalCourses: courses.length,
        courses
      }
    });
  } catch (error) {
    logger.error('Get user courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user courses'
    });
  }
};

// Get user's learning statistics and history
export const getUserLearningStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Import required models
    const LessonCompletion = require('../models/LessonCompletion').default;
    const QuizResult = require('../models/QuizResult').default;

    // Get comprehensive learning data using aggregation pipelines
    const [
      enrollmentStats,
      lessonStats,
      quizStats,
      timeStats,
      recentActivity,
      categoryPerformance,
      weeklyProgress
    ] = await Promise.all([
      // Enrollment statistics
      Enrollment.aggregate([
        { $match: { studentId: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalEnrollments: { $sum: 1 },
            activeEnrollments: {
              $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] }
            },
            completedEnrollments: {
              $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
            },
            totalTimeSpent: { $sum: '$progress.timeSpent' },
            averageProgress: { $avg: '$progress.totalProgress' }
          }
        }
      ]),

      // Lesson completion statistics
      LessonCompletion.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalLessonsCompleted: { $sum: 1 },
            totalTimeSpent: { $sum: '$timeSpent' },
            averageTimePerLesson: { $avg: '$timeSpent' }
          }
        }
      ]),

      // Quiz performance statistics
      QuizResult.aggregate([
        { $match: { studentId: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalQuizzesTaken: { $sum: 1 },
            averageScore: { $avg: '$percentage' },
            highestScore: { $max: '$percentage' },
            passedQuizzes: {
              $sum: { $cond: ['$isPassed', 1, 0] }
            },
            totalTimeSpent: { $sum: '$timeSpent' }
          }
        }
      ]),

      // Time-based statistics (last 30 days)
      Enrollment.aggregate([
        { 
          $match: { 
            studentId: new Types.ObjectId(userId),
            'progress.lastActivityDate': { 
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
            }
          } 
        },
        {
          $group: {
            _id: null,
            recentTimeSpent: { $sum: '$progress.timeSpent' }
          }
        }
      ]),

      // Recent activity (last 7 days)
      LessonCompletion.aggregate([
        { 
          $match: { 
            userId: new Types.ObjectId(userId),
            completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          } 
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
            },
            lessonsCompleted: { $sum: 1 },
            timeSpent: { $sum: '$timeSpent' }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 7 }
      ]),

      // Performance by category
      Enrollment.aggregate([
        { $match: { studentId: new Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'programmes',
            localField: 'programmeId',
            foreignField: '_id',
            as: 'programme'
          }
        },
        { $unwind: '$programme' },
        {
          $group: {
            _id: '$programme.category',
            averageProgress: { $avg: '$progress.totalProgress' },
            totalCourses: { $sum: 1 },
            totalTimeSpent: { $sum: '$progress.timeSpent' }
          }
        }
      ]),

      // Weekly progress trend (last 8 weeks)
      LessonCompletion.aggregate([
        { 
          $match: { 
            userId: new Types.ObjectId(userId),
            completedAt: { $gte: new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000) }
          } 
        },
        {
          $group: {
            _id: {
              $week: '$completedAt'
            },
            lessonsCompleted: { $sum: 1 },
            timeSpent: { $sum: '$timeSpent' }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 8 }
      ])
    ]);

    // Calculate additional metrics
    const enrollmentData = enrollmentStats[0] || {
      totalEnrollments: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      totalTimeSpent: 0,
      averageProgress: 0
    };

    const lessonData = lessonStats[0] || {
      totalLessonsCompleted: 0,
      totalTimeSpent: 0,
      averageTimePerLesson: 0
    };

    const quizData = quizStats[0] || {
      totalQuizzesTaken: 0,
      averageScore: 0,
      highestScore: 0,
      passedQuizzes: 0,
      totalTimeSpent: 0
    };

    const timeData = timeStats[0] || { recentTimeSpent: 0 };

    // Calculate success rate
    const quizSuccessRate = quizData.totalQuizzesTaken > 0 
      ? (quizData.passedQuizzes / quizData.totalQuizzesTaken) * 100 
      : 0;

    // Calculate study streak (consecutive days with activity)
    const studyStreak = await calculateStudyStreak(userId);

    res.json({
      success: true,
      data: {
        userId,
        overview: {
          totalEnrollments: enrollmentData.totalEnrollments,
          activeEnrollments: enrollmentData.activeEnrollments,
          completedEnrollments: enrollmentData.completedEnrollments,
          overallProgress: Math.round(enrollmentData.averageProgress * 100) / 100,
          totalLessonsCompleted: lessonData.totalLessonsCompleted,
          totalTimeSpent: enrollmentData.totalTimeSpent, // in minutes
          studyStreak
        },
        performance: {
          totalQuizzesTaken: quizData.totalQuizzesTaken,
          averageQuizScore: Math.round(quizData.averageScore * 100) / 100,
          highestQuizScore: Math.round(quizData.highestScore * 100) / 100,
          quizSuccessRate: Math.round(quizSuccessRate * 100) / 100,
          averageTimePerLesson: Math.round(lessonData.averageTimePerLesson * 100) / 100
        },
        recentActivity: {
          last7Days: recentActivity,
          last30DaysTimeSpent: timeData.recentTimeSpent
        },
        categoryPerformance,
        weeklyProgress: weeklyProgress.reverse(), // Show oldest to newest
        timeBreakdown: {
          totalStudyTime: enrollmentData.totalTimeSpent,
          recentStudyTime: timeData.recentTimeSpent,
          averageDailyStudyTime: timeData.recentTimeSpent / 30 // last 30 days
        }
      }
    });
  } catch (error) {
    logger.error('Get user learning stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve learning statistics'
    });
  }
};

// Helper function to calculate study streak
async function calculateStudyStreak(userId: string): Promise<number> {
  try {
    const LessonCompletion = require('../models/LessonCompletion').default;
    
    // Get all lesson completions for the user
    const completions = await LessonCompletion.find({ userId })
      .select('completedAt')
      .sort({ completedAt: -1 })
      .lean();

    if (completions.length === 0) return 0;

    // Group by date
    const activityByDate = new Set();
    completions.forEach((completion: any) => {
      const date = new Date(completion.completedAt).toDateString();
      activityByDate.add(date);
    });

    // Calculate consecutive days
    const dates = Array.from(activityByDate).sort().reverse() as string[];
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    for (let i = 0; i < dates.length; i++) {
      const currentDate = new Date(dates[i] as string);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (currentDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    logger.error('Error calculating study streak:', error);
    return 0;
  }
}

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