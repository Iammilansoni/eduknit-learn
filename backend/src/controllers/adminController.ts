import { Request, Response } from 'express';
import Programme from '../models/Programme';
import ProgrammeModule from '../models/ProgrammeModule';
import ProgrammeLesson from '../models/ProgrammeLesson';
import Enrollment from '../models/Enrollment';
import User from '../models/User';
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

/**
 * MODULE CRUD (Admin)
 */
export const createModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { programmeId, title, description, orderIndex, estimatedDuration, totalLessons, learningObjectives, isActive } = req.body;
    if (!programmeId || !title) {
      return validationError(res, 'programmeId and title are required');
    }
    const module = new ProgrammeModule({
      programmeId,
      title,
      description,
      orderIndex,
      estimatedDuration,
      totalLessons,
      learningObjectives,
      isActive: isActive !== false
    });
    await module.save();
    created(res, module, 'Module created successfully');
  } catch (error) {
    logger.error('Create module error:', error);
    serverError(res, 'Failed to create module');
  }
};

export const getModulesByProgramme = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      programmeId, 
      page = 1, 
      limit = 10, 
      search, 
      status 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build query
    let query: any = {};
    
    // If programmeId is provided, filter by it
    if (programmeId && programmeId !== 'all') {
      query.programmeId = programmeId;
    }
    
    // Add search functionality
    if (search) {
      const searchQuery = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
      
      if (query.programmeId) {
        // Combine with programmeId filter
        query = {
          $and: [
            { programmeId: query.programmeId },
            searchQuery
          ]
        };
      } else {
        query = { ...query, ...searchQuery };
      }
    }
    
    // Add status filter
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    // Get modules with pagination and populate programme details
    const modules = await ProgrammeModule.find(query)
      .populate('programmeId', 'title')
      .sort({ orderIndex: 1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count
    const total = await ProgrammeModule.countDocuments(query);

    // Transform the response to match frontend expectations
    const transformedModules = modules.map(module => {
      // Handle programmeId field
      const courseRef = (module as any).programmeId;
      const courseId = courseRef?._id || (module as any).programmeId;
      const courseTitle = courseRef?.title;
      
      return {
        id: module._id,
        title: module.title,
        description: module.description,
        order: (module as any).order || module.orderIndex || 1,
        estimatedDuration: module.estimatedDuration || 30,
        objectives: module.learningObjectives || [],
        prerequisites: module.prerequisites || [],
        isActive: module.isActive,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
        createdBy: { username: 'admin', email: 'admin@eduknit.com' },
        lastModifiedBy: { username: 'admin', email: 'admin@eduknit.com' },
        courseId: courseId,
        courseTitle: courseTitle,
        lessonsCount: 0 // TODO: Calculate actual lessons count
      };
    });

    success(res, {
      modules: transformedModules,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, 'Modules retrieved successfully');
  } catch (error) {
    logger.error('Get modules error:', error);
    serverError(res, 'Failed to retrieve modules');
  }
};

export const getModuleById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const module = await ProgrammeModule.findById(id);
    if (!module) return notFound(res, 'Module not found');
    success(res, module, 'Module retrieved successfully');
  } catch (error) {
    logger.error('Get module by ID error:', error);
    serverError(res, 'Failed to retrieve module');
  }
};

export const updateModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const module = await ProgrammeModule.findById(id);
    if (!module) return notFound(res, 'Module not found');
    Object.assign(module, updateData);
    await module.save();
    success(res, module, 'Module updated successfully');
  } catch (error) {
    logger.error('Update module error:', error);
    serverError(res, 'Failed to update module');
  }
};

export const deleteModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Delete related lessons
    await ProgrammeLesson.deleteMany({ moduleId: id });
    await ProgrammeModule.findByIdAndDelete(id);
    success(res, null, 'Module and related lessons deleted successfully');
  } catch (error) {
    logger.error('Delete module error:', error);
    serverError(res, 'Failed to delete module');
  }
};

/**
 * LESSON CRUD (Admin)
 */
export const createLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { moduleId, programmeId, title, description, orderIndex, type, content, estimatedDuration, duration, isRequired, learningObjectives, resources, isActive } = req.body;
    if (!moduleId || !programmeId || !title || !type) {
      return validationError(res, 'moduleId, programmeId, title, and type are required');
    }
    const lesson = new ProgrammeLesson({
      moduleId,
      programmeId,
      title,
      description,
      orderIndex,
      type,
      content,
      estimatedDuration,
      duration,
      isRequired: isRequired !== false,
      learningObjectives,
      resources,
      isActive: isActive !== false
    });
    await lesson.save();
    created(res, lesson, 'Lesson created successfully');
  } catch (error) {
    logger.error('Create lesson error:', error);
    serverError(res, 'Failed to create lesson');
  }
};

export const getLessonsByModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.query;
    if (!moduleId) return validationError(res, 'moduleId is required');
    const lessons = await ProgrammeLesson.find({ moduleId }).sort({ orderIndex: 1 });
    success(res, lessons, 'Lessons retrieved successfully');
  } catch (error) {
    logger.error('Get lessons error:', error);
    serverError(res, 'Failed to retrieve lessons');
  }
};

export const getLessonById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lesson = await ProgrammeLesson.findById(id);
    if (!lesson) return notFound(res, 'Lesson not found');
    success(res, lesson, 'Lesson retrieved successfully');
  } catch (error) {
    logger.error('Get lesson by ID error:', error);
    serverError(res, 'Failed to retrieve lesson');
  }
};

export const updateLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const lesson = await ProgrammeLesson.findById(id);
    if (!lesson) return notFound(res, 'Lesson not found');
    Object.assign(lesson, updateData);
    await lesson.save();
    success(res, lesson, 'Lesson updated successfully');
  } catch (error) {
    logger.error('Update lesson error:', error);
    serverError(res, 'Failed to update lesson');
  }
};

export const deleteLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await ProgrammeLesson.findByIdAndDelete(id);
    success(res, null, 'Lesson deleted successfully');
  } catch (error) {
    logger.error('Delete lesson error:', error);
    serverError(res, 'Failed to delete lesson');
  }
};

/**
 * Get comprehensive dashboard statistics
 * GET /api/admin/dashboard/stats
 */
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Get all the counts in parallel for better performance
    const [
      totalCourses,
      totalModules,
      totalLessons,
      totalUsers,
      totalStudents,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      recentEnrollments
    ] = await Promise.all([
      Programme.countDocuments(),
      ProgrammeModule.countDocuments(),
      ProgrammeLesson.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: 'ACTIVE' }),
      Enrollment.countDocuments({ status: 'COMPLETED' }),
      Enrollment.find()
        .populate('userId', 'firstName lastName email')
        .populate('programmeId', 'title')
        .sort({ enrolledAt: -1 })
        .limit(10)
    ]);

    // Calculate average progress
    const enrollmentsWithProgress = await Enrollment.find({ progress: { $exists: true, $ne: null } });
    const averageProgress = enrollmentsWithProgress.length > 0 
      ? enrollmentsWithProgress.reduce((sum, enrollment) => sum + (enrollment.progress || 0), 0) / enrollmentsWithProgress.length
      : 0;

    // Format recent activity
    const recentActivity = recentEnrollments.map(enrollment => ({
      id: enrollment._id.toString(),
      type: 'enrollment',
      description: `${(enrollment.userId as any)?.firstName || 'User'} ${(enrollment.userId as any)?.lastName || ''} enrolled in ${(enrollment.programmeId as any)?.title || 'course'}`,
      timestamp: enrollment.enrolledAt.toISOString(),
      user: `${(enrollment.userId as any)?.firstName || 'User'} ${(enrollment.userId as any)?.lastName || ''}`.trim()
    }));

    const stats = {
      totalCourses,
      totalModules,
      totalLessons,
      totalUsers,
      totalStudents,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      averageProgress: Math.round(averageProgress * 10) / 10, // Round to 1 decimal place
      recentActivity
    };

    success(res, stats, 'Dashboard stats retrieved successfully');
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    serverError(res, 'Failed to fetch dashboard statistics');
  }
};