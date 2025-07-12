import { Request, Response } from 'express';
import { Types } from 'mongoose';
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
      imageUrl,
      slug: providedSlug // Ignore the provided slug, we'll generate our own
    } = req.body;

    const adminId = req.user?.id;

    // Validate required fields
    if (!title || !description || !category || !instructor) {
      return validationError(res, 'Title, description, category, and instructor are required');
    }

    // Validate minimum values for totalModules, totalLessons, and estimatedDuration
    const finalTotalModules = totalModules || 1;
    const finalTotalLessons = totalLessons || 1;
    const finalEstimatedDuration = estimatedDuration || 1;

    // Create new programme - let the pre-save middleware handle slug generation
    const programme = new Programme({
      title,
      description,
      category,
      instructor,
      duration: duration || '2-3 hours/week',
      timeframe: timeframe || '4-6 weeks',
      level: level || 'BEGINNER',
      price: price || 0,
      currency: currency || 'USD',
      overview: overview || description,
      skills: skills || [],
      prerequisites: prerequisites || [],
      totalModules: finalTotalModules,
      totalLessons: finalTotalLessons,
      estimatedDuration: finalEstimatedDuration,
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
  } catch (error: any) {
    logger.error('Create course error:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return validationError(res, `Validation error: ${validationErrors.join(', ')}`);
    }
    
    // Handle duplicate key errors (e.g., slug conflicts)
    if (error.code === 11000) {
      return validationError(res, 'A course with this title already exists. Please choose a different title.');
    }
    
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
    const { force } = req.query; // Allow force deletion via query parameter
    const adminId = req.user?.id;

    console.log('Delete course request:', { id, adminId, force, params: req.params });

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      console.log('Invalid ObjectId format:', id);
      return validationError(res, 'Invalid course ID format');
    }

    const course = await Programme.findById(id);
    if (!course) {
      console.log('Course not found:', id);
      return notFound(res, 'Course not found');
    }

    console.log('Course found for deletion:', { id: course._id, title: course.title });

    // Check if course has enrollments
    const enrollmentCount = await Enrollment.countDocuments({ programmeId: id });
    console.log('Enrollment count:', enrollmentCount);
    
    if (enrollmentCount > 0) {
      if (force === 'true') {
        console.log('Force deleting enrollments...');
        await Enrollment.deleteMany({ programmeId: id });
        console.log(`Deleted ${enrollmentCount} enrollments`);
      } else {
        console.log('Cannot delete course with enrollments:', enrollmentCount);
        return validationError(res, `Cannot delete course with ${enrollmentCount} active enrollments. Use force=true to delete anyway.`);
      }
    }

    // Delete related modules and lessons
    console.log('Deleting related modules and lessons...');
    const deletedModules = await ProgrammeModule.deleteMany({ programmeId: id });
    const deletedLessons = await ProgrammeLesson.deleteMany({ programmeId: id });
    console.log(`Deleted ${deletedModules.deletedCount} modules and ${deletedLessons.deletedCount} lessons`);
    
    // Delete the course
    console.log('Deleting course...');
    await Programme.findByIdAndDelete(id);

    logger.info(`Course deleted: ${course.title} by admin ${adminId} ${force === 'true' ? '(forced)' : ''}`);
    console.log('Course deletion successful');

    success(res, null, 'Course deleted successfully');
  } catch (error: any) {
    console.log('Delete course error:', error);
    logger.error('Delete course error:', error);
    
    // Handle specific error types
    if (error.name === 'CastError') {
      return validationError(res, 'Invalid course ID format');
    }
    
    if (error.name === 'ValidationError') {
      return validationError(res, 'Validation error occurred during deletion');
    }
    
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
    console.log('Create module request body:', req.body);
    
    const { 
      programmeId, 
      title, 
      description, 
      orderIndex, 
      estimatedDuration, 
      totalLessons, 
      learningObjectives, 
      prerequisites,
      isActive 
    } = req.body;
    
    if (!programmeId || !title || !description) {
      console.log('Validation failed:', { programmeId, title, description });
      return validationError(res, 'programmeId, title, and description are required');
    }

    // Validate programmeId is a valid ObjectId
    if (!Types.ObjectId.isValid(programmeId)) {
      return validationError(res, 'Invalid programmeId format');
    }

    // Get the next orderIndex if not provided
    let nextOrderIndex = orderIndex;
    if (!nextOrderIndex) {
      const lastModule = await ProgrammeModule.findOne({ programmeId })
        .sort({ orderIndex: -1 })
        .select('orderIndex');
      nextOrderIndex = lastModule ? lastModule.orderIndex + 1 : 0;
    }

    console.log('Creating module with data:', {
      programmeId,
      title,
      description,
      orderIndex: nextOrderIndex,
      estimatedDuration: estimatedDuration || 30,
      totalLessons: totalLessons || 1,
      learningObjectives: learningObjectives || [],
      prerequisites: prerequisites || [],
      isActive: isActive !== false
    });

    const module = new ProgrammeModule({
      programmeId,
      title,
      description: description || '',
      orderIndex: nextOrderIndex,
      estimatedDuration: estimatedDuration || 30, // Default 30 minutes
      totalLessons: totalLessons || 1, // Default 1 lesson
      learningObjectives: learningObjectives || [],
      prerequisites: prerequisites || [],
      isActive: isActive !== false
    });
    
    await module.save();
    console.log('Module created successfully:', module._id);
    created(res, module, 'Module created successfully');
  } catch (error) {
    console.error('Create module error:', error);
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
    
    // Transform the response to match frontend expectations
    const transformedModule = {
      id: module._id,
      title: module.title,
      description: module.description,
      order: module.orderIndex || 1,
      estimatedDuration: module.estimatedDuration || 30,
      objectives: module.learningObjectives || [],
      prerequisites: module.prerequisites || [],
      isActive: module.isActive,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
      createdBy: { username: 'admin', email: 'admin@eduknit.com' },
      lastModifiedBy: { username: 'admin', email: 'admin@eduknit.com' },
      courseId: module.programmeId, // Map programmeId to courseId for frontend
      courseTitle: 'Unknown Course' // Could be populated if needed
    };
    
    success(res, transformedModule, 'Module retrieved successfully');
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

export const toggleModuleStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const module = await ProgrammeModule.findById(id);
    if (!module) return notFound(res, 'Module not found');
    module.isActive = !module.isActive;
    await module.save();
    success(res, module, 'Module status updated successfully');
  } catch (error) {
    logger.error('Toggle module status error:', error);
    serverError(res, 'Failed to toggle module status');
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
    console.log('Create lesson request body:', req.body);
    
    const { moduleId, programmeId, title, description, orderIndex, type, content, estimatedDuration, duration, isRequired, learningObjectives, resources, isActive } = req.body;
    
    if (!moduleId || !programmeId || !title || !type) {
      console.log('Validation failed:', { moduleId, programmeId, title, type });
      return validationError(res, 'moduleId, programmeId, title, and type are required');
    }

    // Validate ObjectIds
    if (!Types.ObjectId.isValid(moduleId)) {
      return validationError(res, 'Invalid moduleId format');
    }
    if (!Types.ObjectId.isValid(programmeId)) {
      return validationError(res, 'Invalid programmeId format');
    }

    // Get the next orderIndex if not provided
    let nextOrderIndex = orderIndex;
    if (!nextOrderIndex) {
      const lastLesson = await ProgrammeLesson.findOne({ moduleId })
        .sort({ orderIndex: -1 })
        .select('orderIndex');
      nextOrderIndex = lastLesson ? lastLesson.orderIndex + 1 : 0;
    }

    // Clean and validate content based on lesson type
    let cleanedContent = {};
    if (content) {
      cleanedContent = { ...content };
      
      // For non-quiz lessons, remove quiz-related fields
      if (type !== 'QUIZ') {
        delete (cleanedContent as any).quiz;
      }
      
      // Clean richContent array - remove items with empty content
      if ((cleanedContent as any).richContent && Array.isArray((cleanedContent as any).richContent)) {
        (cleanedContent as any).richContent = (cleanedContent as any).richContent.filter((item: any) => 
          item && item.content && item.content.trim() !== ''
        );
      }
      
      // If no valid richContent, remove the field entirely
      if (!(cleanedContent as any).richContent || (cleanedContent as any).richContent.length === 0) {
        delete (cleanedContent as any).richContent;
      }
    }

    console.log('Creating lesson with data:', {
      moduleId,
      programmeId,
      title,
      description,
      orderIndex: nextOrderIndex,
      type,
      estimatedDuration: estimatedDuration || 15,
      isRequired: isRequired !== false,
      isActive: isActive !== false,
      content: cleanedContent
    });

    const lesson = new ProgrammeLesson({
      moduleId,
      programmeId,
      title,
      description: description || '',
      orderIndex: nextOrderIndex,
      type,
      content: cleanedContent,
      estimatedDuration: estimatedDuration || 15,
      duration: duration || estimatedDuration || 15,
      isRequired: isRequired !== false,
      learningObjectives: learningObjectives || [],
      resources: resources || [],
      isActive: isActive !== false
    });
    
    await lesson.save();
    console.log('Lesson created successfully:', lesson._id);
    created(res, lesson, 'Lesson created successfully');
  } catch (error) {
    console.error('Create lesson error:', error);
    logger.error('Create lesson error:', error);
    serverError(res, 'Failed to create lesson');
  }
};

export const getLessonsByModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { moduleId, page = 1, limit = 10 } = req.query;
    if (!moduleId) return validationError(res, 'moduleId is required');

    const skip = (Number(page) - 1) * Number(limit);

    // Get paginated lessons
    const lessons = await ProgrammeLesson.find({ moduleId })
      .sort({ orderIndex: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ProgrammeLesson.countDocuments({ moduleId });

    success(res, {
      lessons,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, 'Lessons retrieved successfully');
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
        .populate('studentId', 'firstName lastName email')
        .populate('programmeId', 'title')
        .sort({ enrollmentDate: -1 })
        .limit(10)
    ]);

    // Calculate average progress
    const enrollmentsWithProgress = await Enrollment.find({ 'progress.totalProgress': { $exists: true, $ne: null } });
    const averageProgress = enrollmentsWithProgress.length > 0 
      ? enrollmentsWithProgress.reduce((sum, enrollment) => sum + (enrollment.progress?.totalProgress || 0), 0) / enrollmentsWithProgress.length
      : 0;

    // Format recent activity
    const recentActivity = recentEnrollments.map(enrollment => ({
      id: (enrollment._id as Types.ObjectId).toString(),
      type: 'enrollment',
      description: `${(enrollment.studentId as any)?.firstName || 'User'} ${(enrollment.studentId as any)?.lastName || ''} enrolled in ${(enrollment.programmeId as any)?.title || 'course'}`,
      timestamp: enrollment.enrollmentDate.toISOString(),
      user: `${(enrollment.studentId as any)?.firstName || 'User'} ${(enrollment.studentId as any)?.lastName || ''}`.trim()
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

/**
 * Get comprehensive admin analytics data
 * GET /api/admin/analytics
 */
export const getAdminAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Get all the counts in parallel for better performance
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments
    ] = await Promise.all([
      User.countDocuments(),
      Programme.countDocuments(),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: 'ACTIVE' }),
      Enrollment.countDocuments({ status: 'COMPLETED' })
    ]);

    // Calculate average progress
    const enrollmentsWithProgress = await Enrollment.find({ 'progress.totalProgress': { $exists: true, $ne: null } });
    const averageProgress = enrollmentsWithProgress.length > 0 
      ? enrollmentsWithProgress.reduce((sum, enrollment) => sum + (enrollment.progress?.totalProgress || 0), 0) / enrollmentsWithProgress.length
      : 0;

    // Calculate monthly growth (simplified - using last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [recentUsers, previousUsers, recentEnrollments, previousEnrollments] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      Enrollment.countDocuments({ enrollmentDate: { $gte: thirtyDaysAgo } }),
      Enrollment.countDocuments({ enrollmentDate: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } })
    ]);

    const userGrowth = previousUsers > 0 ? ((recentUsers - previousUsers) / previousUsers) * 100 : 0;
    const enrollmentGrowth = previousEnrollments > 0 ? ((recentEnrollments - previousEnrollments) / previousEnrollments) * 100 : 0;

    // Get top courses by enrollment
    const topCourses = await Enrollment.aggregate([
      {
        $group: {
          _id: '$programmeId',
          enrollments: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'programmes',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $project: {
          id: '$_id',
          title: '$course.title',
          enrollments: '$enrollments',
          completionRate: { $multiply: [{ $divide: ['$completed', '$enrollments'] }, 100] }
        }
      },
      {
        $sort: { enrollments: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get recent activity
    const recentActivity = await Enrollment.find()
      .populate('studentId', 'firstName lastName email')
      .populate('programmeId', 'title')
      .sort({ enrollmentDate: -1 })
      .limit(10)
      .then(enrollments => enrollments.map(enrollment => ({
        id: (enrollment._id as Types.ObjectId).toString(),
        type: 'enrollment',
        description: `${(enrollment.studentId as any)?.firstName || 'User'} ${(enrollment.studentId as any)?.lastName || ''} enrolled in ${(enrollment.programmeId as any)?.title || 'course'}`,
        timestamp: enrollment.enrollmentDate.toISOString()
      })));

    const analyticsData = {
      totalUsers,
      totalCourses,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      averageProgress: Math.round(averageProgress * 10) / 10,
      monthlyGrowth: {
        users: Math.round(userGrowth * 10) / 10,
        enrollments: Math.round(enrollmentGrowth * 10) / 10,
        completions: 0 // Could be calculated if needed
      },
      topCourses: topCourses.map(course => ({
        id: course.id.toString(),
        title: course.title,
        enrollments: course.enrollments,
        completionRate: Math.round(course.completionRate * 10) / 10
      })),
      recentActivity
    };

    success(res, analyticsData, 'Admin analytics retrieved successfully');
  } catch (error) {
    logger.error('Get admin analytics error:', error);
    serverError(res, 'Failed to fetch admin analytics');
  }
};