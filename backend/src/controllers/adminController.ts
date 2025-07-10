import { Request, Response } from 'express';
import Programme from '../models/Programme';
import ProgrammeModule from '../models/ProgrammeModule';
import ProgrammeLesson from '../models/ProgrammeLesson';
import Enrollment from '../models/Enrollment';
import { AuthenticatedRequest } from '../utils/jwt';
import { 
  success, 
  created, 
  validationError, 
  notFound, 
  serverError 
} from '../utils/response';
import logger from '../config/logger';

/**
 * Create a new course/programme
 * POST /api/admin/courses
 */
export const createCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      category,
      instructor,
      duration,
      timeframe,
      level,
      price,
      currency,
      overview,
      skills,
      prerequisites,
      totalModules,
      totalLessons,
      estimatedDuration,
      durationDays,
      certificateAwarded,
      imageUrl
    } = req.body;

    const adminId = req.user?.id;

    // Validate required fields
    if (!title || !description || !category || !instructor) {
      return validationError(res, 'Title, description, category, and instructor are required');
    }

    // Create new programme
    const programme = new Programme({
      title,
      description,
      category,
      instructor,
      duration,
      timeframe,
      level: level || 'BEGINNER',
      price: price || 0,
      currency: currency || 'USD',
      overview,
      skills: skills || [],
      prerequisites: prerequisites || [],
      totalModules: totalModules || 0,
      totalLessons: totalLessons || 0,
      estimatedDuration: estimatedDuration || 0,
      durationDays: durationDays || 30,
      certificateAwarded: certificateAwarded !== false,
      imageUrl,
      isActive: true,
      createdBy: adminId,
      lastModifiedBy: adminId
    });

    await programme.save();

    logger.info(`Course created: ${title} by admin ${adminId}`);

    created(res, programme, 'Course created successfully');
  } catch (error) {
    logger.error('Create course error:', error);
    serverError(res, 'Failed to create course');
  }
};

/**
 * Get all courses with pagination and filtering
 * GET /api/admin/courses
 */
export const getAllCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      level, 
      status 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build query
    let query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (status !== undefined) query.isActive = status === 'active';

    // Get courses with pagination
    const courses = await Programme.find(query)
      .populate('createdBy', 'username email')
      .populate('lastModifiedBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count
    const total = await Programme.countDocuments(query);

    success(res, {
      courses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, 'Courses retrieved successfully');
  } catch (error) {
    logger.error('Get all courses error:', error);
    serverError(res, 'Failed to retrieve courses');
  }
};

/**
 * Get course by ID with full details
 * GET /api/admin/courses/:id
 */
export const getCourseById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const course = await Programme.findById(id)
      .populate('createdBy', 'username email')
      .populate('lastModifiedBy', 'username email');

    if (!course) {
      return notFound(res, 'Course not found');
    }

    // Get modules and lessons count
    const modulesCount = await ProgrammeModule.countDocuments({ programmeId: id });
    const lessonsCount = await ProgrammeLesson.countDocuments({ programmeId: id });

    success(res, {
      ...course.toObject(),
      modulesCount,
      lessonsCount
    }, 'Course retrieved successfully');
  } catch (error) {
    logger.error('Get course by ID error:', error);
    serverError(res, 'Failed to retrieve course');
  }
};

/**
 * Update course
 * PUT /api/admin/courses/:id
 */
export const updateCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const adminId = req.user?.id;

    const course = await Programme.findById(id);
    if (!course) {
      return notFound(res, 'Course not found');
    }

    // Update course
    Object.assign(course, updateData, { lastModifiedBy: adminId });
    await course.save();

    logger.info(`Course updated: ${course.title} by admin ${adminId}`);

    success(res, course, 'Course updated successfully');
  } catch (error) {
    logger.error('Update course error:', error);
    serverError(res, 'Failed to update course');
  }
};

/**
 * Delete course
 * DELETE /api/admin/courses/:id
 */
export const deleteCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    const course = await Programme.findById(id);
    if (!course) {
      return notFound(res, 'Course not found');
    }

    // Check if course has enrollments
    const enrollmentCount = await Enrollment.countDocuments({ programmeId: id });
    
    if (enrollmentCount > 0) {
      return validationError(res, `Cannot delete course with ${enrollmentCount} active enrollments`);
    }

    // Delete related modules and lessons
    await ProgrammeModule.deleteMany({ programmeId: id });
    await ProgrammeLesson.deleteMany({ programmeId: id });
    
    // Delete the course
    await Programme.findByIdAndDelete(id);

    logger.info(`Course deleted: ${course.title} by admin ${adminId}`);

    success(res, null, 'Course deleted successfully');
  } catch (error) {
    logger.error('Delete course error:', error);
    serverError(res, 'Failed to delete course');
  }
};

/**
 * Toggle course status (active/inactive)
 * PATCH /api/admin/courses/:id/toggle-status
 */
export const toggleCourseStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    const course = await Programme.findById(id);
    if (!course) {
      return notFound(res, 'Course not found');
    }

    course.isActive = !course.isActive;
    course.lastModifiedBy = adminId;
    await course.save();

    logger.info(`Course status toggled: ${course.title} (${course.isActive ? 'active' : 'inactive'}) by admin ${adminId}`);

    success(res, course, `Course ${course.isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    logger.error('Toggle course status error:', error);
    serverError(res, 'Failed to toggle course status');
  }
};

/**
 * Get course statistics
 * GET /api/admin/courses/:id/stats
 */
export const getCourseStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const course = await Programme.findById(id);
    if (!course) {
      return notFound(res, 'Course not found');
    }

    // Get enrollment statistics
    const enrollments = await Enrollment.find({ programmeId: id });
    
    const stats = {
      totalEnrollments: enrollments.length,
      activeEnrollments: enrollments.filter((e: any) => e.status === 'ACTIVE').length,
      completedEnrollments: enrollments.filter((e: any) => e.status === 'COMPLETED').length,
      averageProgress: enrollments.length > 0 
        ? enrollments.reduce((sum: number, e: any) => sum + (e.progress?.totalProgress || 0), 0) / enrollments.length 
        : 0,
      modulesCount: await ProgrammeModule.countDocuments({ programmeId: id }),
      lessonsCount: await ProgrammeLesson.countDocuments({ programmeId: id })
    };

    success(res, stats, 'Course statistics retrieved successfully');
  } catch (error) {
    logger.error('Get course stats error:', error);
    serverError(res, 'Failed to retrieve course statistics');
  }
};

/**
 * Get overall course statistics for dashboard
 * GET /api/admin/courses/stats
 */
export const getOverallCourseStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Get overall course statistics
    const totalCourses = await Programme.countDocuments();
    const activeCourses = await Programme.countDocuments({ isActive: true });
    const inactiveCourses = await Programme.countDocuments({ isActive: false });
    
    // Get courses by category
    const categoryStats = await Programme.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get courses by level
    const levelStats = await Programme.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get recent courses (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCourses = await Programme.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const stats = {
      totalCourses,
      activeCourses,
      inactiveCourses,
      recentCourses,
      categoryStats,
      levelStats
    };

    success(res, stats, 'Overall course statistics retrieved successfully');
  } catch (error) {
    logger.error('Get overall course stats error:', error);
    serverError(res, 'Failed to retrieve overall course statistics');
  }
};

/**
 * Get enrollment statistics for dashboard
 * GET /api/admin/enrollments/stats
 */
export const getEnrollmentStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Get overall enrollment statistics
    const totalEnrollments = await Enrollment.countDocuments();
    const activeEnrollments = await Enrollment.countDocuments({ status: 'ACTIVE' });
    const completedEnrollments = await Enrollment.countDocuments({ status: 'COMPLETED' });
    const pendingEnrollments = await Enrollment.countDocuments({ status: 'ENROLLED' });
    
    // Get recent enrollments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEnrollments = await Enrollment.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get average progress across all enrollments
    const enrollments = await Enrollment.find({});
    const averageProgress = enrollments.length > 0 
      ? enrollments.reduce((sum: number, e: any) => sum + (e.progress?.totalProgress || 0), 0) / enrollments.length 
      : 0;

    // Get enrollments by status
    const statusStats = await Enrollment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const stats = {
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      pendingEnrollments,
      recentEnrollments,
      averageProgress: Math.round(averageProgress * 100) / 100,
      statusStats
    };

    success(res, stats, 'Enrollment statistics retrieved successfully');
  } catch (error) {
    logger.error('Get enrollment stats error:', error);
    serverError(res, 'Failed to retrieve enrollment statistics');
  }
}; 