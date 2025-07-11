import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import crypto from 'crypto';
import User from '../models/User';
import StudentProfile from '../models/StudentProfile';
import Enrollment from '../models/Enrollment';
import Programme from '../models/Programme';
import { 
  success, 
  created,
  notFound, 
  serverError,
  validationError,
  conflict,
  forbidden 
} from '../utils/response';
import { AuthenticatedRequest } from '../utils/jwt';
import logger from '../config/logger';
import AnalyticsService from '../services/analyticsService';
import LessonCompletion from '../models/LessonCompletion';

// Generate initials-based avatar URL
const generateInitialsAvatar = (firstName?: string, lastName?: string, username?: string, email?: string): string => {
  let initials = '';
  
  if (firstName && lastName) {
    initials = (firstName[0] + lastName[0]).toUpperCase();
  } else if (firstName) {
    initials = firstName[0].toUpperCase();
  } else if (username) {
    initials = username[0].toUpperCase();
  } else if (email) {
    initials = email[0].toUpperCase();
  } else {
    initials = 'U';
  }
  
  // Use a color based on the initials for consistency
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  const colorIndex = initials.charCodeAt(0) % colors.length;
  const backgroundColor = colors[colorIndex];
  
  // Generate a data URL for the avatar
  const canvas = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="${backgroundColor}"/>
    <text x="100" y="115" font-family="Arial" font-size="80" font-weight="bold" fill="white" text-anchor="middle">${initials}</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`;
};

// Get profile photo with priority: Custom > Initials (removed Gravatar)
const getProfilePhotoWithFallback = (user: any, profile?: any): { url: string; source: 'custom' | 'initials' } => {
  // 1. Custom uploaded photo (highest priority)
  if (profile?.profilePhoto?.url) {
    return { url: profile.profilePhoto.url, source: 'custom' };
  }
  
  // 2. Initials avatar (fallback)
  return { 
    url: generateInitialsAvatar(user.firstName, user.lastName, user.username, user.email), 
    source: 'initials' 
  };
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'profiles');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    // Use a generic filename since req.user is not available in multer callback
    cb(null, `profile-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

/**
 * Get student dashboard data with comprehensive analytics
 */
export const getStudentDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      validationError(res, 'Student ID is required');
      return;
    }

    // Get student basic info
    const student = await User.findById(studentId).select('-password -refreshTokens');
    
    if (!student) {
      notFound(res, 'Student not found');
      return;
    }

    // Get student profile
    const profile = await StudentProfile.findOne({ userId: studentId });

    // Get comprehensive dashboard overview using analytics service
    const dashboardOverview = await AnalyticsService.getDashboardOverview(studentId);

    // Get active enrollments for detailed view
    const activeEnrollments = await Enrollment.find({ 
      studentId, 
      status: 'ACTIVE' 
    })
      .populate('programmeId', 'title description duration level category modules totalModules imageUrl')
      .sort({ enrollmentDate: -1 })
      .limit(6) as any[];

    // Get recent activity from lesson completions
    const recentCompletions = await LessonCompletion.find({ userId: studentId })
      .populate('lessonId', 'title')
      .sort({ completedAt: -1 })
      .limit(10)
      .lean();

    const recentActivity = recentCompletions.map((completion: any) => ({
      id: completion._id,
      type: 'lesson_completion',
      title: `Completed ${(completion.lessonId as any)?.title || 'Lesson'}`,
      description: `Earned 10 points`, // Fixed value since points is not in the schema
      date: completion.completedAt,
      progress: 100,
      courseTitle: 'Course', // Would need to populate full hierarchy
      status: 'completed'
    }));

    // Mock upcoming deadlines (would be calculated from course modules/assignments)
    const upcomingDeadlines = activeEnrollments
      .filter(e => e.programmeId)
      .map(enrollment => ({
        id: enrollment._id,
        title: `Assignment due for ${enrollment.programmeId.title}`,
        dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within 7 days
        courseTitle: enrollment.programmeId.title,
        priority: Math.random() > 0.5 ? 'high' : 'medium',
        status: 'pending'
      }))
      .slice(0, 5); // Limit to 5 upcoming deadlines

    const dashboardData = {
      student: {
        ...student.toJSON(),
        profile: profile || null
      },
      stats: {
        totalCourses: dashboardOverview.enrolledCourses.total,
        completedCourses: dashboardOverview.enrolledCourses.completed,
        inProgressCourses: dashboardOverview.enrolledCourses.active,
        pausedCourses: dashboardOverview.enrolledCourses.paused,
        averageProgress: dashboardOverview.overallProgress,
        totalTimeSpent: dashboardOverview.totalTimeSpent,
        certificatesEarned: dashboardOverview.certificatesEarned,
        learningStreak: dashboardOverview.learningStreak,
        longestStreak: dashboardOverview.longestStreak,
        totalPoints: dashboardOverview.totalPoints,
        level: dashboardOverview.level
      },
      activeLearningPaths: dashboardOverview.activeLearningPaths,
      activeEnrollments: activeEnrollments.slice(0, 6), // Limit to 6 for dashboard
      recentActivity,
      upcomingDeadlines,
      notifications: [] // TODO: Implement notification system
    };

    success(res, dashboardData, 'Dashboard data retrieved successfully');

  } catch (error) {
    logger.error('Get student dashboard error:', error);
    serverError(res, 'Failed to retrieve dashboard data');
  }
};

/**
 * Get student profile
 */
export const getStudentProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      validationError(res, 'Student ID is required');
      return;
    }

    // Get user data
    const student = await User.findById(studentId).select('-password -refreshTokens');
    
    if (!student) {
      notFound(res, 'Student not found');
      return;
    }

    // Get extended profile data
    let profile = await StudentProfile.findOne({ userId: studentId });
    
    // Create profile if it doesn't exist
    if (!profile) {
      profile = new StudentProfile({
        userId: studentId,
        statistics: {
          joinDate: student.createdAt
        }
      });
      await profile.save();
    }

    // Update profile completeness
    profile.updateProfileCompleteness();
    await profile.save();

    // Get enrolled programs data
    const enrollments = await Enrollment.find({ userId: studentId })
      .populate('programmeId', 'title description duration level category modules')
      .sort({ enrollmentDate: -1 }) as any[];

    // Format enrolled programs for profile
    const enrolledPrograms = enrollments.map(enrollment => ({
      id: enrollment._id,
      programme: enrollment.programmeId,
      status: enrollment.status,
      enrollmentDate: enrollment.enrollmentDate,
      progress: {
        totalProgress: enrollment.progress?.totalProgress || 0,
        completedModules: enrollment.progress?.completedModules?.length || 0,
        totalModules: enrollment.programmeId?.totalModules || 0,
        timeSpent: enrollment.progress?.timeSpent || 0,
        lastActivityDate: enrollment.progress?.lastActivityDate
      }
    }));

    // Get profile photo with proper fallback hierarchy
    const photoInfo = getProfilePhotoWithFallback(student, profile);

    const profileData = {
      user: student,
      profile: {
        ...profile.toJSON(),
        profilePhoto: {
          ...profile.profilePhoto,
          url: photoInfo.url,
          source: photoInfo.source,
          isCustom: photoInfo.source === 'custom',
          isInitials: photoInfo.source === 'initials'
        }
      },
      enrolledPrograms,
      completeness: profile.statistics.profileCompleteness
    };

    success(res, profileData, 'Student profile retrieved successfully');

  } catch (error) {
    logger.error('Get student profile error:', error);
    serverError(res, 'Failed to retrieve student profile');
  }
};

/**
 * Update student profile
 */
export const updateStudentProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      validationError(res, 'Validation failed', errors.array());
      return;
    }

    const studentId = req.user?.id;
    const updateData = req.body;
    
    if (!studentId) {
      validationError(res, 'Student ID is required');
      return;
    }

    // Get or create student profile
    let profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) {
      profile = new StudentProfile({
        userId: studentId,
        statistics: {
          joinDate: new Date()
        }
      });
    }

    // Update profile fields
    const allowedSections = [
      'contactInfo', 
      'address',
      'academicInfo',
      'professionalInfo',
      'learningPreferences',
      'privacy'
    ];

    allowedSections.forEach(section => {
      if (updateData[section]) {
        if (section === 'privacy') {
          // Handle privacy consent dates
          const privacyData = updateData[section];
          if (privacyData.dataProcessingConsent && !profile.privacy.dataProcessingConsentDate) {
            privacyData.dataProcessingConsentDate = new Date();
          }
          if (privacyData.marketingConsent && !profile.privacy.marketingConsentDate) {
            privacyData.marketingConsentDate = new Date();
          }
        }
        
        // Merge objects for nested fields - using type assertion for dynamic access
        const profileSection = (profile as any)[section];
        if (typeof profileSection === 'object' && !Array.isArray(profileSection)) {
          (profile as any)[section] = { ...profileSection, ...updateData[section] };
        } else {
          (profile as any)[section] = updateData[section];
        }
      }
    });

    // Update basic user fields if provided
    if (updateData.firstName || updateData.lastName || updateData.phoneNumber) {
      const userUpdateData: any = {};
      if (updateData.firstName) userUpdateData.firstName = updateData.firstName;
      if (updateData.lastName) userUpdateData.lastName = updateData.lastName;
      if (updateData.phoneNumber) userUpdateData.phoneNumber = updateData.phoneNumber;

      await User.findByIdAndUpdate(studentId, userUpdateData, { runValidators: true });
    }

    // Update profile completeness and metadata
    profile.updateProfileCompleteness();
    profile.metadata.lastProfileUpdate = new Date();

    await profile.save();

    // Get updated user data
    const updatedUser = await User.findById(studentId).select('-password -refreshTokens');

    const responseData = {
      user: updatedUser,
      profile: profile,
      completeness: profile.statistics.profileCompleteness
    };

    success(res, responseData, 'Student profile updated successfully');

  } catch (error) {
    logger.error('Update student profile error:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      validationError(res, error.message);
    } else {
      serverError(res, 'Failed to update student profile');
    }
  }
};

/**
 * Upload profile photo
 */
export const uploadProfilePhoto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      validationError(res, 'Student ID is required');
      return;
    }

    if (!req.file) {
      validationError(res, 'No file uploaded');
      return;
    }

    logger.info('Profile photo upload request:', {
      studentId,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Get or create student profile
    let profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) {
      profile = new StudentProfile({
        userId: studentId,
        statistics: {
          joinDate: new Date()
        }
      });
    }

    // Delete old profile photo if exists
    if (profile.profilePhoto.filename) {
      try {
        const oldPhotoPath = path.join(process.cwd(), 'uploads', 'profiles', profile.profilePhoto.filename);
        await fs.unlink(oldPhotoPath);
        logger.info('Deleted old profile photo:', oldPhotoPath);
      } catch (error) {
        logger.warn('Could not delete old profile photo:', error);
      }
    }

    // Update profile photo information
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.BACKEND_URL || 'https://api.eduknit.com'
      : `http://localhost:${process.env.PORT || 5000}`;
    
    const newPhotoUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;
    
    profile.profilePhoto = {
      url: newPhotoUrl,
      filename: req.file.filename,
      uploadDate: new Date(),
      size: req.file.size,
      mimeType: req.file.mimetype
    };

    // Update profile completeness
    profile.updateProfileCompleteness();
    profile.metadata.lastProfileUpdate = new Date();

    await profile.save();

    // Also update user's profilePicture field for consistency
    await User.findByIdAndUpdate(studentId, { 
      profilePicture: newPhotoUrl 
    });

    logger.info('Profile photo uploaded successfully:', {
      studentId,
      newPhotoUrl,
      completeness: profile.statistics.profileCompleteness
    });

    success(res, {
      profilePhoto: {
        ...profile.profilePhoto,
        isCustom: true,
        isInitials: false
      },
      completeness: profile.statistics.profileCompleteness
    }, 'Profile photo uploaded successfully');

  } catch (error) {
    logger.error('Upload profile photo error:', error);
    serverError(res, 'Failed to upload profile photo');
  }
};

/**
 * Delete profile photo
 */
export const deleteProfilePhoto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      validationError(res, 'Student ID is required');
      return;
    }

    const profile = await StudentProfile.findOne({ userId: studentId });
    
    if (!profile || !profile.profilePhoto.filename) {
      notFound(res, 'Profile photo not found');
      return;
    }

    // Delete photo file
    try {
      const photoPath = path.join(process.cwd(), 'uploads', 'profiles', profile.profilePhoto.filename);
      await fs.unlink(photoPath);
    } catch (error) {
      logger.warn('Could not delete profile photo file:', error);
    }

    // Clear profile photo data
    profile.profilePhoto = {
      url: undefined,
      filename: undefined,
      uploadDate: undefined,
      size: undefined,
      mimeType: undefined
    };

    // Update profile completeness
    profile.updateProfileCompleteness();
    profile.metadata.lastProfileUpdate = new Date();

    await profile.save();

    // Update user's profilePicture to null and get next fallback
    const user = await User.findById(studentId);
    const fallbackPhotoInfo = getProfilePhotoWithFallback(user, profile);
    
    await User.findByIdAndUpdate(studentId, { 
      profilePicture: null 
    });

    success(res, {
      completeness: profile.statistics.profileCompleteness,
      fallbackPhotoUrl: fallbackPhotoInfo.url,
      fallbackSource: fallbackPhotoInfo.source
    }, 'Profile photo deleted successfully');

  } catch (error) {
    logger.error('Delete profile photo error:', error);
    serverError(res, 'Failed to delete profile photo');
  }
};

/**
 * Get student enrollments
 */
export const getStudentEnrollments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      return forbidden(res, 'Student ID is required');
    }

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build query
    const query: any = { studentId };
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get enrollments with pagination and populate programme data
    const [enrollments, total] = await Promise.all([
      Enrollment.find(query)
        .populate('programmeId', 'title description duration level category totalModules totalLessons estimatedDuration imageUrl instructor')
        .sort({ enrollmentDate: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Enrollment.countDocuments(query)
    ]);

    // Transform the data to match frontend expectations
    const transformedEnrollments = enrollments.map(enrollment => {
      const programme = enrollment.programmeId as any;
      
      // Handle null/undefined programme
      if (!programme) {
        console.warn(`Programme not found for enrollment ${enrollment._id}`);
        return {
          id: enrollment._id.toString(),
          programmeId: '',
          status: enrollment.status,
          enrollmentDate: enrollment.enrollmentDate,
          progress: {
            totalProgress: enrollment.progress?.totalProgress || 0,
            completedLessons: enrollment.progress?.completedLessons || [],
            timeSpent: enrollment.progress?.timeSpent || 0,
            lastActivityDate: enrollment.progress?.lastActivityDate
          },
          programme: {
            title: 'Unknown Programme',
            description: 'Programme not found',
            level: 'BEGINNER',
            duration: 0,
            category: 'Unknown'
          }
        };
      }
      
      return {
        id: enrollment._id.toString(),
        programmeId: programme._id?.toString() || '',
        status: enrollment.status,
        enrollmentDate: enrollment.enrollmentDate,
        progress: {
          totalProgress: enrollment.progress?.totalProgress || 0,
          completedLessons: enrollment.progress?.completedLessons || [],
          timeSpent: enrollment.progress?.timeSpent || 0,
          lastActivityDate: enrollment.progress?.lastActivityDate
        },
        programme: {
          id: programme._id?.toString() || '',
          title: programme.title || '',
          description: programme.description || '',
          category: programme.category || '',
          level: programme.level || '',
          totalModules: programme.totalModules || 0,
          totalLessons: programme.totalLessons || 0,
          estimatedDuration: programme.estimatedDuration || 0,
          thumbnail: programme.imageUrl || '',
          instructor: programme.instructor || ''
        }
      };
    });

    const pagination = {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    };

    success(res, { enrollments: transformedEnrollments, pagination }, 'Student enrollments retrieved successfully');

  } catch (error) {
    logger.error('Get student enrollments error:', error);
    serverError(res, 'Failed to retrieve student enrollments');
  }
};

/**
 * Get enrollment details
 */
export const getEnrollmentDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { enrollmentId } = req.params;

    if (!studentId) {
      return forbidden(res, 'Student ID is required');
    }

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      studentId
    }).populate('programmeId', 'title description duration level category modules');

    if (!enrollment) {
      return notFound(res, 'Enrollment not found');
    }

    success(res, enrollment, 'Enrollment details retrieved successfully');

  } catch (error) {
    logger.error('Get enrollment details error:', error);
    serverError(res, 'Failed to retrieve enrollment details');
  }
};

/**
 * Update learning activity
 */
export const updateLearningActivity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { enrollmentId, moduleId, lessonId, timeSpent = 0 } = req.body;

    if (!studentId) {
      return forbidden(res, 'Student ID is required');
    }

    // Find enrollment
    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      studentId
    });

    if (!enrollment) {
      return notFound(res, 'Enrollment not found');
    }

    // Update progress
    if (moduleId && !enrollment.progress.completedModules.includes(moduleId)) {
      enrollment.progress.completedModules.push(moduleId);
    }

    if (lessonId && !enrollment.progress.completedLessons.includes(lessonId)) {
      enrollment.progress.completedLessons.push(lessonId);
    }

    enrollment.progress.timeSpent += timeSpent;
    enrollment.progress.lastActivityDate = new Date();
    
    // Calculate progress percentage using totalProgress field
    const programme = await Programme.findById(enrollment.programmeId);
    if (programme) {
      const totalModules = programme.totalModules || 1;
      enrollment.progress.totalProgress = Math.round((enrollment.progress.completedModules.length / totalModules) * 100);
    }

    await enrollment.save();

    // Update student profile learning streak
    const profile = await StudentProfile.findOne({ userId: studentId });
    if (profile) {
      profile.updateLearningStreak();
      profile.statistics.totalLearningHours += timeSpent / 60; // Convert minutes to hours
      await profile.save();
    }

    success(res, {
      progress: enrollment.progress,
      streak: profile?.gamification.streaks || null
    }, 'Learning activity updated successfully');

  } catch (error) {
    logger.error('Update learning activity error:', error);
    serverError(res, 'Failed to update learning activity');
  }
};

/**
 * Get student analytics
 */
export const getStudentAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { days = 30 } = req.query;

    if (!studentId) {
      validationError(res, 'Student ID is required');
      return;
    }

    const daysBack = parseInt(days as string, 10);

    // Get comprehensive analytics data
    const analyticsData = await AnalyticsService.getAnalyticsData(studentId, daysBack);

    // Get dashboard overview for summary stats
    const dashboardOverview = await AnalyticsService.getDashboardOverview(studentId);

    const analytics = {
      overview: {
        totalCourses: dashboardOverview.enrolledCourses.total,
        activeCourses: dashboardOverview.enrolledCourses.active,
        completedCourses: dashboardOverview.enrolledCourses.completed,
        overallProgress: dashboardOverview.overallProgress,
        learningStreak: dashboardOverview.learningStreak,
        longestStreak: dashboardOverview.longestStreak,
        totalPoints: dashboardOverview.totalPoints,
        level: dashboardOverview.level,
        totalTimeSpent: dashboardOverview.totalTimeSpent
      },
      charts: {
        courseWiseProgress: analyticsData.courseWiseProgress,
        timeSpentPerCourse: analyticsData.timeSpentPerCourse,
        streakTrends: analyticsData.streakTrends,
        pointsEarned: analyticsData.pointsEarned,
        dailyEngagement: analyticsData.dailyEngagement
      },
      details: {
        lessonsCompleted: analyticsData.lessonsCompleted,
        modulesMastered: analyticsData.modulesMastered
      }
    };

    success(res, analytics, 'Student analytics retrieved successfully');
  } catch (error) {
    logger.error('Error getting student analytics:', error);
    serverError(res, 'Failed to retrieve student analytics');
  }
};

/**
 * Get detailed analytics for a specific course
 */
export const getCourseAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { courseId } = req.params;

    if (!studentId) {
      validationError(res, 'Student ID is required');
      return;
    }

    if (!courseId) {
      validationError(res, 'Course ID is required');
      return;
    }

    // Get detailed course analytics
    const courseAnalytics = await AnalyticsService.getCourseAnalytics(studentId, courseId);

    success(res, courseAnalytics, 'Course analytics retrieved successfully');
  } catch (error) {
    logger.error('Error getting course analytics:', error);
    serverError(res, 'Failed to retrieve course analytics');
  }
};

/**
 * Get profile photo URL with fallback hierarchy
 */
export const getProfilePhotoUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      validationError(res, 'Student ID is required');
      return;
    }

    const user = await User.findById(studentId).select('email firstName lastName username');
    const profile = await StudentProfile.findOne({ userId: studentId });
    
    if (!user) {
      notFound(res, 'User not found');
      return;
    }

    // Get profile photo with proper fallback hierarchy
    const photoInfo = getProfilePhotoWithFallback(user, profile);

    // Add timestamp to custom photos to prevent browser caching issues
    let finalPhotoUrl = photoInfo.url;
    if (photoInfo.source === 'custom' && profile?.profilePhoto?.url) {
      const separator = finalPhotoUrl.includes('?') ? '&' : '?';
      finalPhotoUrl = `${finalPhotoUrl}${separator}t=${Date.now()}`;
    }

    logger.info('Profile photo URL request:', {
      studentId,
      photoInfo,
      finalPhotoUrl,
      profilePhotoInDB: profile?.profilePhoto?.url || 'None',
      userProfilePicture: user.profilePicture || 'None'
    });

    success(res, {
      profilePhotoUrl: finalPhotoUrl,
      source: photoInfo.source,
      isCustom: photoInfo.source === 'custom',
      isInitials: photoInfo.source === 'initials',
      hasCustomPhoto: photoInfo.source === 'custom'
    }, 'Profile photo URL retrieved successfully');

  } catch (error) {
    logger.error('Get profile photo URL error:', error);
    serverError(res, 'Failed to retrieve profile photo URL');
  }
};

/**
 * Get enrolled programs for profile management
 */
export const getEnrolledPrograms = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      validationError(res, 'Student ID is required');
      return;
    }

    const { status, category, search } = req.query;

    // Build query
    const query: any = { studentId };
    if (status) {
      query.status = status;
    }

    // Get enrollments with detailed programme information
    let enrollmentsQuery = Enrollment.find(query)
      .populate({
        path: 'programmeId',
        match: category ? { category } : {},
        select: 'title description duration level category modules totalModules skills tags instructor',
        populate: {
          path: 'instructor',
          select: 'firstName lastName email profilePicture'
        }
      })
      .sort({ enrollmentDate: -1 });

    const enrollments = await enrollmentsQuery.exec() as any[];

    // Filter out enrollments where programme was not found (due to category filter)
    const filteredEnrollments = enrollments.filter(e => e.programmeId);

    // Apply search filter if provided
    let finalEnrollments = filteredEnrollments;
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      finalEnrollments = filteredEnrollments.filter(enrollment => 
        enrollment.programmeId?.title?.toLowerCase().includes(searchTerm) ||
        enrollment.programmeId?.description?.toLowerCase().includes(searchTerm) ||
        enrollment.programmeId?.category?.toLowerCase().includes(searchTerm)
      );
    }

    // Format response data
    const enrolledPrograms = finalEnrollments.map(enrollment => ({
      id: enrollment._id,
      programme: {
        id: enrollment.programmeId._id,
        title: enrollment.programmeId.title,
        description: enrollment.programmeId.description,
        duration: enrollment.programmeId.duration,
        level: enrollment.programmeId.level,
        category: enrollment.programmeId.category,
        skills: enrollment.programmeId.skills || [],
        tags: enrollment.programmeId.tags || [],
        instructor: enrollment.programmeId.instructor,
        totalModules: enrollment.programmeId.totalModules || 0
      },
      enrollment: {
        status: enrollment.status,
        enrollmentDate: enrollment.enrollmentDate,
        completionDate: enrollment.completionDate,
        certificateIssued: enrollment.certificateIssued,
        grade: enrollment.grade
      },
      progress: {
        totalProgress: enrollment.progress?.totalProgress || 0,
        completedModules: enrollment.progress?.completedModules || [],
        completedLessons: enrollment.progress?.completedLessons || [],
        timeSpent: enrollment.progress?.timeSpent || 0,
        lastActivityDate: enrollment.progress?.lastActivityDate,
        streak: enrollment.progress?.streak || 0
      },
      achievements: enrollment.achievements || []
    }));

    // Calculate summary statistics
    const summary = {
      total: enrolledPrograms.length,
      active: enrolledPrograms.filter(p => p.enrollment.status === 'ACTIVE').length,
      completed: enrolledPrograms.filter(p => p.enrollment.status === 'COMPLETED').length,
      paused: enrolledPrograms.filter(p => p.enrollment.status === 'PAUSED').length,
      averageProgress: enrolledPrograms.length > 0 
        ? Math.round(enrolledPrograms.reduce((sum, p) => sum + p.progress.totalProgress, 0) / enrolledPrograms.length)
        : 0,
      totalTimeSpent: enrolledPrograms.reduce((sum, p) => sum + p.progress.timeSpent, 0),
      categories: [...new Set(enrolledPrograms.map(p => p.programme.category))].filter(Boolean)
    };

    success(res, {
      enrolledPrograms,
      statistics: summary
    }, 'Enrolled programs retrieved successfully');

  } catch (error) {
    logger.error('Get enrolled programs error:', error);
    serverError(res, 'Failed to retrieve enrolled programs');
  }
};

/**
 * Enroll in a program (Enroll Now logic)
 * @route POST /api/student/enroll
 * @body programmeId: string
 */
export const enrollInProgram = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check for validation errors first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      validationError(res, 'Validation failed', errors.array());
      return;
    }

    const studentId = req.user?.id;
    const { programmeId } = req.body;
    
    // Log for debugging
    logger.info('Enrollment request:', { studentId, programmeId, userRole: req.user?.role });

    if (!studentId) {
      validationError(res, 'Authentication required - no student ID found');
      return;
    }

    if (!programmeId) {
      validationError(res, 'Programme ID is required');
      return;
    }

    // Validate that programmeId is a valid ObjectId format
    if (!programmeId.match(/^[0-9a-fA-F]{24}$/)) {
      validationError(res, 'Invalid programme ID format');
      return;
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({ studentId, programmeId });
    if (existing) {
      conflict(res, 'Already enrolled in this program');
      return;
    }

    // Check if programme exists
    const programme = await Programme.findById(programmeId);
    if (!programme) {
      notFound(res, 'Programme not found');
      return;
    }

    // Create new enrollment with ACTIVE status
    const enrollment = new Enrollment({
      studentId,
      programmeId,
      enrollmentDate: new Date(),
      status: 'ACTIVE', // Set to ACTIVE instead of ENROLLED
      progress: {
        completedModules: [],
        completedLessons: [],
        totalProgress: 0,
        lastActivityDate: new Date(),
        timeSpent: 0
      },
      paymentStatus: 'COMPLETED', // Set to COMPLETED for free courses
      certificateIssued: false,
      metadata: { enrollmentSource: 'DIRECT' },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await enrollment.save();

    // Update student profile statistics
    const profile = await StudentProfile.findOne({ userId: studentId });
    if (profile) {
      profile.statistics.totalCoursesEnrolled = (profile.statistics.totalCoursesEnrolled || 0) + 1;
      await profile.save();
    }

    // Return the created enrollment with populated programme data
    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('programmeId', 'title description duration level category totalModules totalLessons estimatedDuration imageUrl instructor')
      .lean();

    const transformedEnrollment = populatedEnrollment && populatedEnrollment.programmeId ? {
      id: populatedEnrollment._id.toString(),
      programmeId: (populatedEnrollment.programmeId as any)._id?.toString() || '',
      status: populatedEnrollment.status,
      enrollmentDate: populatedEnrollment.enrollmentDate,
      progress: {
        totalProgress: populatedEnrollment.progress?.totalProgress || 0,
        completedLessons: populatedEnrollment.progress?.completedLessons || [],
        timeSpent: populatedEnrollment.progress?.timeSpent || 0,
        lastActivityDate: populatedEnrollment.progress?.lastActivityDate
      },
      programme: {
        id: (populatedEnrollment.programmeId as any)._id?.toString() || '',
        title: (populatedEnrollment.programmeId as any).title || '',
        description: (populatedEnrollment.programmeId as any).description || '',
        category: (populatedEnrollment.programmeId as any).category || '',
        level: (populatedEnrollment.programmeId as any).level || '',
        totalModules: (populatedEnrollment.programmeId as any).totalModules || 0,
        totalLessons: (populatedEnrollment.programmeId as any).totalLessons || 0,
        estimatedDuration: (populatedEnrollment.programmeId as any).estimatedDuration || 0,
        thumbnail: (populatedEnrollment.programmeId as any).imageUrl || '',
        instructor: (populatedEnrollment.programmeId as any).instructor || ''
      }
    } : null;
    if (transformedEnrollment) {
      created(res, transformedEnrollment, 'Enrolled successfully');
    } else {
      serverError(res, 'Failed to populate enrollment');
    }
  } catch (error) {
    logger.error('Enroll in program error:', error);
    serverError(res, 'Failed to enroll in program');
  }
};

/**
 * Mark lesson as completed and update progress
 * @route POST /api/student/lesson/complete
 * @body { enrollmentId: string, moduleId: string, lessonId: string, timeSpent: number }
 */
export const markLessonCompleted = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { enrollmentId, moduleId, lessonId, timeSpent = 0 } = req.body;

    if (!studentId) {
      return forbidden(res, 'Student ID is required');
    }

    // Find enrollment and verify ownership
    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      studentId
    }).populate('programmeId');

    if (!enrollment) {
      return notFound(res, 'Enrollment not found');
    }

    // Update progress
    const progress = enrollment.progress;
    
    // Add module if not already completed
    if (moduleId && !progress.completedModules.includes(moduleId)) {
      progress.completedModules.push(moduleId);
    }

    // Add lesson if not already completed
    if (lessonId && !progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    // Update time spent
    progress.timeSpent += timeSpent;
    progress.lastActivityDate = new Date();
    
    // Calculate progress percentage
    const programme = enrollment.programmeId as any;
    if (programme) {
      const totalLessons = programme.totalLessons || 1;
      progress.totalProgress = Math.round((progress.completedLessons.length / totalLessons) * 100);
    }

    await enrollment.save();

    // Update student profile statistics
    const profile = await StudentProfile.findOne({ userId: studentId });
    if (profile) {
      profile.statistics.totalLearningHours = (profile.statistics.totalLearningHours || 0) + (timeSpent / 60);
      profile.updateLearningStreak();
      await profile.save();
    }

    success(res, {
      enrollment: {
        id: enrollment._id,
        progress: enrollment.progress,
        status: enrollment.status
      },
      profile: profile ? {
        totalLearningHours: profile.statistics.totalLearningHours,
        streaks: profile.gamification.streaks
      } : null
    }, 'Lesson completed successfully');

  } catch (error) {
    logger.error('Mark lesson completed error:', error);
    serverError(res, 'Failed to mark lesson as completed');
  }
};

/**
 * Update lesson progress (for partial completion)
 * @route PUT /api/student/lesson/progress
 * @body { enrollmentId: string, lessonId: string, progressPercentage: number, timeSpent: number }
 */
export const updateLessonProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { enrollmentId, lessonId, progressPercentage, timeSpent = 0 } = req.body;

    if (!studentId) {
      return forbidden(res, 'Student ID is required');
    }

    // Find enrollment and verify ownership
    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      studentId
    });

    if (!enrollment) {
      return notFound(res, 'Enrollment not found');
    }

    // Update progress
    const progress = enrollment.progress;
    progress.timeSpent += timeSpent;
    progress.lastActivityDate = new Date();

    // If lesson is 100% complete, add it to completed lessons
    if (progressPercentage >= 100 && !progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    // Recalculate total progress
    const programme = await Programme.findById(enrollment.programmeId);
    if (programme) {
      const totalLessons = programme.totalLessons || 1;
      progress.totalProgress = Math.round((progress.completedLessons.length / totalLessons) * 100);
    }

    await enrollment.save();

    success(res, {
      enrollment: {
        id: enrollment._id,
        progress: enrollment.progress
      }
    }, 'Lesson progress updated successfully');

  } catch (error) {
    logger.error('Update lesson progress error:', error);
    serverError(res, 'Failed to update lesson progress');
  }
};
