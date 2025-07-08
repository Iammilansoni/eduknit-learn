import type { Request, Response } from 'express';
import UserCourse from '../models/UserCourse';
import StudentProfile from '../models/StudentProfile';
import Enrollment from '../models/Enrollment';
import { success, serverError, validationError } from '../utils/response';
import { AuthenticatedRequest } from '../utils/jwt';
import logger from '../config/logger';

/**
 * Get analytics overview for student
 * GET /api/analytics/overview
 */
export const getAnalyticsOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return validationError(res, 'User ID is required');
    }

    // Get user courses statistics
    const userCoursesStats = await UserCourse.getUserStats(userId);
    const courseStats = userCoursesStats[0] || {
      totalEnrolled: 0,
      completed: 0,
      inProgress: 0,
      averageProgress: 0,
      totalStudyTime: 0,
      totalPoints: 0,
      totalAchievements: 0
    };

    // Get student profile for additional analytics
    const profile = await StudentProfile.findOne({ userId });
    
    // Calculate expected vs actual progress
    const enrollments = await UserCourse.find({ userId });
    let totalActualProgress = 0;
    let totalExpectedProgress = 0;
    let deviationLabel = 'On Track';

    if (enrollments.length > 0) {
      totalActualProgress = enrollments.reduce((sum, enrollment) => sum + enrollment.progressPercent, 0) / enrollments.length;
      
      // Calculate expected progress based on enrollment duration
      const avgDaysEnrolled = enrollments.reduce((sum, enrollment) => {
        const daysEnrolled = Math.floor((Date.now() - enrollment.enrolledAt.getTime()) / (1000 * 60 * 60 * 24));
        return sum + daysEnrolled;
      }, 0) / enrollments.length;
      
      // Assume courses should be completed in 60 days on average
      const expectedCourseCompletionDays = 60;
      totalExpectedProgress = Math.min((avgDaysEnrolled / expectedCourseCompletionDays) * 100, 100);
      
      const deviation = totalActualProgress - totalExpectedProgress;
      
      if (deviation > 10) {
        deviationLabel = '🚀 Ahead';
      } else if (deviation < -10) {
        deviationLabel = '⚠️ Behind';
      } else {
        deviationLabel = '✅ On Track';
      }
    }

    // Calculate learning streaks
    const currentStreak = enrollments.reduce((maxStreak, enrollment) => {
      return Math.max(maxStreak, enrollment.analytics.streakDays);
    }, 0);

    // Get recent activity
    const recentActivity = await UserCourse.find({ userId })
      .sort({ lastAccessed: -1 })
      .limit(5)
      .populate('courseId', 'title category');

    const overview = {
      totalCourses: courseStats.totalEnrolled,
      completedCourses: courseStats.completed,
      inProgressCourses: courseStats.inProgress,
      averageProgress: Math.round(courseStats.averageProgress || 0),
      totalStudyTime: Math.round(courseStats.totalStudyTime || 0), // in minutes
      totalPoints: courseStats.totalPoints || 0,
      totalAchievements: courseStats.totalAchievements || 0,
      currentStreak: currentStreak,
      longestStreak: profile?.gamification?.streaks?.longestLearningStreak || 0,
      level: profile?.gamification?.level || 1,
      progressAnalysis: {
        actualProgress: Math.round(totalActualProgress),
        expectedProgress: Math.round(totalExpectedProgress),
        deviation: Math.round(totalActualProgress - totalExpectedProgress),
        label: deviationLabel
      },
      recentActivity: recentActivity.map(activity => ({
        courseTitle: (activity.courseId as any)?.title || 'Unknown Course',
        lastAccessed: activity.lastAccessed,
        progress: activity.progressPercent,
        status: activity.status
      }))
    };

    success(res, overview, 'Analytics overview retrieved successfully');

  } catch (error) {
    logger.error('Get analytics overview error:', error);
    serverError(res, 'Failed to retrieve analytics overview');
  }
};

/**
 * Get progress history for charts
 * GET /api/analytics/progress-history
 */
export const getProgressHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { days = 30 } = req.query;

    if (!userId) {
      return validationError(res, 'User ID is required');
    }

    const daysBack = parseInt(days as string, 10);
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    // Get enrollments and their progress over time
    const enrollments = await UserCourse.find({ 
      userId,
      enrolledAt: { $gte: startDate }
    }).populate('courseId', 'title category');

    // Generate daily progress data
    const progressHistory = [];
    for (let i = daysBack; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Calculate cumulative progress for this date
      let totalProgress = 0;
      let courseCount = 0;
      
      enrollments.forEach(enrollment => {
        if (enrollment.enrolledAt <= date) {
          // For simplicity, assume linear progress over time
          const daysInCourse = Math.floor((date.getTime() - enrollment.enrolledAt.getTime()) / (1000 * 60 * 60 * 24));
          const estimatedProgress = Math.min(daysInCourse * 2, enrollment.progressPercent); // 2% per day estimate
          totalProgress += estimatedProgress;
          courseCount++;
        }
      });

      progressHistory.push({
        date: dateStr,
        averageProgress: courseCount > 0 ? Math.round(totalProgress / courseCount) : 0,
        totalCourses: courseCount,
        studyTime: Math.floor(Math.random() * 120) + 30 // Mock data for now
      });
    }

    success(res, {
      progressHistory,
      summary: {
        totalDays: daysBack,
        averageProgressIncrease: progressHistory.length > 1 ? 
          progressHistory[progressHistory.length - 1].averageProgress - progressHistory[0].averageProgress : 0,
        totalStudyTime: progressHistory.reduce((sum, day) => sum + day.studyTime, 0)
      }
    }, 'Progress history retrieved successfully');

  } catch (error) {
    logger.error('Get progress history error:', error);
    serverError(res, 'Failed to retrieve progress history');
  }
};

/**
 * Get category performance analytics
 * GET /api/analytics/category-performance
 */
export const getCategoryPerformance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return validationError(res, 'User ID is required');
    }

    // Aggregate course performance by category
    const categoryStats = await UserCourse.aggregate([
      { $match: { userId: userId } },
      {
        $lookup: {
          from: 'programmes',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$course.category',
          totalCourses: { $sum: 1 },
          completedCourses: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
          },
          averageProgress: { $avg: '$progressPercent' },
          totalStudyTime: { $sum: '$studyTime' },
          totalPoints: { $sum: '$analytics.totalPoints' }
        }
      },
      { $sort: { totalCourses: -1 } }
    ]);

    // Format the data for charts
    const categories = categoryStats.map(stat => ({
      category: stat._id,
      totalCourses: stat.totalCourses,
      completedCourses: stat.completedCourses,
      completionRate: Math.round((stat.completedCourses / stat.totalCourses) * 100),
      averageProgress: Math.round(stat.averageProgress),
      totalStudyTime: Math.round(stat.totalStudyTime),
      totalPoints: stat.totalPoints,
      performance: stat.averageProgress >= 75 ? 'Excellent' :
                  stat.averageProgress >= 50 ? 'Good' :
                  stat.averageProgress >= 25 ? 'Fair' : 'Needs Improvement'
    }));

    // Overall category insights
    const insights = {
      strongestCategory: categories.length > 0 ? 
        categories.reduce((best, current) => 
          current.averageProgress > best.averageProgress ? current : best
        ) : null,
      mostActiveCategory: categories.length > 0 ? 
        categories.reduce((most, current) => 
          current.totalCourses > most.totalCourses ? current : most
        ) : null,
      totalCategories: categories.length,
      overallCompletionRate: categories.length > 0 ? 
        Math.round(categories.reduce((sum, cat) => sum + cat.completionRate, 0) / categories.length) : 0
    };

    success(res, {
      categories,
      insights
    }, 'Category performance retrieved successfully');

  } catch (error) {
    logger.error('Get category performance error:', error);
    serverError(res, 'Failed to retrieve category performance');
  }
};

/**
 * Get streaks and achievements
 * GET /api/analytics/streaks
 */
export const getStreaksAndAchievements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return validationError(res, 'User ID is required');
    }

    // Get current streaks from user courses
    const userCourses = await UserCourse.find({ userId });
    const profile = await StudentProfile.findOne({ userId });

    // Calculate overall learning streak
    const currentDate = new Date();
    let overallStreak = 0;
    
    // Check if user accessed any course today or yesterday for streak calculation
    const recentAccess = userCourses.filter(course => {
      const daysSinceAccess = Math.floor((currentDate.getTime() - course.lastAccessed.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceAccess <= 1;
    });

    if (recentAccess.length > 0) {
      overallStreak = Math.max(...userCourses.map(course => course.analytics.streakDays));
    }

    // Get all achievements from all courses
    const allAchievements = userCourses.flatMap(course => 
      course.achievements.map(achievement => ({
        ...achievement,
        courseTitle: course.courseId // This would need to be populated
      }))
    );

    // Sort achievements by date
    allAchievements.sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());

    // Calculate streak statistics
    const streakStats = {
      currentLearningStreak: overallStreak,
      longestLearningStreak: profile?.gamification?.streaks?.longestLearningStreak || 0,
      currentLoginStreak: profile?.gamification?.streaks?.currentLoginStreak || 0,
      longestLoginStreak: profile?.gamification?.streaks?.longestLoginStreak || 0,
      totalActiveDays: userCourses.reduce((sum, course) => sum + course.analytics.streakDays, 0),
      streakFreeze: false, // Could implement streak freeze feature
      nextMilestone: overallStreak < 7 ? 7 : overallStreak < 30 ? 30 : overallStreak < 100 ? 100 : overallStreak + 50
    };

    // Generate achievement milestones
    const milestones = [
      { id: 'first_course', name: 'First Steps', description: 'Enroll in your first course', completed: userCourses.length > 0 },
      { id: 'week_streak', name: 'Week Warrior', description: 'Maintain a 7-day learning streak', completed: overallStreak >= 7 },
      { id: 'course_complete', name: 'Finisher', description: 'Complete your first course', completed: userCourses.some(c => c.status === 'COMPLETED') },
      { id: 'multi_category', name: 'Explorer', description: 'Take courses in 3 different categories', completed: new Set(userCourses.map(c => c.courseId)).size >= 3 },
      { id: 'month_streak', name: 'Dedicated Learner', description: 'Maintain a 30-day learning streak', completed: overallStreak >= 30 },
      { id: 'point_master', name: 'Point Master', description: 'Earn 1000 points', completed: (profile?.gamification?.totalPoints || 0) >= 1000 }
    ];

    success(res, {
      streaks: streakStats,
      achievements: allAchievements.slice(0, 10), // Recent 10 achievements
      milestones,
      badges: profile?.gamification?.badges || [],
      totalPoints: profile?.gamification?.totalPoints || 0,
      level: profile?.gamification?.level || 1
    }, 'Streaks and achievements retrieved successfully');

  } catch (error) {
    logger.error('Get streaks and achievements error:', error);
    serverError(res, 'Failed to retrieve streaks and achievements');
  }
};
