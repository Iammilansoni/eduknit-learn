import { Types, Schema } from 'mongoose';
import Enrollment from '../models/Enrollment';
import UserCourseProgress from '../models/UserCourseProgress';
import Programme from '../models/Programme';
import ProgrammeLesson from '../models/ProgrammeLesson';
import QuizResult from '../models/QuizResult';
import ProgrammeModule from '../models/ProgrammeModule';
import type { IEnrollment } from '../models/Enrollment';

export interface ProgressMetrics {
    actualProgress: number;
    expectedProgress: number;
    deviation: number;
    trackingStatus: 'ON_TRACK' | 'BEHIND' | 'AHEAD';
    daysElapsed: number;
    totalCourseDays: number;
    completedLessons: number;
    totalLessons: number;
    timeSpent: number;
}

export interface CourseProgressData {
    programmeId: string;
    programmeName: string;
    enrollmentDate: Date;
    status: string;
    progressMetrics: ProgressMetrics;
    moduleProgress: ModuleProgress[];
    recentActivity: RecentActivity[];
}

export interface ModuleProgress {
    moduleId: string;
    moduleName: string;
    orderIndex: number;
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    timeSpent: number;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface RecentActivity {
    lessonId: string;
    lessonTitle: string;
    moduleId: string;
    type: 'LESSON_COMPLETED' | 'LESSON_STARTED' | 'QUIZ_COMPLETED';
    timestamp: Date;
    timeSpent?: number;
    score?: number;
}

export class ProgressService {
    /**
     * Calculate progress metrics for a student's course
     */
    static async calculateProgressMetrics(
        studentId: string,
        programmeId: string,
        enrollmentDate: Date,
        estimatedDurationDays: number
    ): Promise<ProgressMetrics> {
        // Get programme data
        const programme = await Programme.findById(programmeId);
        if (!programme) {
            throw new Error('Programme not found');
        }

        // Get enrollment data
        const enrollment = await Enrollment.findOne({ studentId, programmeId }) as IEnrollment | null;
        if (!enrollment) {
            throw new Error('Enrollment not found');
        }

        // Calculate time-based metrics
        const now = new Date();
        const daysElapsed = Math.floor((now.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
        const totalCourseDays = estimatedDurationDays || programme.estimatedDuration;

        // Calculate actual progress
        const totalLessons = programme.totalLessons;
        const completedLessons = enrollment.progress.completedLessons.length;
        const actualProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        // Calculate expected progress (time-based)
        const expectedProgress = Math.min(100, (daysElapsed / totalCourseDays) * 100);

        // Calculate deviation
        const deviation = actualProgress - expectedProgress;

        // Determine tracking status
        let trackingStatus: 'ON_TRACK' | 'BEHIND' | 'AHEAD';
        if (enrollment.status === 'ENROLLED' && completedLessons === 0) {
            trackingStatus = 'ON_TRACK';
        } else if (Math.abs(deviation) <= 5) {
            trackingStatus = 'ON_TRACK';
        } else if (deviation < -5) {
            trackingStatus = 'BEHIND';
        } else {
            trackingStatus = 'AHEAD';
        }

        return {
            actualProgress: Math.round(actualProgress * 100) / 100,
            expectedProgress: Math.round(expectedProgress * 100) / 100,
            deviation: Math.round(deviation * 100) / 100,
            trackingStatus,
            daysElapsed,
            totalCourseDays,
            completedLessons,
            totalLessons,
            timeSpent: enrollment.progress.timeSpent
        };
    }

    /**
     * Get comprehensive course progress data
     */
    static async getCourseProgressData(studentId: string, programmeId: string): Promise<CourseProgressData> {
        // Get enrollment and programme data
        const [enrollment, programme] = await Promise.all([
            Enrollment.findOne({ studentId, programmeId }).populate('programmeId') as Promise<IEnrollment | null>,
            Programme.findById(programmeId)
        ]);

        if (!enrollment || !programme) {
            throw new Error('Enrollment or programme not found');
        }

        // Calculate progress metrics
        const progressMetrics = await this.calculateProgressMetrics(
            studentId,
            programmeId,
            enrollment.enrollmentDate,
            programme.estimatedDuration
        );

        // Get module progress
        const moduleProgress = await this.getModuleProgress(studentId, programmeId);

        // Get recent activity
        const recentActivity = await this.getRecentActivity(studentId, programmeId, 10);

        // If enrolled but no progress, set status to ENROLLED
        let status: IEnrollment['status'] = enrollment.status;
        if (status !== 'COMPLETED' && progressMetrics.completedLessons === 0) {
            status = 'ENROLLED';
        }

        return {
            programmeId,
            programmeName: programme.title,
            enrollmentDate: enrollment.enrollmentDate,
            status,
            progressMetrics,
            moduleProgress,
            recentActivity
        };
    }

    /**
     * Get module-wise progress
     */
    static async getModuleProgress(studentId: string, programmeId: string): Promise<ModuleProgress[]> {
        const progressSummary = await UserCourseProgress.aggregate([
            {
                $match: {
                    studentId: new Types.ObjectId(studentId),
                    programmeId: new Types.ObjectId(programmeId)
                }
            },
            {
                $group: {
                    _id: '$moduleId',
                    totalLessons: { $sum: 1 },
                    completedLessons: {
                        $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
                    },
                    inProgressLessons: {
                        $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] }
                    },
                    totalTimeSpent: { $sum: '$timeSpent' },
                    averageProgress: { $avg: '$progressPercentage' }
                }
            },
            {
                $lookup: {
                    from: 'programmemodules',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'module'
                }
            },
            {
                $unwind: '$module'
            },
            {
                $sort: { 'module.orderIndex': 1 }
            }
        ]);

        return progressSummary.map(item => ({
            moduleId: item._id.toString(),
            moduleName: item.module.title,
            orderIndex: item.module.orderIndex,
            totalLessons: item.totalLessons,
            completedLessons: item.completedLessons,
            progressPercentage: Math.round((item.completedLessons / item.totalLessons) * 100),
            timeSpent: item.totalTimeSpent,
            status: item.completedLessons === item.totalLessons ? 'COMPLETED' :
                    item.inProgressLessons > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'
        }));
    }

    /**
     * Get recent activity for a student
     */
    static async getRecentActivity(studentId: string, programmeId: string, limit: number = 10): Promise<RecentActivity[]> {
        const activities: RecentActivity[] = [];

        // Get recent lesson completions
        const recentLessonProgress = await UserCourseProgress.find({
            studentId,
            programmeId,
            status: { $in: ['COMPLETED', 'IN_PROGRESS'] }
        })
        .populate('lessonId', 'title')
        .populate('moduleId', 'title')
        .sort({ lastAccessedAt: -1 })
        .limit(limit * 2); // Get more to filter and sort

        recentLessonProgress.forEach(progress => {
            let lessonId: string;
            let lessonTitle: string = '';
            if (typeof progress.lessonId === 'object' && progress.lessonId !== null && 'id' in progress.lessonId) {
                lessonId = String((progress.lessonId as any).id);
                lessonTitle = (progress.lessonId as any).title || '';
            } else {
                lessonId = progress.lessonId.toString();
            }
            let moduleId: string;
            if (typeof progress.moduleId === 'object' && progress.moduleId !== null && 'id' in progress.moduleId) {
                moduleId = String((progress.moduleId as any).id);
            } else {
                moduleId = progress.moduleId.toString();
            }
            if (progress.status === 'COMPLETED' && progress.completedAt) {
                activities.push({
                    lessonId,
                    lessonTitle,
                    moduleId,
                    type: 'LESSON_COMPLETED',
                    timestamp: progress.completedAt,
                    timeSpent: progress.timeSpent
                });
            } else if (progress.status === 'IN_PROGRESS' && progress.startedAt) {
                activities.push({
                    lessonId,
                    lessonTitle,
                    moduleId,
                    type: 'LESSON_STARTED',
                    timestamp: progress.startedAt,
                    timeSpent: progress.timeSpent
                });
            }
        });

        // Get recent quiz completions
        const recentQuizResults = await QuizResult.find({
            studentId,
            programmeId
        })
        .populate('lessonId', 'title')
        .sort({ completedAt: -1 })
        .limit(limit);

        recentQuizResults.forEach(quiz => {
            let lessonId: string;
            let lessonTitle: string = '';
            if (typeof quiz.lessonId === 'object' && quiz.lessonId !== null && 'id' in quiz.lessonId) {
                lessonId = String((quiz.lessonId as any).id);
                lessonTitle = (quiz.lessonId as any).title || '';
            } else {
                lessonId = quiz.lessonId.toString();
            }
            let moduleId: string;
            if (typeof quiz.moduleId === 'object' && quiz.moduleId !== null && 'id' in quiz.moduleId) {
                moduleId = String((quiz.moduleId as any).id);
            } else {
                moduleId = quiz.moduleId.toString();
            }
            activities.push({
                lessonId,
                lessonTitle,
                moduleId,
                type: 'QUIZ_COMPLETED',
                timestamp: quiz.completedAt,
                score: quiz.percentage
            });
        });

        // Sort all activities by timestamp and limit
        return activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }

    /**
     * Update enrollment progress atomically
     */
    static async updateEnrollmentProgress(
        studentId: string,
        programmeId: string,
        lessonId: string,
        timeSpent: number = 0
    ): Promise<void> {
        const session = await Enrollment.startSession();
        
        try {
            await session.withTransaction(async () => {
                // Get enrollment and programme data
                const [enrollment, programme] = await Promise.all([
                    Enrollment.findOne({ studentId, programmeId }).session(session),
                    Programme.findById(programmeId).session(session)
                ]);

                if (!enrollment || !programme) {
                    throw new Error('Enrollment or programme not found');
                }

                // Update enrollment progress if lesson not already completed
                if (!enrollment.progress.completedLessons.some((l: any) => l.toString() === lessonId)) {
                    enrollment.progress.completedLessons.push(new Schema.Types.ObjectId(lessonId));
                    enrollment.progress.timeSpent += timeSpent;
                    enrollment.progress.lastActivityDate = new Date();

                    // Recalculate total progress
                    const completionPercentage = (enrollment.progress.completedLessons.length / programme.totalLessons) * 100;
                    enrollment.progress.totalProgress = Math.round(completionPercentage);

                    // Mark course as completed if 100%
                    if (completionPercentage >= 100 && enrollment.status === 'ACTIVE') {
                        enrollment.status = 'COMPLETED';
                        enrollment.completionDate = new Date();
                    }

                    await enrollment.save({ session });
                }
            });
        } finally {
            await session.endSession();
        }
    }

    /**
     * Get progress dashboard data for multiple courses
     */
    static async getProgressDashboard(studentId: string): Promise<{
        totalCourses: number;
        activeCourses: number;
        completedCourses: number;
        enrolledCourses: number;
        averageProgress: number;
        totalTimeSpent: number;
        coursesOnTrack: number;
        coursesBehind: number;
        coursesAhead: number;
        recentActivity: RecentActivity[];
    }> {
        // Get all enrollments
        const enrollments = await Enrollment.find({ studentId }).populate('programmeId') as IEnrollment[];
        
        const progressData = await Promise.all(
            enrollments.map(async (enrollment) => {
                const programme = enrollment.programmeId as any;
                return await this.calculateProgressMetrics(
                    studentId,
                    programme._id.toString(),
                    enrollment.enrollmentDate,
                    programme.estimatedDuration
                );
            })
        );

        // Calculate summary statistics
        const totalCourses = enrollments.length;
        const activeCourses = enrollments.filter(e => e.status === 'ACTIVE').length;
        const completedCourses = enrollments.filter(e => e.status === 'COMPLETED').length;
        const enrolledCourses = enrollments.filter(e => e.status === 'ENROLLED').length;
        const averageProgress = progressData.reduce((sum, p) => sum + p.actualProgress, 0) / totalCourses || 0;
        const totalTimeSpent = progressData.reduce((sum, p) => sum + p.timeSpent, 0);
        
        const trackingCounts = progressData.reduce((acc, p) => {
            acc[p.trackingStatus]++;
            return acc;
        }, { ON_TRACK: 0, BEHIND: 0, AHEAD: 0 });

        // Get recent activity across all courses
        const allActivities = await Promise.all(
            enrollments.map(async (enrollment) => {
                const programme = enrollment.programmeId as any;
                return await this.getRecentActivity(studentId, programme._id.toString(), 5);
            })
        );

        const recentActivity = allActivities
            .flat()
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);

        return {
            totalCourses,
            activeCourses,
            completedCourses,
            enrolledCourses,
            averageProgress: Math.round(averageProgress * 100) / 100,
            totalTimeSpent,
            coursesOnTrack: trackingCounts.ON_TRACK,
            coursesBehind: trackingCounts.BEHIND,
            coursesAhead: trackingCounts.AHEAD,
            recentActivity
        };
    }

    /**
     * Get the next relevant learning module for a student in a course
     */
    static async getNextModule(studentId: string, programmeId: string) {
        // Get all modules for the course, sorted by orderIndex
        const modules = await ProgrammeModule.find({ programmeId, isActive: true }).sort({ orderIndex: 1 });
        // Get all completed lessons for the student in this course
        const completedLessonDocs = await UserCourseProgress.find({ studentId, programmeId, status: 'COMPLETED' });
        const completedLessons = new Set(completedLessonDocs.map(doc => doc.lessonId.toString()));
        // For each module, check if all lessons are completed
        for (const module of modules) {
            // Explicitly type lessons as any[] or your IProgrammeLesson[] if available
            const lessons = await ProgrammeLesson.find({ moduleId: module._id, isActive: true }) as Array<{ _id: Types.ObjectId }>; // Type assertion to fix TS error
            const allLessonsCompleted = lessons.length > 0 && lessons.every(lesson => completedLessons.has(String(lesson._id)));
            // If not all lessons are completed, and prerequisites are met, this is the next module
            if (!allLessonsCompleted) {
                // Check prerequisites for the module
                if (!module.prerequisites || module.prerequisites.length === 0 || module.prerequisites.every((prereqId: any) => {
                    // All lessons in prerequisite modules must be completed
                    return lessons.every(lesson => completedLessons.has(String(lesson._id)));
                })) {
                    return {
                        moduleId: module._id,
                        moduleTitle: module.title,
                        estimatedTime: module.estimatedDuration,
                        orderIndex: module.orderIndex,
                        status: allLessonsCompleted ? 'COMPLETED' : 'IN_PROGRESS',
                    };
                }
            }
        }
        // If all modules are completed
        return null;
    }

    /**
     * Get learning statistics for a student
     */
    static async getLearningStatistics(studentId: string) {
        // Aggregate completed lessons and total time
        const completed = await UserCourseProgress.aggregate([
            { $match: { studentId: new Types.ObjectId(studentId), status: 'COMPLETED' } },
            { $group: { _id: null, totalLessonsCompleted: { $sum: 1 }, totalLearningTime: { $sum: '$timeSpent' } } }
        ]);
        return completed[0] || { totalLessonsCompleted: 0, totalLearningTime: 0 };
    }
}

export default ProgressService;
