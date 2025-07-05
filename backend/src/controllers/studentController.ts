import type { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { success, notFound, error as sendError } from '../utils/response';
import logger from '../config/logger';

/**
 * Interface for authenticated requests with user data
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Get student dashboard data
 * @route   GET /api/student/dashboard
 * @desc    Get student dashboard information
 * @access  Student only
 */
export const getStudentDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Get student data
    const student = await User.findById(studentId).select('-password -refreshTokens');

    if (!student) {
      notFound(res, 'Student not found');
      return;
    }

    // Verify the user is actually a student
    if (student.role !== 'student') {
      res.status(403).json({
        success: false,
        message: 'Access denied: Only students can access this dashboard'
      });
      return;
    }

    // TODO: Add more student-specific data like courses, assignments, grades, etc.
    const dashboardData = {
      student: {
        id: student.id,
        username: student.username,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        role: student.role,
        enrollmentStatus: student.enrollmentStatus,
        enrollmentDate: student.enrollmentDate,
        isEmailVerified: student.isEmailVerified,
        lastLoginAt: student.lastLoginAt
      },
      // Placeholder for student-specific dashboard data
      stats: {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        averageGrade: 0
      },
      recentActivity: [],
      upcomingDeadlines: [],
      notifications: []
    };

    logger.info(`Student dashboard accessed by: ${student.email}`);

    success(res, dashboardData, 'Student dashboard data retrieved successfully');

  } catch (error) {
    logger.error('Student dashboard error:', error);
    sendError(res, 'Failed to load student dashboard', 500);
  }
};

/**
 * Get student profile
 * @route   GET /api/student/profile
 * @desc    Get student profile information
 * @access  Student only
 */
export const getStudentProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const student = await User.findById(studentId).select('-password -refreshTokens');

    if (!student) {
      notFound(res, 'Student not found');
      return;
    }

    if (student.role !== 'student') {
      res.status(403).json({
        success: false,
        message: 'Access denied: Only students can access this profile'
      });
      return;
    }

    success(res, student, 'Student profile retrieved successfully');

  } catch (error) {
    logger.error('Student profile error:', error);
    sendError(res, 'Failed to load student profile', 500);
  }
};

/**
 * Update student profile
 * @route   PUT /api/student/profile
 * @desc    Update student profile information
 * @access  Student only
 */
export const updateStudentProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { firstName, lastName, phoneNumber, address, dateOfBirth } = req.body;

    if (!studentId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const student = await User.findById(studentId);

    if (!student) {
      notFound(res, 'Student not found');
      return;
    }

    if (student.role !== 'student') {
      res.status(403).json({
        success: false,
        message: 'Access denied: Only students can update this profile'
      });
      return;
    }

    // Update allowed fields
    if (firstName) student.firstName = firstName;
    if (lastName) student.lastName = lastName;
    if (phoneNumber) student.phoneNumber = phoneNumber;
    if (address) student.address = address;
    if (dateOfBirth) student.dateOfBirth = new Date(dateOfBirth);

    await student.save();

    // Return updated student data without sensitive information
    const updatedStudent = await User.findById(studentId).select('-password -refreshTokens');

    logger.info(`Student profile updated: ${student.email}`);

    success(res, updatedStudent, 'Student profile updated successfully');

  } catch (error) {
    logger.error('Student profile update error:', error);
    sendError(res, 'Failed to update student profile', 500);
  }
};
