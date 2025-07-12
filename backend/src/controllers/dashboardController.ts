import { Response } from 'express';
import { AuthenticatedRequest } from '../utils/jwt';
import Enrollment from '../models/Enrollment';
import LessonCompletion from '../models/LessonCompletion';
import StudentProfile from '../models/StudentProfile';
import Programme from '../models/Programme';
import QuizResult from '../models/QuizResult';
import UserCourseProgress from '../models/UserCourseProgress';
import { success, serverError, notFound } from '../utils/response';
import logger from '../config/logger';

/**
 * Get real-time synchronized dashboard data
 */
export const getRealTimeDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      notFound(res, 'Student not found');
      return;
    }

    // Get all enrollments with populated course data
    const enrollments = await Enrollment.find({ studentId })
      .populate({
        path: 'programmeId',
        select: 'title description category level totalModules totalLessons estimatedDuration imageUrl'
      })
      .lean();

    // Get all lesson completions for the student
    const lessonCompletions = await LessonCompletion.find({ userId: studentId })
      .sort({ completedAt: -1 })
      .lean();

    // Get quiz results
    const quizResults = await QuizResult.find({ studentId })
      .sort({ completedAt: -1 })
      .lean();

    // Get student profile
    let studentProfile = await StudentProfile.findOne({ userId: studentId });
    if (!studentProfile) {
      // Create a basic profile if it doesn't exist
      studentProfile = new StudentProfile({
        userId: studentId,
        statistics: {
          joinDate: new Date(),
          lastActiveDate: new Date()
        }
      });
      await studentProfile.save();
    }

    // Calculate real-time metrics
    const dashboardData = await calculateDashboardMetrics(
      studentId,
      enrollments,
      lessonCompletions,
      quizResults,
      studentProfile
    );

    // Get weekly learning activity
    const weeklyActivity = await calculateWeeklyLearningActivity(studentId, lessonCompletions);

    // Get learning summary
    const learningSummary = await calculateLearningSummary(
      enrollments,
      lessonCompletions,
      quizResults,
      studentProfile
    );

    // Get course progress data
    const courseProgress = await calculateCourseProgress(enrollments, lessonCompletions);

    const response = {
      studentId,
      lastUpdated: new Date(),
      dashboard: dashboardData,
      weeklyLearningActivity: weeklyActivity,
      learningSummary: learningSummary,
      courseProgress: courseProgress,
      notifications: await getStudentNotifications(studentId)
    };

    success(res, response, 'Real-time dashboard data retrieved successfully');

  } catch (error) {
    logger.error('Get real-time dashboard error:', error);
    serverError(res, 'Failed to retrieve real-time dashboard data');
  }
};

/**
 * Calculate comprehensive dashboard metrics
 */
async function calculateDashboardMetrics(
  studentId: string,
  enrollments: any[],
  lessonCompletions: any[],
  quizResults: any[],
  studentProfile: any
) {
  const now = new Date();
  
  // Basic enrollment stats
  const totalEnrollments = enrollments.length;
  const activeEnrollments = enrollments.filter(e => e.status === 'ACTIVE').length;
  const completedEnrollments = enrollments.filter(e => e.status === 'COMPLETED').length;
  const pausedEnrollments = enrollments.filter(e => e.status === 'PAUSED').length;

  // Calculate overall progress
  const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress?.totalProgress || 0), 0);
  const averageProgress = totalEnrollments > 0 ? Math.round(totalProgress / totalEnrollments) : 0;

  // Calculate total time spent (in minutes)
  const totalTimeSpent = enrollments.reduce((sum, e) => sum + (e.progress?.timeSpent || 0), 0);
  const totalHoursLearned = Math.round(totalTimeSpent / 60);

  // Calculate learning streak
  const learningStreak = calculateLearningStreak(lessonCompletions);

  // Calculate total points
  const totalPoints = calculateTotalPoints(lessonCompletions, quizResults, studentProfile);

  // Calculate level based on points
  const level = calculateLevel(totalPoints);

  // Get recent lesson completions (last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentLessonCompletions = lessonCompletions.filter(
    lc => new Date(lc.completedAt) >= sevenDaysAgo
  );

  // Get active learning paths (courses with progress > 0 and < 100)
  const activeLearningPaths = enrollments
    .filter(e => e.status === 'ACTIVE' && e.progress?.totalProgress > 0 && e.progress?.totalProgress < 100)
    .map(e => ({
      courseId: e.programmeId._id,
      title: e.programmeId.title,
      progress: e.progress?.totalProgress || 0,
      lastAccessed: e.progress?.lastActivityDate || e.enrollmentDate,
      thumbnail: e.programmeId.imageUrl
    }))
    .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
    .slice(0, 6);

  return {
    totalEnrollments,
    activeEnrollments,
    completedEnrollments,
    pausedEnrollments,
    averageProgress,
    totalHoursLearned,
    totalTimeSpent,
    learningStreak: learningStreak.currentStreak,
    longestStreak: learningStreak.longestStreak,
    totalPoints,
    level,
    recentActivity: recentLessonCompletions.length,
    activeLearningPaths
  };
}

/**
 * Calculate weekly learning activity
 */
async function calculateWeeklyLearningActivity(studentId: string, lessonCompletions: any[]) {
  const now = new Date();
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayCompletions = lessonCompletions.filter(lc => {
      const completionDate = new Date(lc.completedAt);
      return completionDate >= dayStart && completionDate <= dayEnd;
    });

    const timeSpent = dayCompletions.reduce((sum, lc) => sum + (lc.timeSpent || 0), 0);
    const hours = Math.round(timeSpent / 60 * 10) / 10; // Round to 1 decimal place

    weeklyData.push({
      day: weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1], // Adjust for Monday start
      date: date.toISOString().split('T')[0],
      hours: hours,
      lessonsCompleted: dayCompletions.length
    });
  }

  const totalWeeklyHours = weeklyData.reduce((sum, day) => sum + day.hours, 0);
  const totalWeeklyLessons = weeklyData.reduce((sum, day) => sum + day.lessonsCompleted, 0);

  return {
    weeklyData,
    totalHours: Math.round(totalWeeklyHours * 10) / 10,
    totalLessons: totalWeeklyLessons,
    averageHoursPerDay: Math.round((totalWeeklyHours / 7) * 10) / 10
  };
}

/**
 * Calculate learning summary
 */
async function calculateLearningSummary(
  enrollments: any[],
  lessonCompletions: any[],
  quizResults: any[],
  studentProfile: any
) {
  const totalEnrollments = enrollments.length;
  const completedCourses = enrollments.filter(e => e.status === 'COMPLETED').length;
  
  // Calculate average progress across all courses
  const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress?.totalProgress || 0), 0);
  const averageProgress = totalEnrollments > 0 ? Math.round(totalProgress / totalEnrollments) : 0;

  // Calculate learning streak
  const streak = calculateLearningStreak(lessonCompletions);

  // Calculate total points
  const totalPoints = calculateTotalPoints(lessonCompletions, quizResults, studentProfile);

  return {
    enrolledCourses: totalEnrollments,
    completedCourses,
    averageProgress,
    learningStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    totalPoints
  };
}

/**
 * Calculate individual course progress
 */
async function calculateCourseProgress(enrollments: any[], lessonCompletions: any[]) {
  return enrollments.map(enrollment => {
    const course = enrollment.programmeId;
    const courseId = course._id.toString();
    
    // Get lesson completions for this course
    const courseCompletions = lessonCompletions.filter(lc => 
      lc.courseId && lc.courseId.toString() === courseId
    );

    // Calculate progress based on actual lesson completions vs total lessons
    const totalLessons = course.totalLessons || 1;
    const completedLessons = courseCompletions.length;
    const actualProgress = Math.round((completedLessons / totalLessons) * 100);

    // Use the higher of stored progress or calculated progress
    const progress = Math.max(enrollment.progress?.totalProgress || 0, actualProgress);

    return {
      courseId,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      thumbnail: course.imageUrl,
      progress: Math.min(progress, 100), // Cap at 100%
      completedLessons,
      totalLessons,
      totalModules: course.totalModules || 0,
      timeSpent: enrollment.progress?.timeSpent || 0,
      lastAccessed: enrollment.progress?.lastActivityDate || enrollment.enrollmentDate,
      status: enrollment.status,
      enrollmentDate: enrollment.enrollmentDate
    };
  });
}

/**
 * Calculate learning streak
 */
function calculateLearningStreak(lessonCompletions: any[]) {
  if (lessonCompletions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get unique completion dates
  const completionDates = [...new Set(
    lessonCompletions.map(lc => {
      const date = new Date(lc.completedAt);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  )].sort((a, b) => b - a); // Sort descending (newest first)

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < completionDates.length; i++) {
    const completionDate = new Date(completionDates[i]);
    
    if (i === 0) {
      // First date - check if it's today or yesterday
      const daysDiff = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 1) {
        tempStreak = 1;
      } else {
        break; // Streak is broken
      }
    } else {
      // Check if this date is consecutive with the previous
      const prevDate = new Date(completionDates[i - 1]);
      const daysDiff = Math.floor((prevDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }

  // The current streak is the temp streak if it continues to today/yesterday
  if (completionDates.length > 0) {
    const latestDate = new Date(completionDates[0]);
    const daysDiff = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 1) {
      currentStreak = tempStreak;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}

/**
 * Calculate total points
 */
function calculateTotalPoints(lessonCompletions: any[], quizResults: any[], studentProfile: any) {
  let totalPoints = 0;

  // Points from lesson completions (10 points per lesson)
  totalPoints += lessonCompletions.length * 10;

  // Points from quiz results (based on score)
  totalPoints += quizResults.reduce((sum, quiz) => {
    const percentage = (quiz.score / quiz.maxScore) * 100;
    return sum + Math.round(percentage / 10); // 1 point per 10% score
  }, 0);

  // Points from profile gamification
  if (studentProfile?.gamification?.totalPoints) {
    totalPoints += studentProfile.gamification.totalPoints;
  }

  return totalPoints;
}

/**
 * Calculate level based on points
 */
function calculateLevel(points: number) {
  // Simple level calculation: 100 points per level
  return Math.floor(points / 100) + 1;
}

/**
 * Get student notifications
 */
async function getStudentNotifications(studentId: string) {
  // This would typically fetch from a notifications table
  // For now, return empty array
  return [];
}

/**
 * Update course progress in real-time
 */
export const updateCourseProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { courseId, lessonId, moduleId, timeSpent = 0, completed = false } = req.body;

    if (!studentId || !courseId || !lessonId) {
      serverError(res, 'Missing required parameters');
      return;
    }

    // Find the enrollment
    const enrollment = await Enrollment.findOne({
      studentId,
      programmeId: courseId
    });

    if (!enrollment) {
      notFound(res, 'Enrollment not found');
      return;
    }

    // Update lesson completion if completed
    if (completed) {
      // Check if lesson completion already exists
      const existingCompletion = await LessonCompletion.findOne({
        userId: studentId,
        lessonId
      });

      if (!existingCompletion) {
        // Create new lesson completion
        const lessonCompletion = new LessonCompletion({
          userId: studentId,
          courseId,
          moduleId,
          lessonId,
          completedAt: new Date(),
          timeSpent
        });
        await lessonCompletion.save();

        // Update enrollment progress
        if (!enrollment.progress.completedLessons.includes(lessonId)) {
          enrollment.progress.completedLessons.push(lessonId);
        }
      }
    }

    // Update time spent
    enrollment.progress.timeSpent += timeSpent;
    enrollment.progress.lastActivityDate = new Date();

    // Recalculate total progress
    const programme = await Programme.findById(courseId);
    if (programme && programme.totalLessons) {
      const completedLessons = enrollment.progress.completedLessons.length;
      enrollment.progress.totalProgress = Math.round((completedLessons / programme.totalLessons) * 100);
    }

    await enrollment.save();

    // Update student profile
    const studentProfile = await StudentProfile.findOne({ userId: studentId });
    if (studentProfile) {
      studentProfile.statistics.totalLearningHours += timeSpent / 60;
      studentProfile.statistics.lastActiveDate = new Date();
      if (completed) {
        studentProfile.gamification.totalPoints += 10; // 10 points per lesson
      }
      await studentProfile.save();
    }

    success(res, {
      courseProgress: enrollment.progress.totalProgress,
      totalTimeSpent: enrollment.progress.timeSpent,
      completedLessons: enrollment.progress.completedLessons.length
    }, 'Course progress updated successfully');

  } catch (error) {
    logger.error('Update course progress error:', error);
    serverError(res, 'Failed to update course progress');
  }
};

/**
 * Get real-time learning statistics
 */
export const getLearningStatistics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { days = 30 } = req.query;

    if (!studentId) {
      notFound(res, 'Student not found');
      return;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get recent lesson completions
    const lessonCompletions = await LessonCompletion.find({
      userId: studentId,
      completedAt: { $gte: startDate }
    }).sort({ completedAt: -1 });

    // Get recent quiz results
    const quizResults = await QuizResult.find({
      studentId,
      completedAt: { $gte: startDate }
    }).sort({ completedAt: -1 });

    // Calculate daily statistics
    const dailyStats = [];
    for (let i = Number(days) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayCompletions = lessonCompletions.filter(lc => {
        const completionDate = new Date(lc.completedAt);
        return completionDate >= date && completionDate < nextDate;
      });

      const dayQuizzes = quizResults.filter(qr => {
        const completionDate = new Date(qr.completedAt);
        return completionDate >= date && completionDate < nextDate;
      });

      const timeSpent = dayCompletions.reduce((sum, lc) => sum + (lc.timeSpent || 0), 0);
      const pointsEarned = dayCompletions.length * 10 + dayQuizzes.reduce((sum, qr) => {
        const percentage = (qr.score / qr.maxScore) * 100;
        return sum + Math.round(percentage / 10);
      }, 0);

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        lessonsCompleted: dayCompletions.length,
        quizzesTaken: dayQuizzes.length,
        timeSpent: Math.round(timeSpent),
        pointsEarned
      });
    }

    success(res, {
      period: `${days} days`,
      dailyStatistics: dailyStats,
      totals: {
        lessonsCompleted: lessonCompletions.length,
        quizzesTaken: quizResults.length,
        totalTimeSpent: lessonCompletions.reduce((sum, lc) => sum + (lc.timeSpent || 0), 0),
        totalPointsEarned: lessonCompletions.length * 10 + quizResults.reduce((sum, qr) => {
          const percentage = (qr.score / qr.maxScore) * 100;
          return sum + Math.round(percentage / 10);
        }, 0)
      }
    }, 'Learning statistics retrieved successfully');

  } catch (error) {
    logger.error('Get learning statistics error:', error);
    serverError(res, 'Failed to retrieve learning statistics');
  }
};
