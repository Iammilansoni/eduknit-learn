import mongoose from 'mongoose';
import Enrollment from '../models/Enrollment';
import LessonCompletion from '../models/LessonCompletion';
import StudentProfile from '../models/StudentProfile';
import QuizResult from '../models/QuizResult';
import Programme from '../models/Programme';
import logger from '../config/logger';

/**
 * Service to handle real-time synchronization of student progress
 */
class RealtimeSyncService {

  /**
   * Sync lesson completion and update all related metrics
   */
  async syncLessonCompletion(
    studentId: string,
    courseId: string,
    moduleId: string,
    lessonId: string,
    timeSpent: number
  ): Promise<void> {
    try {
      // Start transaction-like approach
      const session = await Enrollment.startSession();
      
      try {
        await session.withTransaction(async () => {
          // 1. Create or update lesson completion
          await this.createLessonCompletion(studentId, courseId, moduleId, lessonId, timeSpent);
          
          // 2. Update enrollment progress
          await this.updateEnrollmentProgress(studentId, courseId, lessonId, timeSpent);
          
          // 3. Update student profile statistics
          await this.updateStudentProfileStats(studentId, timeSpent);
          
          // 4. Update learning streak
          await this.updateLearningStreak(studentId);
          
          // 5. Calculate and update points
          await this.updateStudentPoints(studentId, 10); // 10 points per lesson
        });
        
        logger.info(`Lesson completion synced for student ${studentId}, lesson ${lessonId}`);
      } finally {
        await session.endSession();
      }
      
    } catch (error) {
      logger.error('Error syncing lesson completion:', error);
      throw error;
    }
  }

  /**
   * Sync quiz completion and update metrics
   */
  async syncQuizCompletion(
    studentId: string,
    courseId: string,
    lessonId: string,
    quizData: {
      score: number;
      maxScore: number;
      timeSpent: number;
      passed: boolean;
    }
  ): Promise<void> {
    try {
      // Update quiz result
      const percentage = (quizData.score / quizData.maxScore) * 100;
      const quizResult = new QuizResult({
        studentId,
        programmeId: courseId,
        moduleId: new mongoose.Types.ObjectId(), // Temporary moduleId
        lessonId,
        score: quizData.score,
        maxScore: quizData.maxScore,
        percentage: percentage,
        passingScore: 70,
        isPassed: quizData.passed,
        timeSpent: quizData.timeSpent,
        startedAt: new Date(Date.now() - (quizData.timeSpent * 60 * 1000)),
        completedAt: new Date(),
        attempt: 1,
        answers: []
      });
      await quizResult.save();

      // Update student profile
      await this.updateStudentProfileStats(studentId, quizData.timeSpent);
      
      // Award points based on quiz score
      const pointsEarned = Math.round((quizData.score / quizData.maxScore) * 100 / 10); // 1 point per 10% score
      await this.updateStudentPoints(studentId, pointsEarned);

      logger.info(`Quiz completion synced for student ${studentId}`);
    } catch (error) {
      logger.error('Error syncing quiz completion:', error);
      throw error;
    }
  }

  /**
   * Sync enrollment statistics
   */
  async syncEnrollmentStats(studentId: string): Promise<void> {
    try {
      // Get all enrollments
      const enrollments = await Enrollment.find({ studentId });
      
      // Update student profile with enrollment counts
      const profile = await StudentProfile.findOne({ userId: studentId });
      if (profile) {
        profile.statistics.totalCoursesEnrolled = enrollments.length;
        profile.statistics.totalCoursesCompleted = enrollments.filter(e => e.status === 'COMPLETED').length;
        await profile.save();
      }

      logger.info(`Enrollment statistics synced for student ${studentId}`);
    } catch (error) {
      logger.error('Error syncing enrollment statistics:', error);
      throw error;
    }
  }

  /**
   * Create lesson completion record
   */
  private async createLessonCompletion(
    studentId: string,
    courseId: string,
    moduleId: string,
    lessonId: string,
    timeSpent: number
  ): Promise<void> {
    // Check if already exists
    const existing = await LessonCompletion.findOne({
      userId: studentId,
      lessonId
    });

    if (!existing) {
      const completion = new LessonCompletion({
        userId: studentId,
        courseId,
        moduleId,
        lessonId,
        completedAt: new Date(),
        timeSpent
      });
      await completion.save();
    } else {
      // Update time if completion already exists
      existing.timeSpent += timeSpent;
      existing.completedAt = new Date();
      await existing.save();
    }
  }

  /**
   * Update enrollment progress
   */
  private async updateEnrollmentProgress(
    studentId: string,
    courseId: string,
    lessonId: string,
    timeSpent: number
  ): Promise<void> {
    const enrollment = await Enrollment.findOne({
      studentId,
      programmeId: courseId
    });

    if (!enrollment) {
      throw new Error(`Enrollment not found for student ${studentId} and course ${courseId}`);
    }

    // Add lesson to completed list if not already there
    if (!enrollment.progress.completedLessons.includes(lessonId as any)) {
      enrollment.progress.completedLessons.push(lessonId as any);
    }

    // Update time spent
    enrollment.progress.timeSpent += timeSpent;
    enrollment.progress.lastActivityDate = new Date();

    // Recalculate total progress
    const programme = await Programme.findById(courseId);
    if (programme && programme.totalLessons) {
      const completedCount = enrollment.progress.completedLessons.length;
      enrollment.progress.totalProgress = Math.round((completedCount / programme.totalLessons) * 100);
      
      // Check if course is completed
      if (enrollment.progress.totalProgress >= 100 && enrollment.status !== 'COMPLETED') {
        enrollment.status = 'COMPLETED';
        enrollment.completionDate = new Date();
      }
    }

    await enrollment.save();
  }

  /**
   * Update student profile statistics
   */
  private async updateStudentProfileStats(studentId: string, timeSpent: number): Promise<void> {
    let profile = await StudentProfile.findOne({ userId: studentId });
    
    if (!profile) {
      // Create profile if it doesn't exist
      profile = new StudentProfile({
        userId: studentId,
        statistics: {
          joinDate: new Date(),
          lastActiveDate: new Date(),
          totalLearningHours: 0,
          profileCompleteness: 0
        }
      });
    }

    // Update statistics
    profile.statistics.totalLearningHours += timeSpent / 60; // Convert minutes to hours
    profile.statistics.lastActiveDate = new Date();

    await profile.save();
  }

  /**
   * Update learning streak
   */
  private async updateLearningStreak(studentId: string): Promise<void> {
    const profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) return;

    // Get all lesson completions for streak calculation
    const completions = await LessonCompletion.find({ userId: studentId })
      .sort({ completedAt: -1 })
      .lean();

    if (completions.length === 0) {
      profile.gamification.streaks.currentLearningStreak = 0;
      profile.gamification.streaks.longestLearningStreak = 0;
      await profile.save();
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get unique completion dates
    const completionDates = [...new Set(
      completions.map(c => {
        const date = new Date(c.completedAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    )].sort((a, b) => b - a); // Sort descending

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < completionDates.length; i++) {
      const completionDate = new Date(completionDates[i]);
      
      if (i === 0) {
        // Check if latest completion is today or yesterday
        const daysDiff = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 1) {
          tempStreak = 1;
        } else {
          break; // Streak is broken
        }
      } else {
        // Check consecutive days
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

    // Set current streak
    if (completionDates.length > 0) {
      const latestDate = new Date(completionDates[0]);
      const daysDiff = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 1) {
        currentStreak = tempStreak;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Update profile
    profile.gamification.streaks.currentLearningStreak = currentStreak;
    profile.gamification.streaks.longestLearningStreak = Math.max(
      longestStreak, 
      profile.gamification.streaks.longestLearningStreak
    );

    await profile.save();
  }

  /**
   * Update student points and level
   */
  private async updateStudentPoints(studentId: string, points: number): Promise<void> {
    const profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) return;

    // Add points
    profile.gamification.totalPoints += points;

    // Calculate level (100 points per level)
    const newLevel = Math.floor(profile.gamification.totalPoints / 100) + 1;
    profile.gamification.level = newLevel;

    await profile.save();
  }

  /**
   * Get real-time dashboard data for a student
   */
  async getRealTimeDashboardData(studentId: string): Promise<any> {
    try {
      // Get all data in parallel
      const [enrollments, lessonCompletions, quizResults, profile] = await Promise.all([
        Enrollment.find({ studentId }).populate('programmeId', 'title description category level totalModules totalLessons').lean(),
        LessonCompletion.find({ userId: studentId }).sort({ completedAt: -1 }).lean(),
        QuizResult.find({ studentId }).sort({ completedAt: -1 }).lean(),
        StudentProfile.findOne({ userId: studentId }).lean()
      ]);

      // Calculate metrics
      const totalEnrollments = enrollments.length;
      const activeEnrollments = enrollments.filter(e => e.status === 'ACTIVE').length;
      const completedEnrollments = enrollments.filter(e => e.status === 'COMPLETED').length;
      
      // Calculate average progress
      const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress?.totalProgress || 0), 0);
      const averageProgress = totalEnrollments > 0 ? Math.round(totalProgress / totalEnrollments) : 0;

      // Calculate total time spent
      const totalTimeSpent = enrollments.reduce((sum, e) => sum + (e.progress?.timeSpent || 0), 0);

      // Calculate learning streak
      const streak = profile?.gamification?.streaks?.currentLearningStreak || 0;
      const longestStreak = profile?.gamification?.streaks?.longestLearningStreak || 0;

      // Calculate total points
      const totalPoints = profile?.gamification?.totalPoints || 0;

      return {
        enrolledCourses: totalEnrollments,
        activeEnrollments,
        completedCourses: completedEnrollments,
        averageProgress,
        totalHoursLearned: Math.round(totalTimeSpent / 60),
        learningStreak: streak,
        longestStreak,
        totalPoints,
        level: profile?.gamification?.level || 1,
        recentActivity: lessonCompletions.slice(0, 10),
        courseProgress: enrollments.map(e => {
          const programme = e.programmeId as any;
          return {
            courseId: programme?._id?.toString() || '',
            title: programme?.title || 'Unknown Course',
            progress: e.progress?.totalProgress || 0,
            timeSpent: e.progress?.timeSpent || 0,
            lastAccessed: e.progress?.lastActivityDate
          };
        })
      };
    } catch (error) {
      logger.error('Error getting real-time dashboard data:', error);
      throw error;
    }
  }

  /**
   * Batch sync for multiple students (for maintenance/cleanup)
   */
  async batchSyncStudents(studentIds: string[]): Promise<void> {
    logger.info(`Starting batch sync for ${studentIds.length} students`);
    
    for (const studentId of studentIds) {
      try {
        await this.syncEnrollmentStats(studentId);
        await this.updateLearningStreak(studentId);
        
        // Recalculate all course progress
        const enrollments = await Enrollment.find({ studentId });
        for (const enrollment of enrollments) {
          const lessonCompletions = await LessonCompletion.find({
            userId: studentId,
            courseId: enrollment.programmeId
          });
          
          // Update enrollment with actual lesson completion count
          enrollment.progress.completedLessons = lessonCompletions.map(lc => lc.lessonId);
          enrollment.progress.timeSpent = lessonCompletions.reduce((sum, lc) => sum + (lc.timeSpent || 0), 0);
          
          // Recalculate progress percentage
          const programme = await Programme.findById(enrollment.programmeId);
          if (programme && programme.totalLessons) {
            enrollment.progress.totalProgress = Math.round(
              (enrollment.progress.completedLessons.length / programme.totalLessons) * 100
            );
          }
          
          await enrollment.save();
        }
        
        logger.info(`Batch sync completed for student ${studentId}`);
      } catch (error) {
        logger.error(`Error in batch sync for student ${studentId}:`, error);
      }
    }
    
    logger.info('Batch sync completed for all students');
  }
}

export default new RealtimeSyncService();
