import cron from 'node-cron';
import mongoose from 'mongoose';
import Enrollment from '../models/Enrollment';
import LessonCompletion from '../models/LessonCompletion';
import StudentProfile from '../models/StudentProfile';
import AnalyticsService from './analyticsService';
import logger from '../config/logger';

class AnalyticsBackgroundService {
  private isInitialized = false;

  /**
   * Initialize background analytics jobs
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Daily analytics update at 2 AM
      cron.schedule('0 2 * * *', async () => {
        await this.updateDailyAnalytics();
      }, {
        timezone: 'UTC'
      });

      // Hourly streak updates
      cron.schedule('0 * * * *', async () => {
        await this.updateLearningStreaks();
      }, {
        timezone: 'UTC'
      });

      // Weekly analytics cleanup and optimization
      cron.schedule('0 3 * * 0', async () => {
        await this.weeklyAnalyticsCleanup();
      }, {
        timezone: 'UTC'
      });

      // Monthly comprehensive analytics update
      cron.schedule('0 4 1 * *', async () => {
        await this.monthlyAnalyticsUpdate();
      }, {
        timezone: 'UTC'
      });

      this.isInitialized = true;
      logger.info('Analytics background service initialized successfully');
    } catch (error) {
      logger.error('Error initializing analytics background service:', error);
      throw error;
    }
  }

  /**
   * Daily analytics update - runs at 2 AM UTC
   */
  private async updateDailyAnalytics(): Promise<void> {
    try {
      logger.info('Starting daily analytics update...');

      // Get all active students
      const activeStudents = await this.getActiveStudents();

      let processedCount = 0;
      let errorCount = 0;

      for (const studentId of activeStudents) {
        try {
          // Update learning streaks
          await this.updateStudentStreak(studentId);

          // Update points and level
          await this.updateStudentPoints(studentId);

          // Update course progress
          await this.updateCourseProgress(studentId);

          processedCount++;
        } catch (error) {
          errorCount++;
          logger.error(`Error updating analytics for student ${studentId}:`, error);
        }
      }

      logger.info(`Daily analytics update completed. Processed: ${processedCount}, Errors: ${errorCount}`);
    } catch (error) {
      logger.error('Error in daily analytics update:', error);
    }
  }

  /**
   * Update learning streaks for all active students
   */
  private async updateLearningStreaks(): Promise<void> {
    try {
      const activeStudents = await this.getActiveStudents();

      for (const studentId of activeStudents) {
        try {
          await this.updateStudentStreak(studentId);
        } catch (error) {
          logger.error(`Error updating streak for student ${studentId}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error updating learning streaks:', error);
    }
  }

  /**
   * Weekly analytics cleanup and optimization
   */
  private async weeklyAnalyticsCleanup(): Promise<void> {
    try {
      logger.info('Starting weekly analytics cleanup...');

      // Clean up old lesson completion records (keep last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const deleteResult = await LessonCompletion.deleteMany({
        completedAt: { $lt: sixMonthsAgo }
      });

      logger.info(`Weekly cleanup completed. Deleted ${deleteResult.deletedCount} old lesson completion records`);
    } catch (error) {
      logger.error('Error in weekly analytics cleanup:', error);
    }
  }

  /**
   * Monthly comprehensive analytics update
   */
  private async monthlyAnalyticsUpdate(): Promise<void> {
    try {
      logger.info('Starting monthly analytics update...');

      const activeStudents = await this.getActiveStudents();

      for (const studentId of activeStudents) {
        try {
          // Recalculate all analytics for the student
          await this.recalculateStudentAnalytics(studentId);
        } catch (error) {
          logger.error(`Error in monthly update for student ${studentId}:`, error);
        }
      }

      logger.info('Monthly analytics update completed');
    } catch (error) {
      logger.error('Error in monthly analytics update:', error);
    }
  }

  /**
   * Get all active students (students with recent activity)
   */
  private async getActiveStudents(): Promise<string[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeEnrollments = await Enrollment.find({
      'progress.lastActivityDate': { $gte: thirtyDaysAgo }
    }).distinct('studentId');

    return activeEnrollments.map(id => id.toString());
  }

  /**
   * Update learning streak for a specific student
   */
  private async updateStudentStreak(studentId: string): Promise<void> {
    const lessonCompletions = await LessonCompletion.find({ userId: studentId })
      .sort({ completedAt: -1 })
      .lean();

    const { currentStreak, longestStreak } = this.calculateLearningStreak(lessonCompletions);

    await StudentProfile.findOneAndUpdate(
      { userId: studentId },
      {
        $set: {
          'gamification.streaks.currentLearningStreak': currentStreak,
          'gamification.streaks.longestLearningStreak': Math.max(longestStreak, currentStreak),
          'gamification.streaks.lastUpdated': new Date()
        }
      },
      { upsert: true }
    );
  }

  /**
   * Update points and level for a specific student
   */
  private async updateStudentPoints(studentId: string): Promise<void> {
    const lessonCompletions = await LessonCompletion.find({ userId: studentId }).lean();
    const profile = await StudentProfile.findOne({ userId: studentId }).lean();

    // Calculate total points
    const totalPoints = this.calculateTotalPoints(lessonCompletions, profile);

    // Calculate level based on points (every 100 points = 1 level)
    const level = Math.floor(totalPoints / 100) + 1;

    await StudentProfile.findOneAndUpdate(
      { userId: studentId },
      {
        $set: {
          'gamification.points': totalPoints,
          'gamification.level': level,
          'gamification.lastUpdated': new Date()
        }
      },
      { upsert: true }
    );
  }

  /**
   * Update course progress for a specific student
   */
  private async updateCourseProgress(studentId: string): Promise<void> {
    const enrollments = await Enrollment.find({ studentId }).lean();

    for (const enrollment of enrollments) {
      try {
        // Always convert to string, then to ObjectId
        const programmeId = new mongoose.Types.ObjectId(enrollment.programmeId.toString());
        const totalLessons = await this.getTotalLessonsForCourse(programmeId);
        const completedLessons = enrollment.progress?.completedLessons?.length || 0;
        const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        await Enrollment.findByIdAndUpdate(enrollment._id, {
          $set: {
            'progress.totalProgress': progress,
            'progress.lastUpdated': new Date()
          }
        });
      } catch (error) {
        logger.error(`Error updating progress for enrollment ${enrollment._id}:`, error);
      }
    }
  }

  /**
   * Recalculate all analytics for a specific student
   */
  private async recalculateStudentAnalytics(studentId: string): Promise<void> {
    try {
      // Get comprehensive analytics data
      const analyticsData = await AnalyticsService.getAnalyticsData(studentId, 365); // Full year
      const dashboardOverview = await AnalyticsService.getDashboardOverview(studentId);

      // Update student profile with recalculated data
      await StudentProfile.findOneAndUpdate(
        { userId: studentId },
        {
          $set: {
            'statistics.totalLessonsCompleted': analyticsData.lessonsCompleted.length,
            'statistics.totalTimeSpent': dashboardOverview.totalTimeSpent,
            'statistics.totalCertificatesEarned': dashboardOverview.certificatesEarned,
            'gamification.points': dashboardOverview.totalPoints,
            'gamification.level': dashboardOverview.level,
            'gamification.streaks.currentLearningStreak': dashboardOverview.learningStreak,
            'gamification.streaks.longestLearningStreak': dashboardOverview.longestStreak,
            'analytics.lastRecalculated': new Date()
          }
        },
        { upsert: true }
      );
    } catch (error) {
      logger.error(`Error recalculating analytics for student ${studentId}:`, error);
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

    return totalPoints;
  }

  /**
   * Get total lessons for a course
   */
  private async getTotalLessonsForCourse(programmeId: mongoose.Types.ObjectId): Promise<number> {
    const { default: ProgrammeModule } = await import('../models/ProgrammeModule');
    const { default: ProgrammeLesson } = await import('../models/ProgrammeLesson');

    // Handle both ObjectId and string types
    const id = typeof programmeId === 'string' 
      ? new mongoose.Types.ObjectId(programmeId)
      : programmeId;
    
    const modules = await ProgrammeModule.find({ programmeId: id }).distinct('_id');
    const totalLessons = await ProgrammeLesson.countDocuments({ moduleId: { $in: modules } });

    return totalLessons;
  }

  /**
   * Stop all background jobs
   */
  stop(): void {
    cron.getTasks().forEach(task => task.stop());
    this.isInitialized = false;
    logger.info('Analytics background service stopped');
  }
}

export default new AnalyticsBackgroundService(); 