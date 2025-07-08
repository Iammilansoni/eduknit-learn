import type { Request, Response } from 'express';
import UserCourse from '../models/UserCourse';
import Programme from '../models/Programme';
import User from '../models/User';
import StudentProfile from '../models/StudentProfile';
import { 
  success, 
  created, 
  validationError as badRequest, 
  notFound, 
  conflict, 
  serverError 
} from '../utils/response';
import { AuthenticatedRequest } from '../utils/jwt';
import logger from '../config/logger';

/**
 * Enroll student in a course
 * POST /api/course/enroll
 */
export const enrollInCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return badRequest(res, 'User ID is required');
    }

    if (!courseId) {
      return badRequest(res, 'Course ID is required');
    }

    // Check if course exists and is active
    const course = await Programme.findById(courseId);
    if (!course || !course.isActive) {
      return notFound(res, 'Course not found or not available for enrollment');
    }

    // Check if user is already enrolled
    const existingEnrollment = await UserCourse.findOne({ userId, courseId });
    if (existingEnrollment) {
      return conflict(res, 'Already enrolled in this course');
    }

    // Create new enrollment
    const userCourse = new UserCourse({
      userId,
      courseId,
      enrolledAt: new Date(),
      status: 'ENROLLED',
      progressPercent: 0,
      studyTime: 0,
      completedLessons: [],
      analytics: {
        streakDays: 0,
        lastStreakDate: new Date(),
        totalPoints: 0,
        averageScore: 0
      }
    });

    await userCourse.save();

    // Update student profile statistics
    const profile = await StudentProfile.findOne({ userId });
    if (profile) {
      profile.statistics.totalCoursesEnrolled += 1;
      await profile.save();
    }

    // Add enrollment points
    const enrollmentPoints = 50; // Points for enrolling
    userCourse.analytics.totalPoints += enrollmentPoints;
    await userCourse.save();

    logger.info(`User ${userId} enrolled in course ${courseId}`);

    created(res, {
      enrollment: userCourse,
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        category: course.category
      }
    }, 'Successfully enrolled in course');

  } catch (error) {
    logger.error('Course enrollment error:', error);
    serverError(res, 'Failed to enroll in course');
  }
};

/**
 * Get user's enrolled courses
 * GET /api/course/my-courses
 */
export const getMyCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { status, category, search } = req.query;

    if (!userId) {
      return badRequest(res, 'User ID is required');
    }

    // Build query
    let query: any = { userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get enrolled courses with populated course data
    let enrollments = await UserCourse.find(query)
      .populate({
        path: 'courseId',
        select: 'title description category instructor duration level imageUrl totalModules totalLessons estimatedDuration skills',
        match: category ? { category } : {}
      })
      .sort({ enrolledAt: -1 });

    // Filter out enrollments where course was not found (due to category filter)
    enrollments = enrollments.filter(enrollment => enrollment.courseId);

    // Apply search filter if provided
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      enrollments = enrollments.filter(enrollment => {
        const course = enrollment.courseId as any;
        return course.title?.toLowerCase().includes(searchTerm) ||
               course.description?.toLowerCase().includes(searchTerm) ||
               course.category?.toLowerCase().includes(searchTerm);
      });
    }

    // Format response
    const myCourses = enrollments.map(enrollment => {
      const course = enrollment.courseId as any;
      return {
        enrollmentId: enrollment._id,
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
          category: course.category,
          instructor: course.instructor,
          duration: course.duration,
          level: course.level,
          imageUrl: course.imageUrl,
          totalModules: course.totalModules,
          totalLessons: course.totalLessons,
          estimatedDuration: course.estimatedDuration,
          skills: course.skills || []
        },
        enrollment: {
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          progressPercent: enrollment.progressPercent,
          studyTime: enrollment.studyTime,
          lastAccessed: enrollment.lastAccessed,
          completedLessons: enrollment.completedLessons.length,
          progressLabel: (enrollment.status === 'COMPLETED' || enrollment.progressPercent === 100) ? 'Completed' : 
                        enrollment.progressPercent >= 75 ? 'Almost Done' :
                        enrollment.progressPercent >= 50 ? 'Halfway' :
                        enrollment.progressPercent >= 25 ? 'Getting Started' : 'Just Started'
        },
        analytics: enrollment.analytics,
        achievements: enrollment.achievements
      };
    });

    // Calculate summary statistics
    const summary = {
      total: myCourses.length,
      enrolled: myCourses.filter(c => c.enrollment.status === 'ENROLLED').length,
      inProgress: myCourses.filter(c => c.enrollment.status === 'IN_PROGRESS').length,
      completed: myCourses.filter(c => c.enrollment.status === 'COMPLETED').length,
      paused: myCourses.filter(c => c.enrollment.status === 'PAUSED').length,
      averageProgress: myCourses.length > 0 
        ? Math.round(myCourses.reduce((sum, c) => sum + c.enrollment.progressPercent, 0) / myCourses.length)
        : 0,
      totalStudyTime: myCourses.reduce((sum, c) => sum + c.enrollment.studyTime, 0),
      totalPoints: myCourses.reduce((sum, c) => sum + c.analytics.totalPoints, 0),
      categories: [...new Set(myCourses.map(c => c.course.category))].filter(Boolean)
    };

    success(res, {
      courses: myCourses,
      summary
    }, 'My courses retrieved successfully');

  } catch (error) {
    logger.error('Get my courses error:', error);
    serverError(res, 'Failed to retrieve enrolled courses');
  }
};

/**
 * Get detailed course data for enrolled course
 * GET /api/course/my-course/:courseId
 */
export const getEnrolledCourseDetail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;

    if (!userId) {
      return badRequest(res, 'User ID is required');
    }

    // Check if user is enrolled in this course
    const enrollment = await UserCourse.findOne({ userId, courseId })
      .populate({
        path: 'courseId',
        populate: [
          {
            path: 'modules',
            model: 'ProgrammeModule',
            populate: {
              path: 'lessons',
              model: 'ProgrammeLesson'
            }
          }
        ]
      });

    if (!enrollment) {
      return notFound(res, 'Course enrollment not found');
    }

    const course = enrollment.courseId as any;

    // Determine which modules/lessons are unlocked based on progress
    const enhancedModules = course.modules?.map((module: any, moduleIndex: number) => {
      const isUnlocked = moduleIndex === 0 || enrollment.progressPercent >= (moduleIndex * 20); // Unlock based on progress
      
      const enhancedLessons = module.lessons?.map((lesson: any) => ({
        ...lesson.toJSON(),
        isCompleted: enrollment.completedLessons.includes(lesson._id),
        isUnlocked: isUnlocked
      }));

      const completedLessons = enhancedLessons?.filter((l: any) => l.isCompleted).length || 0;
      const totalLessons = enhancedLessons?.length || 1;
      const moduleProgress = Math.round((completedLessons / totalLessons) * 100);

      return {
        ...module.toJSON(),
        lessons: enhancedLessons,
        isUnlocked,
        progress: moduleProgress,
        completedLessons: completedLessons,
        totalLessons: totalLessons
      };
    }) || [];

    // Calculate next lesson
    const nextLesson = enhancedModules
      .flatMap((m: any) => m.lessons)
      .find((l: any) => !l.isCompleted && l.isUnlocked);

    const courseDetails = {
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        instructor: course.instructor,
        duration: course.duration,
        level: course.level,
        imageUrl: course.imageUrl,
        overview: course.overview,
        skills: course.skills || [],
        prerequisites: course.prerequisites || [],
        totalModules: enhancedModules.length,
        totalLessons: enhancedModules.reduce((sum: number, m: any) => sum + m.totalLessons, 0)
      },
      enrollment: {
        id: enrollment._id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        progressPercent: enrollment.progressPercent,
        studyTime: enrollment.studyTime,
        lastAccessed: enrollment.lastAccessed,
        progressLabel: (enrollment.status === 'COMPLETED' || enrollment.progressPercent === 100) ? 'Completed' : 
                      enrollment.progressPercent >= 75 ? 'Almost Done' :
                      enrollment.progressPercent >= 50 ? 'Halfway' :
                      enrollment.progressPercent >= 25 ? 'Getting Started' : 'Just Started'
      },
      modules: enhancedModules,
      nextLesson: nextLesson ? {
        id: nextLesson.id,
        title: nextLesson.title,
        moduleTitle: enhancedModules.find((m: any) => 
          m.lessons.some((l: any) => l.id === nextLesson.id)
        )?.title
      } : null,
      analytics: enrollment.analytics,
      achievements: enrollment.achievements
    };

    success(res, courseDetails, 'Course details retrieved successfully');

  } catch (error) {
    logger.error('Get enrolled course detail error:', error);
    serverError(res, 'Failed to retrieve course details');
  }
};

/**
 * Update course progress
 * POST /api/course/progress
 */
export const updateCourseProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { courseId, lessonId, timeSpent, progressPercent } = req.body;

    if (!userId) {
      return badRequest(res, 'User ID is required');
    }

    const enrollment = await UserCourse.findOne({ userId, courseId });
    if (!enrollment) {
      return notFound(res, 'Course enrollment not found');
    }

    // Update progress
    if (lessonId && !enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    if (timeSpent) {
      enrollment.studyTime += timeSpent;
    }

    if (progressPercent !== undefined) {
      enrollment.progressPercent = Math.min(progressPercent, 100);
    }

    enrollment.lastAccessed = new Date();

    // Update status based on progress
    if (enrollment.progressPercent > 0 && enrollment.progressPercent < 100) {
      enrollment.status = 'IN_PROGRESS';
    } else if (enrollment.progressPercent >= 100) {
      enrollment.status = 'COMPLETED';
      
      // Award completion points
      enrollment.analytics.totalPoints += 500; // Completion bonus
      
      // Update profile stats
      const profile = await StudentProfile.findOne({ userId });
      if (profile) {
        profile.statistics.totalCoursesCompleted += 1;
        profile.gamification.totalPoints += 500;
        await profile.save();
      }
    }

    // Update streak
    enrollment.updateStreak();

    await enrollment.save();

    success(res, {
      progressPercent: enrollment.progressPercent,
      status: enrollment.status,
      studyTime: enrollment.studyTime,
      completedLessons: enrollment.completedLessons.length,
      analytics: enrollment.analytics
    }, 'Progress updated successfully');

  } catch (error) {
    logger.error('Update course progress error:', error);
    serverError(res, 'Failed to update progress');
  }
};
