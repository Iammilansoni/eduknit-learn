import type { Request, Response } from 'express';
import UserCourse from '../models/UserCourse';
import StudentProfile from '../models/StudentProfile';
import Enrollment from '../models/Enrollment';
import { success, serverError, validationError } from '../utils/response';
import { AuthenticatedRequest } from '../utils/jwt';
import logger from '../config/logger';
import LessonCompletion from '../models/LessonCompletion';
import QuizResult from '../models/QuizResult';

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

// Get comprehensive analytics data for student dashboard
export const getStudentAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get user's enrolled courses
    const enrollments = await Enrollment.find({ userId }).populate('courseId');
    
    // Get completed lessons
    const completedLessons = await LessonCompletion.find({ userId });
    
    // Get quiz results
    const quizResults = await QuizResult.find({ userId });
    
    // Calculate analytics
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.progress.totalProgress >= 100).length;
    const totalLessons = enrollments.reduce((sum, e) => sum + (e.programmeId as any).lessons?.length || 0, 0);
    const completedLessonsCount = completedLessons.length;
    const totalQuizzes = quizResults.length;
    const passedQuizzes = quizResults.filter(q => q.score >= 70).length;
    const averageScore = totalQuizzes > 0 ? 
      quizResults.reduce((sum, q) => sum + q.score, 0) / totalQuizzes : 0;

    // Calculate study time (mock data for now)
    const studyTime = Math.floor(Math.random() * 5000) + 1000; // minutes
    
    // Calculate streak (mock data for now)
    const streakDays = Math.floor(Math.random() * 30) + 1;
    
    // Calculate level and XP (mock data for now)
    const currentLevel = Math.floor(studyTime / 100) + 1;
    const experiencePoints = studyTime;
    const nextLevelXP = currentLevel * 100;

    // Weekly progress (mock data for now)
    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        lessonsCompleted: Math.floor(Math.random() * 5) + 1,
        timeSpent: Math.floor(Math.random() * 180) + 30,
        quizzesPassed: Math.floor(Math.random() * 3) + 1
      };
    });

    // Course progress
    const courseProgress = enrollments.map(enrollment => {
      const course = enrollment.programmeId as any;
      const courseLessons = course.lessons?.length || 0;
      const completedCourseLessons = completedLessons.filter(
        l => l.courseId.toString() === course._id.toString()
      ).length;
      
      const courseQuizzes = quizResults.filter(
        q => q.programmeId.toString() === course._id.toString()
      );
      const averageCourseScore = courseQuizzes.length > 0 ?
        courseQuizzes.reduce((sum, q) => sum + q.score, 0) / courseQuizzes.length : 0;

      return {
        courseId: course._id,
        courseTitle: course.title,
        progress: courseLessons > 0 ? Math.round((completedCourseLessons / courseLessons) * 100) : 0,
        lessonsCompleted: completedCourseLessons,
        totalLessons: courseLessons,
        averageScore: Math.round(averageCourseScore)
      };
    });

    // Achievements (mock data for now)
    const achievements = [
      {
        id: '1',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        earnedAt: completedLessonsCount > 0 ? new Date().toISOString() : '',
        progress: Math.min(completedLessonsCount, 1),
        maxProgress: 1
      },
      {
        id: '2',
        title: 'Quiz Master',
        description: 'Pass 10 quizzes with 90%+ score',
        icon: '🏆',
        earnedAt: passedQuizzes >= 10 ? new Date().toISOString() : '',
        progress: Math.min(passedQuizzes, 10),
        maxProgress: 10
      },
      {
        id: '3',
        title: 'Streak Champion',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        earnedAt: streakDays >= 7 ? new Date().toISOString() : '',
        progress: Math.min(streakDays, 7),
        maxProgress: 7
      },
      {
        id: '4',
        title: 'Course Completer',
        description: 'Complete your first course',
        icon: '🎓',
        earnedAt: completedCourses > 0 ? new Date().toISOString() : '',
        progress: Math.min(completedCourses, 1),
        maxProgress: 1
      },
      {
        id: '5',
        title: 'Time Warrior',
        description: 'Study for 50 hours total',
        icon: '⏰',
        earnedAt: studyTime >= 3000 ? new Date().toISOString() : '',
        progress: Math.min(studyTime, 3000),
        maxProgress: 3000
      }
    ];

    // Learning streak (mock data for now)
    const learningStreak = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const isActive = i >= (30 - streakDays);
      return {
        date: date.toISOString().split('T')[0],
        active: isActive,
        minutes: isActive ? Math.floor(Math.random() * 120) + 30 : 0
      };
    });

    const analyticsData = {
      totalCourses,
      completedCourses,
      totalLessons,
      completedLessons: completedLessonsCount,
      totalQuizzes,
      passedQuizzes,
      averageScore: Math.round(averageScore),
      studyTime,
      streakDays,
      currentLevel,
      experiencePoints,
      nextLevelXP,
      weeklyProgress,
      courseProgress,
      achievements,
      learningStreak
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Error getting student analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get course-specific analytics
export const getCourseAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get course enrollment
    const enrollment = await Enrollment.findOne({ studentId: userId, programmeId: courseId }).populate('programmeId');
    if (!enrollment) {
      return res.status(404).json({ message: 'Course enrollment not found' });
    }

    // Get completed lessons for this course
    const completedLessons = await LessonCompletion.find({ userId, courseId });
    
    // Get quiz results for this course
    const quizResults = await QuizResult.find({ studentId: userId, programmeId: courseId });

    // Calculate course-specific analytics
    const course = enrollment.programmeId as any;
    const totalLessons = course.lessons?.length || 0;
    const completedLessonsCount = completedLessons.length;
    const progress = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;
    
    const averageScore = quizResults.length > 0 ?
      quizResults.reduce((sum, q) => sum + q.score, 0) / quizResults.length : 0;

    const courseAnalytics = {
      courseId: course._id,
      courseTitle: course.title,
      progress,
      lessonsCompleted: completedLessonsCount,
      totalLessons,
      averageScore: Math.round(averageScore),
      quizResults: quizResults.map(q => ({
        quizId: q.quizId,
        score: q.score,
        completedAt: q.createdAt
      })),
      completedLessons: completedLessons.map(l => ({
        lessonId: l.lessonId,
        completedAt: l.createdAt
      }))
    };

    res.json(courseAnalytics);
  } catch (error) {
    console.error('Error getting course analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get learning streak data
export const getLearningStreak = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get completed lessons in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completedLessons = await LessonCompletion.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Group by date and calculate streak
    const dailyActivity = new Map();
    completedLessons.forEach(lesson => {
      const date = lesson.createdAt.toISOString().split('T')[0];
      if (!dailyActivity.has(date)) {
        dailyActivity.set(date, 0);
      }
      dailyActivity.set(date, dailyActivity.get(date) + 1);
    });

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (dailyActivity.has(dateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Generate streak data for the last 30 days
    const streakData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      const isActive = dailyActivity.has(dateStr);
      
      return {
        date: dateStr,
        active: isActive,
        lessonsCompleted: isActive ? dailyActivity.get(dateStr) : 0,
        minutes: isActive ? Math.floor(Math.random() * 120) + 30 : 0 // Mock study time
      };
    });

    res.json({
      currentStreak,
      streakData,
      totalActiveDays: dailyActivity.size
    });
  } catch (error) {
    console.error('Error getting learning streak:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get achievements data
export const getAchievements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get user's learning data
    const enrollments = await Enrollment.find({ userId });
    const completedLessons = await LessonCompletion.find({ userId });
    const quizResults = await QuizResult.find({ userId });

    // Calculate achievements
    const achievements = [
      {
        id: '1',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        earnedAt: completedLessons.length > 0 ? completedLessons[0].createdAt.toISOString() : '',
        progress: Math.min(completedLessons.length, 1),
        maxProgress: 1
      },
      {
        id: '2',
        title: 'Quiz Master',
        description: 'Pass 10 quizzes with 90%+ score',
        icon: '🏆',
        earnedAt: '',
        progress: Math.min(quizResults.filter(q => q.score >= 90).length, 10),
        maxProgress: 10
      },
      {
        id: '3',
        title: 'Course Explorer',
        description: 'Enroll in 5 different courses',
        icon: '📚',
        earnedAt: '',
        progress: Math.min(enrollments.length, 5),
        maxProgress: 5
      },
      {
        id: '4',
        title: 'Perfect Score',
        description: 'Get 100% on 3 quizzes',
        icon: '⭐',
        earnedAt: '',
        progress: Math.min(quizResults.filter(q => q.score === 100).length, 3),
        maxProgress: 3
      },
      {
        id: '5',
        title: 'Dedicated Learner',
        description: 'Complete 50 lessons',
        icon: '🎓',
        earnedAt: '',
        progress: Math.min(completedLessons.length, 50),
        maxProgress: 50
      }
    ];

    // Update earned dates
    achievements.forEach(achievement => {
      if (achievement.progress >= achievement.maxProgress && !achievement.earnedAt) {
        achievement.earnedAt = new Date().toISOString();
      }
    });

    res.json(achievements);
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
