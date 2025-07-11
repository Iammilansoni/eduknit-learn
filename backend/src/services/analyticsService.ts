import mongoose from 'mongoose';
import Enrollment from '../models/Enrollment';
import UserCourseProgress from '../models/UserCourseProgress';
import LessonCompletion from '../models/LessonCompletion';
import QuizResult from '../models/QuizResult';
import Programme from '../models/Programme';
import ProgrammeModule from '../models/ProgrammeModule';
import ProgrammeLesson from '../models/ProgrammeLesson';
import StudentProfile from '../models/StudentProfile';
import logger from '../config/logger';

export interface DashboardOverview {
  enrolledCourses: {
    total: number;
    active: number;
    completed: number;
    paused: number;
  };
  activeLearningPaths: Array<{
    courseId: string;
    title: string;
    progress: number;
    lastAccessed: Date;
    estimatedTimeToComplete: number;
  }>;
  overallProgress: number;
  learningStreak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
  totalTimeSpent: number;
  certificatesEarned: number;
}

export interface CourseAnalytics {
  courseId: string;
  title: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessed: Date;
  timeSpent: number;
  estimatedTimeToComplete: number;
  modules: Array<{
    moduleId: string;
    title: string;
    progress: number;
    completedLessons: number;
    totalLessons: number;
  }>;
  streak: number;
  points: number;
}

export interface AnalyticsData {
  courseWiseProgress: Array<{
    courseId: string;
    title: string;
    progress: number;
    timeSpent: number;
    lastActivity: Date;
  }>;
  timeSpentPerCourse: Array<{
    courseId: string;
    title: string;
    timeSpent: number;
    averagePerSession: number;
  }>;
  streakTrends: Array<{
    date: string;
    streak: number;
    lessonsCompleted: number;
  }>;
  pointsEarned: Array<{
    date: string;
    points: number;
    source: string;
  }>;
  lessonsCompleted: Array<{
    lessonId: string;
    title: string;
    courseTitle: string;
    completedAt: Date;
    timeSpent: number;
    points: number;
  }>;
  modulesMastered: Array<{
    moduleId: string;
    title: string;
    courseTitle: string;
    completedAt: Date;
    lessonsCompleted: number;
  }>;
  dailyEngagement: Array<{
    date: string;
    lessonsCompleted: number;
    timeSpent: number;
    quizzesTaken: number;
    pointsEarned: number;
  }>;
}

class AnalyticsService {
  /**
   * Calculate comprehensive dashboard overview
   */
  async getDashboardOverview(studentId: string): Promise<DashboardOverview> {
    try {
      // Get all enrollments
      const enrollments = await Enrollment.find({ studentId })
        .populate('programmeId', 'title totalLessons estimatedDuration')
        .lean();

      // Get lesson completions for streak calculation
      const lessonCompletions = await LessonCompletion.find({ userId: studentId })
        .sort({ completedAt: -1 })
        .lean();

      // Get student profile for gamification data
      const profile = await StudentProfile.findOne({ userId: studentId }).lean();

      // Calculate enrolled courses stats
      const enrolledCourses = {
        total: enrollments.length,
        active: enrollments.filter(e => e.status === 'ACTIVE').length,
        completed: enrollments.filter(e => e.status === 'COMPLETED').length,
        paused: enrollments.filter(e => e.status === 'PAUSED').length
      };

      // Calculate active learning paths (progress > 0% and < 100%)
      const activeLearningPaths = enrollments
        .filter(e => e.status === 'ACTIVE' && e.progress?.totalProgress > 0 && e.progress?.totalProgress < 100)
        .map(enrollment => {
          const programme = enrollment.programmeId as any;
          const progress = enrollment.progress?.totalProgress || 0;
          const timeSpent = enrollment.progress?.timeSpent || 0;
          
          // Calculate estimated time to complete remaining lessons
          const remainingProgress = 100 - progress;
          const averageTimePerPercent = timeSpent / (progress || 1);
          const estimatedTimeToComplete = Math.round(remainingProgress * averageTimePerPercent);

          return {
            courseId: programme._id.toString(),
            title: programme.title,
            progress: Math.round(progress),
            lastAccessed: enrollment.progress?.lastActivityDate || enrollment.enrollmentDate,
            estimatedTimeToComplete
          };
        })
        .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());

      // Calculate overall progress
      const overallProgress = enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + (e.progress?.totalProgress || 0), 0) / enrollments.length
        : 0;

      // Calculate learning streak
      const { currentStreak, longestStreak } = this.calculateLearningStreak(lessonCompletions);

      // Calculate total points
      const totalPoints = this.calculateTotalPoints(lessonCompletions, profile);

      // Calculate total time spent
      const totalTimeSpent = enrollments.reduce((sum, e) => sum + (e.progress?.timeSpent || 0), 0);

      return {
        enrolledCourses,
        activeLearningPaths,
        overallProgress: Math.round(overallProgress),
        learningStreak: currentStreak,
        longestStreak: longestStreak,
        totalPoints,
        level: profile?.gamification?.level || 1,
        totalTimeSpent,
        certificatesEarned: profile?.statistics?.totalCertificatesEarned || 0
      };
    } catch (error) {
      logger.error('Error getting dashboard overview:', error);
      throw error;
    }
  }

  /**
   * Get detailed analytics for a specific course
   */
  async getCourseAnalytics(studentId: string, courseId: string): Promise<CourseAnalytics> {
    try {
      const enrollment = await Enrollment.findOne({ studentId, programmeId: courseId })
        .populate('programmeId', 'title totalLessons estimatedDuration')
        .lean();

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      const programme = enrollment.programmeId as any;

      // Get all modules for this course
      const modules = await ProgrammeModule.find({ programmeId: courseId })
        .sort({ orderIndex: 1 })
        .lean();

      // Get lesson progress for this course
      const lessonProgress = await UserCourseProgress.find({
        studentId,
        programmeId: courseId
      }).populate('lessonId moduleId').lean();

      // Calculate module progress
      const moduleAnalytics = await Promise.all(
        modules.map(async (module) => {
          const moduleLessons = lessonProgress.filter(lp => 
            (lp.moduleId as any)?._id?.toString() === module._id.toString()
          );
          
          const completedLessons = moduleLessons.filter(lp => lp.status === 'COMPLETED').length;
          const totalLessons = moduleLessons.length;
          const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

          return {
            moduleId: module._id.toString(),
            title: module.title,
            progress: Math.round(progress),
            completedLessons,
            totalLessons
          };
        })
      );

      // Calculate course progress
      const completedLessons = lessonProgress.filter(lp => lp.status === 'COMPLETED').length;
      const totalLessons = programme.totalLessons || lessonProgress.length;
      const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      // Calculate time spent
      const timeSpent = enrollment.progress?.timeSpent || 0;

      // Calculate estimated time to complete
      const remainingProgress = 100 - progress;
      const averageTimePerPercent = timeSpent / (progress || 1);
      const estimatedTimeToComplete = Math.round(remainingProgress * averageTimePerPercent);

      // Calculate course streak
      const courseLessonCompletions = await LessonCompletion.find({
        userId: studentId,
        lessonId: { $in: lessonProgress.map(lp => lp.lessonId) }
      }).sort({ completedAt: -1 }).lean();

      const courseStreak = this.calculateCourseStreak(courseLessonCompletions);

      // Calculate course points
      const coursePoints = this.calculateCoursePoints(courseLessonCompletions);

      return {
        courseId: courseId,
        title: programme.title,
        progress: Math.round(progress),
        completedLessons,
        totalLessons,
        lastAccessed: enrollment.progress?.lastActivityDate || enrollment.enrollmentDate,
        timeSpent,
        estimatedTimeToComplete,
        modules: moduleAnalytics,
        streak: courseStreak,
        points: coursePoints
      };
    } catch (error) {
      logger.error('Error getting course analytics:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive analytics data for charts and detailed views
   */
  async getAnalyticsData(studentId: string, days: number = 30): Promise<AnalyticsData> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get enrollments
      const enrollments = await Enrollment.find({ studentId })
        .populate('programmeId', 'title')
        .lean();

      // Get lesson completions
      const lessonCompletions = await LessonCompletion.find({
        userId: studentId,
        completedAt: { $gte: startDate }
      }).populate('lessonId').lean();

      // Get quiz results
      const quizResults = await QuizResult.find({
        studentId,
        completedAt: { $gte: startDate }
      }).lean();

      // Calculate course-wise progress
      const courseWiseProgress = enrollments
        .filter(enrollment => enrollment.programmeId) // Only include enrollments with a valid programme
        .map(enrollment => {
          const programme = enrollment.programmeId as any;
          return {
            courseId: programme._id.toString(),
            title: programme.title,
            progress: enrollment.progress?.totalProgress || 0,
            timeSpent: enrollment.progress?.timeSpent || 0,
            lastActivity: enrollment.progress?.lastActivityDate || enrollment.enrollmentDate
          };
        });

      // Calculate time spent per course
      const timeSpentPerCourse = courseWiseProgress.map(course => {
        const courseCompletions = lessonCompletions.filter(lc => 
          (lc.lessonId as any)?.moduleId?.programmeId?.toString() === course.courseId
        );
        
        const totalTimeSpent = courseCompletions.reduce((sum, lc) => sum + (lc.timeSpent || 0), 0);
        const averagePerSession = courseCompletions.length > 0 ? totalTimeSpent / courseCompletions.length : 0;

        return {
          courseId: course.courseId,
          title: course.title,
          timeSpent: totalTimeSpent,
          averagePerSession: Math.round(averagePerSession)
        };
      });

      // Calculate streak trends
      const streakTrends = this.calculateStreakTrends(lessonCompletions, days);

      // Calculate points earned over time
      const pointsEarned = this.calculatePointsEarned(lessonCompletions, quizResults, days);

      // Get lessons completed with details
      const lessonsCompleted = lessonCompletions.map(lc => ({
        lessonId: (lc.lessonId as any)?._id?.toString(),
        title: (lc.lessonId as any)?.title || 'Unknown Lesson',
        courseTitle: this.getCourseTitleFromLesson(lc, enrollments),
        completedAt: lc.completedAt,
        timeSpent: lc.timeSpent || 0,
        points: this.calculateLessonPoints(lc)
      }));

      // Calculate modules mastered
      const modulesMastered = await this.calculateModulesMastered(studentId, startDate);

      // Calculate daily engagement
      const dailyEngagement = this.calculateDailyEngagement(lessonCompletions, quizResults, days);

      return {
        courseWiseProgress,
        timeSpentPerCourse,
        streakTrends,
        pointsEarned,
        lessonsCompleted,
        modulesMastered,
        dailyEngagement
      };
    } catch (error) {
      logger.error('Error getting analytics data:', error);
      throw error;
    }
  }

  /**
   * Update analytics when a lesson is completed
   */
  async updateAnalyticsOnLessonCompletion(
    studentId: string,
    lessonId: string,
    courseId: string,
    timeSpent: number,
    points: number
  ): Promise<void> {
    try {
      // Update enrollment progress
      await Enrollment.findOneAndUpdate(
        { studentId, programmeId: courseId },
        {
          $inc: {
            'progress.completedLessons': 1,
            'progress.timeSpent': timeSpent,
            'progress.totalProgress': this.calculateProgressIncrement(courseId)
          },
          $set: {
            'progress.lastActivityDate': new Date()
          }
        }
      );

      // Update student profile points and level
      await StudentProfile.findOneAndUpdate(
        { userId: studentId },
        {
          $inc: {
            'gamification.points': points,
            'statistics.totalLessonsCompleted': 1,
            'statistics.totalTimeSpent': timeSpent
          }
        },
        { upsert: true }
      );

      // Update learning streak
      await this.updateLearningStreak(studentId);

      logger.info(`Analytics updated for student ${studentId} on lesson ${lessonId}`);
    } catch (error) {
      logger.error('Error updating analytics on lesson completion:', error);
      throw error;
    }
  }

  /**
   * Calculate learning streak from lesson completions
   */
  private calculateLearningStreak(lessonCompletions: any[]): { currentStreak: number; longestStreak: number } {
    if (lessonCompletions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    // Sort by completion date (newest first)
    const sortedCompletions = lessonCompletions
      .map(lc => new Date(lc.completedAt))
      .sort((a, b) => b.getTime() - a.getTime());

    for (let i = 0; i < sortedCompletions.length; i++) {
      const completionDate = new Date(sortedCompletions[i]);
      completionDate.setHours(0, 0, 0, 0);

      if (lastDate === null) {
        // First completion
        if (completionDate.getTime() === today.getTime()) {
          tempStreak = 1;
        } else {
          const daysDiff = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff === 1) {
            tempStreak = 1;
          } else {
            break; // Streak broken
          }
        }
      } else {
        const daysDiff = Math.floor((lastDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          // Streak broken
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }

      lastDate = completionDate;
    }

    currentStreak = tempStreak;
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }

  /**
   * Calculate total points from various sources
   */
  private calculateTotalPoints(lessonCompletions: any[], profile: any): number {
    let totalPoints = 0;

    // Points from lesson completions
    totalPoints += lessonCompletions.length * 10; // 10 points per lesson

    // Points from profile gamification
    if (profile?.gamification?.points) {
      totalPoints += profile.gamification.points;
    }

    // Bonus points for streaks (if implemented)
    // This would be calculated based on current streak

    return totalPoints;
  }

  /**
   * Calculate course streak
   */
  private calculateCourseStreak(lessonCompletions: any[]): number {
    if (lessonCompletions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let lastDate: Date | null = null;

    const sortedCompletions = lessonCompletions
      .map(lc => new Date(lc.completedAt))
      .sort((a, b) => b.getTime() - a.getTime());

    for (const completionDate of sortedCompletions) {
      const date = new Date(completionDate);
      date.setHours(0, 0, 0, 0);

      if (lastDate === null) {
        if (date.getTime() === today.getTime()) {
          streak = 1;
        } else {
          const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff === 1) {
            streak = 1;
          } else {
            break;
          }
        }
      } else {
        const daysDiff = Math.floor((lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          streak++;
        } else {
          break;
        }
      }

      lastDate = date;
    }

    return streak;
  }

  /**
   * Calculate course points
   */
  private calculateCoursePoints(lessonCompletions: any[]): number {
    return lessonCompletions.length * 10; // 10 points per lesson
  }

  /**
   * Calculate streak trends over time
   */
  private calculateStreakTrends(lessonCompletions: any[], days: number): Array<{ date: string; streak: number; lessonsCompleted: number }> {
    const trends = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayCompletions = lessonCompletions.filter(lc => {
        const completionDate = new Date(lc.completedAt);
        return completionDate >= date && completionDate < nextDate;
      });

      // Calculate streak up to this date
      const completionsUpToDate = lessonCompletions.filter(lc => {
        const completionDate = new Date(lc.completedAt);
        return completionDate <= nextDate;
      });

      const { currentStreak } = this.calculateLearningStreak(completionsUpToDate);

      trends.push({
        date: date.toISOString().split('T')[0],
        streak: currentStreak,
        lessonsCompleted: dayCompletions.length
      });
    }

    return trends;
  }

  /**
   * Calculate points earned over time
   */
  private calculatePointsEarned(lessonCompletions: any[], quizResults: any[], days: number): Array<{ date: string; points: number; source: string }> {
    const pointsByDate = new Map<string, { points: number; sources: string[] }>();
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      pointsByDate.set(dateStr, { points: 0, sources: [] });
    }

    // Add lesson completion points
    lessonCompletions.forEach(lc => {
      const dateStr = new Date(lc.completedAt).toISOString().split('T')[0];
      const existing = pointsByDate.get(dateStr);
      if (existing) {
        existing.points += 10;
        existing.sources.push('lesson');
      }
    });

    // Add quiz completion points
    quizResults.forEach(qr => {
      const dateStr = new Date(qr.completedAt).toISOString().split('T')[0];
      const existing = pointsByDate.get(dateStr);
      if (existing) {
        const quizPoints = Math.round((qr.percentage || 0) / 10); // 1 point per 10% score
        existing.points += quizPoints;
        existing.sources.push('quiz');
      }
    });

    return Array.from(pointsByDate.entries()).map(([date, data]) => ({
      date,
      points: data.points,
      source: data.sources.join(', ')
    }));
  }

  /**
   * Calculate modules mastered
   */
  private async calculateModulesMastered(studentId: string, startDate: Date): Promise<Array<{ moduleId: string; title: string; courseTitle: string; completedAt: Date; lessonsCompleted: number }>> {
    const lessonProgress = await UserCourseProgress.find({
      studentId,
      status: 'COMPLETED',
      lastAccessedAt: { $gte: startDate }
    }).populate('moduleId lessonId').lean();

    const moduleCompletions = new Map<string, { moduleId: string; title: string; courseTitle: string; completedAt: Date; lessonsCompleted: number }>();

    lessonProgress.forEach(lp => {
      const module = lp.moduleId as any;
      if (module) {
        const moduleId = module._id.toString();
        const existing = moduleCompletions.get(moduleId);
        
        if (existing) {
          existing.lessonsCompleted++;
          if (lp.lastAccessedAt > existing.completedAt) {
            existing.completedAt = lp.lastAccessedAt;
          }
        } else {
          moduleCompletions.set(moduleId, {
            moduleId: moduleId,
            title: module.title || 'Unknown Module',
            courseTitle: this.getCourseTitleFromModule(module, studentId),
            completedAt: lp.lastAccessedAt,
            lessonsCompleted: 1
          });
        }
      }
    });

    return Array.from(moduleCompletions.values());
  }

  /**
   * Calculate daily engagement
   */
  private calculateDailyEngagement(lessonCompletions: any[], quizResults: any[], days: number): Array<{ date: string; lessonsCompleted: number; timeSpent: number; quizzesTaken: number; pointsEarned: number }> {
    const engagementByDate = new Map<string, { lessonsCompleted: number; timeSpent: number; quizzesTaken: number; pointsEarned: number }>();
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      engagementByDate.set(dateStr, { lessonsCompleted: 0, timeSpent: 0, quizzesTaken: 0, pointsEarned: 0 });
    }

    // Add lesson completions
    lessonCompletions.forEach(lc => {
      const dateStr = new Date(lc.completedAt).toISOString().split('T')[0];
      const existing = engagementByDate.get(dateStr);
      if (existing) {
        existing.lessonsCompleted++;
        existing.timeSpent += lc.timeSpent || 0;
        existing.pointsEarned += 10;
      }
    });

    // Add quiz results
    quizResults.forEach(qr => {
      const dateStr = new Date(qr.completedAt).toISOString().split('T')[0];
      const existing = engagementByDate.get(dateStr);
      if (existing) {
        existing.quizzesTaken++;
        existing.pointsEarned += Math.round((qr.percentage || 0) / 10);
      }
    });

    return Array.from(engagementByDate.entries()).map(([date, data]) => ({
      date,
      ...data
    }));
  }

  /**
   * Update learning streak in student profile
   */
  private async updateLearningStreak(studentId: string): Promise<void> {
    const lessonCompletions = await LessonCompletion.find({ userId: studentId })
      .sort({ completedAt: -1 })
      .lean();

    const { currentStreak, longestStreak } = this.calculateLearningStreak(lessonCompletions);

    await StudentProfile.findOneAndUpdate(
      { userId: studentId },
      {
        $set: {
          'gamification.streaks.currentLearningStreak': currentStreak,
          'gamification.streaks.longestLearningStreak': Math.max(longestStreak, currentStreak)
        }
      },
      { upsert: true }
    );
  }

  /**
   * Calculate progress increment for a course
   */
  private async calculateProgressIncrement(courseId: string): Promise<number> {
    const programme = await Programme.findById(courseId).lean();
    if (!programme || !programme.totalLessons) return 1;
    
    return 100 / programme.totalLessons;
  }

  /**
   * Calculate lesson points
   */
  private calculateLessonPoints(lessonCompletion: any): number {
    return 10; // Base points for lesson completion
  }

  /**
   * Get course title from lesson
   */
  private getCourseTitleFromLesson(lessonCompletion: any, enrollments: any[]): string {
    // This is a simplified version - in practice you'd need to populate the full hierarchy
    return 'Course'; // Placeholder
  }

  /**
   * Get course title from module
   */
  private getCourseTitleFromModule(module: any, studentId: string): string {
    // This is a simplified version - in practice you'd need to populate the full hierarchy
    return 'Course'; // Placeholder
  }
}

export default new AnalyticsService(); 