import { Response } from 'express';
import { AuthenticatedRequest } from '../utils/jwt';
import Enrollment from '../models/Enrollment';
import LessonCompletion from '../models/LessonCompletion';
import StudentProfile from '../models/StudentProfile';
import Programme from '../models/Programme';
import QuizResult from '../models/QuizResult';
import UserCourseProgress from '../models/UserCourseProgress';
import ProgrammeModule from '../models/ProgrammeModule';
import ProgrammeLesson from '../models/ProgrammeLesson';
import { success, serverError, notFound, validationError } from '../utils/response';
import logger from '../config/logger';
import mongoose from 'mongoose';

/**
 * Get comprehensive course progress data for student dashboard courses page
 */
export const getStudentCoursesProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { status, category, search, sortBy = 'lastActivity', sortOrder = 'desc' } = req.query;
    
    if (!studentId) {
      validationError(res, 'Student ID is required');
      return;
    }

    // Build enrollment query
    const enrollmentQuery: any = { studentId };
    if (status && status !== 'all') {
      enrollmentQuery.status = status;
    }

    // Get enrollments with populated course data
    const enrollments = await Enrollment.find(enrollmentQuery)
      .populate({
        path: 'programmeId',
        select: 'title description category level totalModules totalLessons estimatedDuration imageUrl instructor',
        match: category && category !== 'all' ? { category } : {}
      })
      .lean();

    // Filter out enrollments where programme was not found (due to category filter)
    const validEnrollments = enrollments.filter(e => e.programmeId);

    // Get all lesson completions for the student
    const lessonCompletions = await LessonCompletion.find({ userId: studentId }).lean();
    
    // Get quiz results for calculating average scores
    const quizResults = await QuizResult.find({ studentId }).lean();

    // Calculate detailed progress for each course
    const coursesProgress = await Promise.all(
      validEnrollments.map(async (enrollment) => {
        const programme = enrollment.programmeId as any;
        const courseId = programme._id.toString();

        // Get lesson completions for this course
        const courseCompletions = lessonCompletions.filter(lc => 
          lc.courseId && lc.courseId.toString() === courseId
        );

        // Get quiz results for this course
        const courseQuizzes = quizResults.filter(qr => 
          qr.programmeId && qr.programmeId.toString() === courseId
        );

        // Calculate real-time progress metrics
        const progressMetrics = await calculateCourseProgressMetrics(
          enrollment,
          programme,
          courseCompletions,
          courseQuizzes
        );

        // Get module progress
        const moduleProgress = await getModuleProgress(studentId, courseId);

        // Calculate estimated completion time
        const estimatedCompletion = calculateEstimatedCompletion(
          progressMetrics,
          programme.estimatedDuration || 30
        );

        return {
          enrollmentId: enrollment._id,
          courseId,
          course: {
            title: programme.title,
            description: programme.description,
            category: programme.category,
            level: programme.level,
            instructor: programme.instructor,
            thumbnail: programme.imageUrl,
            totalModules: programme.totalModules || 0,
            totalLessons: programme.totalLessons || 0,
            estimatedDuration: programme.estimatedDuration || 0
          },
          enrollment: {
            status: enrollment.status,
            enrollmentDate: enrollment.enrollmentDate,
            lastActivityDate: enrollment.progress?.lastActivityDate
          },
          progress: progressMetrics,
          moduleProgress,
          estimatedCompletion,
          recentActivity: await getRecentCourseActivity(studentId, courseId, 5)
        };
      })
    );

    // Apply search filter
    let filteredCourses = coursesProgress;
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredCourses = coursesProgress.filter(course =>
        course.course.title.toLowerCase().includes(searchTerm) ||
        course.course.description.toLowerCase().includes(searchTerm) ||
        course.course.category.toLowerCase().includes(searchTerm)
      );
    }

    // Sort courses
    filteredCourses.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'progress':
          aValue = a.progress.completionPercentage;
          bValue = b.progress.completionPercentage;
          break;
        case 'title':
          aValue = a.course.title.toLowerCase();
          bValue = b.course.title.toLowerCase();
          break;
        case 'enrollmentDate':
          aValue = new Date(a.enrollment.enrollmentDate).getTime();
          bValue = new Date(b.enrollment.enrollmentDate).getTime();
          break;
        case 'lastActivity':
        default:
          aValue = a.enrollment.lastActivityDate ? new Date(a.enrollment.lastActivityDate).getTime() : 0;
          bValue = b.enrollment.lastActivityDate ? new Date(b.enrollment.lastActivityDate).getTime() : 0;
          break;
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Calculate summary statistics
    const summary = calculateCourseSummary(filteredCourses);

    const response = {
      studentId,
      lastUpdated: new Date(),
      summary,
      courses: filteredCourses,
      totalCourses: filteredCourses.length
    };

    success(res, response, 'Student courses progress retrieved successfully');

  } catch (error) {
    logger.error('Get student courses progress error:', error);
    serverError(res, 'Failed to retrieve student courses progress');
  }
};

/**
 * Calculate detailed progress metrics for a single course
 */
async function calculateCourseProgressMetrics(
  enrollment: any,
  programme: any,
  courseCompletions: any[],
  courseQuizzes: any[]
) {
  const totalLessons = programme.totalLessons || 1;
  const completedLessons = courseCompletions.length;
  
  // Calculate completion percentage based on actual lesson completions
  const actualCompletionPercentage = Math.round((completedLessons / totalLessons) * 100);
  
  // Use the higher of stored progress or calculated progress
  const completionPercentage = Math.max(
    enrollment.progress?.totalProgress || 0,
    actualCompletionPercentage
  );

  // Calculate time metrics
  const totalTimeSpent = enrollment.progress?.timeSpent || 0;
  const averageTimePerLesson = completedLessons > 0 ? totalTimeSpent / completedLessons : 0;

  // Calculate quiz performance
  const averageQuizScore = courseQuizzes.length > 0 
    ? Math.round(courseQuizzes.reduce((sum, quiz) => sum + (quiz.percentage || 0), 0) / courseQuizzes.length)
    : 0;

  // Calculate learning velocity (lessons per week)
  const enrollmentDate = new Date(enrollment.enrollmentDate);
  const now = new Date();
  const weeksElapsed = Math.max(1, Math.floor((now.getTime() - enrollmentDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  const learningVelocity = Math.round((completedLessons / weeksElapsed) * 10) / 10;

  // Calculate momentum (recent activity)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentCompletions = courseCompletions.filter(lc => 
    new Date(lc.completedAt) >= sevenDaysAgo
  );
  const momentum = recentCompletions.length;

  return {
    completionPercentage: Math.min(completionPercentage, 100),
    completedLessons,
    totalLessons,
    totalTimeSpent,
    averageTimePerLesson: Math.round(averageTimePerLesson),
    averageQuizScore,
    learningVelocity,
    momentum,
    lastActivityDate: enrollment.progress?.lastActivityDate,
    isOnTrack: calculateOnTrackStatus(completionPercentage, enrollmentDate, programme.estimatedDuration || 30)
  };
}

/**
 * Get module progress for a course
 */
async function getModuleProgress(studentId: string, courseId: string) {
  try {
    const modules = await ProgrammeModule.find({ programmeId: courseId })
      .sort({ orderIndex: 1 })
      .lean();

    const moduleProgressPromises = modules.map(async (module) => {
      // Get lessons for this module
      const lessons = await ProgrammeLesson.find({ moduleId: module._id }).lean();
      
      // Get completion data for these lessons
      const lessonCompletions = await LessonCompletion.find({
        userId: studentId,
        lessonId: { $in: lessons.map(l => l._id) }
      }).lean();

      const totalLessons = lessons.length;
      const completedLessons = lessonCompletions.length;
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        moduleId: module._id,
        title: module.title,
        description: module.description,
        orderIndex: module.orderIndex,
        totalLessons,
        completedLessons,
        progressPercentage,
        status: progressPercentage === 100 ? 'COMPLETED' : 
                progressPercentage > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'
      };
    });

    return await Promise.all(moduleProgressPromises);
  } catch (error) {
    logger.error('Error getting module progress:', error);
    return [];
  }
}

/**
 * Calculate if student is on track
 */
function calculateOnTrackStatus(completionPercentage: number, enrollmentDate: Date, estimatedDurationDays: number): boolean {
  const now = new Date();
  const daysElapsed = Math.floor((now.getTime() - enrollmentDate.getTime()) / (24 * 60 * 60 * 1000));
  const expectedProgress = Math.min(100, (daysElapsed / estimatedDurationDays) * 100);
  
  // Consider on track if within 10% of expected progress
  return Math.abs(completionPercentage - expectedProgress) <= 10;
}

/**
 * Calculate estimated completion time
 */
function calculateEstimatedCompletion(progressMetrics: any, estimatedDurationDays: number) {
  const { completionPercentage, learningVelocity } = progressMetrics;
  
  if (completionPercentage >= 100) {
    return {
      isCompleted: true,
      daysRemaining: 0,
      estimatedCompletionDate: null
    };
  }

  const remainingPercentage = 100 - completionPercentage;
  
  // Estimate based on current velocity
  let estimatedWeeksRemaining = 0;
  if (learningVelocity > 0) {
    // Assuming average course has lessons that represent 1% each
    const remainingLessons = remainingPercentage; // Rough estimation
    estimatedWeeksRemaining = remainingLessons / learningVelocity;
  } else {
    // Fallback to original estimate
    estimatedWeeksRemaining = (remainingPercentage / 100) * (estimatedDurationDays / 7);
  }

  const daysRemaining = Math.ceil(estimatedWeeksRemaining * 7);
  const estimatedCompletionDate = new Date();
  estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + daysRemaining);

  return {
    isCompleted: false,
    daysRemaining,
    estimatedCompletionDate
  };
}

/**
 * Get recent activity for a course
 */
async function getRecentCourseActivity(studentId: string, courseId: string, limit: number = 5) {
  try {
    const [lessonCompletions, quizResults] = await Promise.all([
      LessonCompletion.find({
        userId: studentId,
        courseId
      })
        .sort({ completedAt: -1 })
        .limit(limit)
        .populate('lessonId', 'title')
        .lean(),
      
      QuizResult.find({
        studentId,
        programmeId: courseId
      })
        .sort({ completedAt: -1 })
        .limit(limit)
        .populate('lessonId', 'title')
        .lean()
    ]);

    const activities = [
      ...lessonCompletions.map(lc => ({
        type: 'lesson_completion',
        title: `Completed: ${(lc.lessonId as any)?.title || 'Unknown Lesson'}`,
        date: lc.completedAt,
        timeSpent: lc.timeSpent,
        points: 10 // Standard points for lesson completion
      })),
      ...quizResults.map(qr => ({
        type: 'quiz_completion',
        title: `Quiz: ${(qr.lessonId as any)?.title || 'Unknown Lesson'}`,
        date: qr.completedAt,
        score: qr.percentage,
        points: Math.round(qr.percentage / 10)
      }))
    ];

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  } catch (error) {
    logger.error('Error getting recent course activity:', error);
    return [];
  }
}

/**
 * Calculate summary statistics for all courses
 */
function calculateCourseSummary(courses: any[]) {
  const totalCourses = courses.length;
  const activeCourses = courses.filter(c => c.enrollment.status === 'ACTIVE').length;
  const completedCourses = courses.filter(c => c.enrollment.status === 'COMPLETED').length;
  const pausedCourses = courses.filter(c => c.enrollment.status === 'PAUSED').length;

  const totalProgress = courses.reduce((sum, c) => sum + c.progress.completionPercentage, 0);
  const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;

  const totalTimeSpent = courses.reduce((sum, c) => sum + c.progress.totalTimeSpent, 0);
  const totalHoursSpent = Math.round(totalTimeSpent / 60);

  const onTrackCourses = courses.filter(c => c.progress.isOnTrack).length;
  const coursesWithMomentum = courses.filter(c => c.progress.momentum > 0).length;

  const averageQuizScore = courses.length > 0 
    ? Math.round(courses.reduce((sum, c) => sum + c.progress.averageQuizScore, 0) / courses.length)
    : 0;

  return {
    totalCourses,
    activeCourses,
    completedCourses,
    pausedCourses,
    averageProgress,
    totalHoursSpent,
    onTrackCourses,
    coursesWithMomentum,
    averageQuizScore,
    completionRate: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0
  };
}

/**
 * Update course progress in real-time
 */
export const updateCourseProgressRealtime = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { courseId, lessonId, moduleId, timeSpent = 0, completed = false } = req.body;

    if (!studentId || !courseId || !lessonId) {
      validationError(res, 'Missing required parameters');
      return;
    }

    // Update lesson completion if completed
    if (completed) {
      const existingCompletion = await LessonCompletion.findOne({
        userId: studentId,
        lessonId
      });

      if (!existingCompletion) {
        const lessonCompletion = new LessonCompletion({
          userId: studentId,
          courseId,
          moduleId: moduleId || new mongoose.Types.ObjectId(),
          lessonId,
          completedAt: new Date(),
          timeSpent
        });
        await lessonCompletion.save();
      }
    }

    // Update enrollment progress
    const enrollment = await Enrollment.findOne({
      studentId,
      programmeId: courseId
    });

    if (enrollment) {
      if (completed && !enrollment.progress.completedLessons.includes(lessonId)) {
        enrollment.progress.completedLessons.push(lessonId);
      }

      enrollment.progress.timeSpent += timeSpent;
      enrollment.progress.lastActivityDate = new Date();

      // Recalculate progress
      const programme = await Programme.findById(courseId);
      if (programme && programme.totalLessons) {
        const completedCount = enrollment.progress.completedLessons.length;
        enrollment.progress.totalProgress = Math.round((completedCount / programme.totalLessons) * 100);
      }

      await enrollment.save();
    }

    // Return updated progress data
    const updatedProgress = await getUpdatedCourseProgress(studentId, courseId);

    success(res, updatedProgress, 'Course progress updated successfully');

  } catch (error) {
    logger.error('Update course progress error:', error);
    serverError(res, 'Failed to update course progress');
  }
};

/**
 * Get updated progress for a specific course
 */
async function getUpdatedCourseProgress(studentId: string, courseId: string) {
  const enrollment = await Enrollment.findOne({
    studentId,
    programmeId: courseId
  }).populate('programmeId').lean();

  if (!enrollment) {
    return null;
  }

  const lessonCompletions = await LessonCompletion.find({
    userId: studentId,
    courseId
  }).lean();

  const quizResults = await QuizResult.find({
    studentId,
    programmeId: courseId
  }).lean();

  const programme = enrollment.programmeId as any;
  const progressMetrics = await calculateCourseProgressMetrics(
    enrollment,
    programme,
    lessonCompletions,
    quizResults
  );

  return {
    courseId,
    progress: progressMetrics,
    lastUpdated: new Date()
  };
}

/**
 * Get course analytics for detailed insights
 */
export const getCourseAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { courseId } = req.params;

    if (!studentId || !courseId) {
      validationError(res, 'Student ID and Course ID are required');
      return;
    }

    // Get course analytics data
    const analytics = await calculateCourseAnalytics(studentId, courseId);

    success(res, analytics, 'Course analytics retrieved successfully');

  } catch (error) {
    logger.error('Get course analytics error:', error);
    serverError(res, 'Failed to retrieve course analytics');
  }
};

/**
 * Calculate detailed course analytics
 */
async function calculateCourseAnalytics(studentId: string, courseId: string) {
  const [enrollment, programme, lessonCompletions, quizResults] = await Promise.all([
    Enrollment.findOne({ studentId, programmeId: courseId }).lean(),
    Programme.findById(courseId).lean(),
    LessonCompletion.find({ userId: studentId, courseId }).lean(),
    QuizResult.find({ studentId, programmeId: courseId }).lean()
  ]);

  if (!enrollment || !programme) {
    throw new Error('Course or enrollment not found');
  }

  // Calculate daily activity over last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyActivity = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));

    const dayCompletions = lessonCompletions.filter(lc => {
      const completionDate = new Date(lc.completedAt);
      return completionDate >= dayStart && completionDate <= dayEnd;
    });

    const dayQuizzes = quizResults.filter(qr => {
      const completionDate = new Date(qr.completedAt);
      return completionDate >= dayStart && completionDate <= dayEnd;
    });

    dailyActivity.push({
      date: dayStart.toISOString().split('T')[0],
      lessonsCompleted: dayCompletions.length,
      quizzesTaken: dayQuizzes.length,
      timeSpent: dayCompletions.reduce((sum, lc) => sum + (lc.timeSpent || 0), 0)
    });
  }

  // Calculate module-wise time distribution
  const moduleProgress = await getModuleProgress(studentId, courseId);
  
  return {
    courseId,
    courseName: programme.title,
    dailyActivity,
    moduleProgress,
    totalStats: {
      totalLessons: programme.totalLessons || 0,
      completedLessons: lessonCompletions.length,
      totalQuizzes: quizResults.length,
      averageQuizScore: quizResults.length > 0 
        ? Math.round(quizResults.reduce((sum, qr) => sum + qr.percentage, 0) / quizResults.length)
        : 0,
      totalTimeSpent: enrollment.progress?.timeSpent || 0,
      enrollmentDate: enrollment.enrollmentDate,
      lastActivity: enrollment.progress?.lastActivityDate
    }
  };
}
