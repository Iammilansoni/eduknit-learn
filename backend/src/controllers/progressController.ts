import { Response, Request } from 'express';
import { Types } from 'mongoose';
import Enrollment from '../models/Enrollment';
import UserCourseProgress from '../models/UserCourseProgress';
import QuizResult from '../models/QuizResult';
import Programme, { IProgramme } from '../models/Programme';
import ProgrammeLesson, { IProgrammeLesson } from '../models/ProgrammeLesson';
import ProgrammeModule, { IProgrammeModule } from '../models/ProgrammeModule';
import LessonCompletion from '../models/LessonCompletion';
import { AuthRequest } from '../middleware/auth';
import ProgressService from '../services/progressService';
import AnalyticsService from '../services/analyticsService';

// Define populated interfaces for proper typing
interface PopulatedProgrammeModule extends Omit<IProgrammeModule, 'programmeId'> {
  programmeId: IProgramme;
}

interface PopulatedProgrammeLesson extends Omit<IProgrammeLesson, 'moduleId'> {
  moduleId: PopulatedProgrammeModule;
}

/**
 * Get general progress overview for the authenticated user
 */
export const getGeneralProgress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get all enrollments for the user
        const enrollments = await Enrollment.find({ studentId: userId })
            .populate('programmeId', 'title category totalLessons estimatedDuration')
            .lean();

        // Get lesson completions
        const lessonCompletions = await LessonCompletion.find({ userId }).lean();

        // Get quiz results from both models
        const QuizAttempt = (await import('../models/QuizAttempt')).default;
        const [quizResults, quizAttempts] = await Promise.all([
            QuizResult.find({ studentId: userId }).lean(),
            QuizAttempt.find({ studentId: userId, status: 'COMPLETED' }).lean()
        ]);

        // Calculate overall metrics
        const totalEnrollments = enrollments.length;
        const activeEnrollments = enrollments.filter(e => e.status === 'ACTIVE').length;
        const completedEnrollments = enrollments.filter(e => e.status === 'COMPLETED').length;
        
        const totalLessonsCompleted = lessonCompletions.length;
        const totalTimeSpent = enrollments.reduce((sum, e) => sum + (e.progress.timeSpent || 0), 0);
        
        const totalQuizzesTaken = quizResults.length + quizAttempts.length;
        let averageQuizScore = 0;
        if (totalQuizzesTaken > 0) {
            const quizResultsScore = quizResults.reduce((sum, q) => sum + (q.percentage || 0), 0);
            const quizAttemptsScore = quizAttempts.reduce((sum, q) => sum + (q.percentage || 0), 0);
            averageQuizScore = (quizResultsScore + quizAttemptsScore) / totalQuizzesTaken;
        }

        // Calculate overall progress across all courses
        let overallProgress = 0;
        if (totalEnrollments > 0) {
            const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress.totalProgress || 0), 0);
            overallProgress = totalProgress / totalEnrollments;
        }

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentCompletions = lessonCompletions.filter(
            lc => new Date(lc.completedAt) >= sevenDaysAgo
        );

        const recentQuizzes = [
            ...quizResults.filter(qr => qr.completedAt && new Date(qr.completedAt) >= sevenDaysAgo),
            ...quizAttempts.filter(qa => qa.completedAt && new Date(qa.completedAt) >= sevenDaysAgo)
        ];

        res.status(200).json({
            success: true,
            data: {
                userId,
                overview: {
                    totalEnrollments,
                    activeEnrollments,
                    completedEnrollments,
                    overallProgress: Math.round(overallProgress * 100) / 100,
                    totalLessonsCompleted,
                    totalTimeSpent, // in minutes
                    totalQuizzesTaken,
                    averageQuizScore: Math.round(averageQuizScore * 100) / 100
                },
                recentActivity: {
                    lessonsCompleted: recentCompletions.length,
                    quizzesTaken: recentQuizzes.length,
                    timeSpent: recentCompletions.reduce((sum, lc) => sum + (lc.timeSpent || 0), 0)
                },
                courses: enrollments.map(enrollment => ({
                    courseId: (enrollment.programmeId as any)._id,
                    title: (enrollment.programmeId as any).title,
                    category: (enrollment.programmeId as any).category,
                    status: enrollment.status,
                    progress: enrollment.progress.totalProgress,
                    enrollmentDate: enrollment.enrollmentDate,
                    lastActivity: enrollment.progress.lastActivityDate
                }))
            }
        });
    } catch (error) {
        console.error('Error getting general progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve general progress data'
        });
    }
};

/**
 * Get comprehensive progress for a student's enrolled courses
 */
export const getStudentProgress = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId } = req.params;
        const { programmeId } = req.query;

        // Validate studentId
        if (!Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid student ID'
            });
        }

        let query: any = { studentId };
        if (programmeId && Types.ObjectId.isValid(programmeId as string)) {
            query.programmeId = programmeId;
        }

        const enrollments = await Enrollment.find(query)
            .populate({
                path: 'programmeId',
                select: 'title description totalLessons estimatedDuration'
            })
            .lean();

        if (!enrollments || enrollments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No enrollments found for this student'
            });
        }

        const progressData = await Promise.all(
            enrollments.map(async (enrollment) => {
                // Get detailed lesson progress
                const lessonProgress = await UserCourseProgress.find({
                    studentId: enrollment.studentId,
                    programmeId: enrollment.programmeId
                }).populate('lessonId moduleId');

                // Calculate time-based progress
                const enrollmentDate = new Date(enrollment.enrollmentDate);
                const now = new Date();
                const daysElapsed = Math.floor((now.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
                
                // Assume programme duration is in hours, convert to days (assuming 1 hour study per day)
                const totalCourseDays = (enrollment.programmeId as any).estimatedDuration || 30;
                const expectedProgress = Math.min(100, (daysElapsed / totalCourseDays) * 100);
                
                // Calculate actual progress
                const totalLessons = (enrollment.programmeId as any).totalLessons || 1;
                const completedLessons = enrollment.progress.completedLessons.length;
                const actualProgress = (completedLessons / totalLessons) * 100;
                
                // Determine tracking status
                const deviation = actualProgress - expectedProgress;
                let trackingStatus: 'ON_TRACK' | 'BEHIND' | 'AHEAD';
                if (Math.abs(deviation) <= 5) {
                    trackingStatus = 'ON_TRACK';
                } else if (deviation < -5) {
                    trackingStatus = 'BEHIND';
                } else {
                    trackingStatus = 'AHEAD';
                }

                return {
                    programme: enrollment.programmeId,
                    enrollment: {
                        id: enrollment._id,
                        status: enrollment.status,
                        enrollmentDate: enrollment.enrollmentDate,
                        totalProgress: enrollment.progress.totalProgress,
                        completedLessons: enrollment.progress.completedLessons.length,
                        totalLessons,
                        timeSpent: enrollment.progress.timeSpent
                    },
                    progressMetrics: {
                        actualProgress: Math.round(actualProgress * 100) / 100,
                        expectedProgress: Math.round(expectedProgress * 100) / 100,
                        deviation: Math.round(deviation * 100) / 100,
                        trackingStatus,
                        daysElapsed,
                        totalCourseDays
                    },
                    lessonProgress: lessonProgress.length
                };
            })
        );

        res.status(200).json({
            success: true,
            data: {
                studentId,
                totalEnrollments: enrollments.length,
                progressData
            }
        });
    } catch (error) {
        console.error('Error getting student progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve progress data'
        });
    }
};

/**
 * Get detailed progress for a specific course
 */
export const getCourseProgress = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, programmeId } = req.params;

        // Validate IDs
        if (!Types.ObjectId.isValid(studentId) || !Types.ObjectId.isValid(programmeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid student ID or programme ID'
            });
        }

        // Get enrollment
        const enrollment = await Enrollment.findOne({ studentId, programmeId })
            .populate('programmeId');

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        // Get progress summary using aggregation
        const progressSummary = await UserCourseProgress.getProgressSummary(studentId, programmeId);
        const courseProgress = await UserCourseProgress.calculateCourseProgress(studentId, programmeId);

        res.status(200).json({
            success: true,
            data: {
                enrollment,
                progressSummary,
                overallProgress: courseProgress[0] || {
                    totalRequiredLessons: 0,
                    completedRequiredLessons: 0,
                    overallProgress: 0,
                    totalTimeSpent: 0,
                    averageProgress: 0
                }
            }
        });
    } catch (error) {
        console.error('Error getting course progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve course progress'
        });
    }
};

/**
 * Mark a lesson as completed
 */
export const markLessonCompleted = async (req: AuthRequest, res: Response) => {
    try {
        const { lessonId } = req.params;
        const { timeSpent, watchTimeVideo, notes } = req.body;
        const studentId = req.user?.id;

        if (!Types.ObjectId.isValid(lessonId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid lesson ID'
            });
        }

        // Get lesson details
        const lesson = await ProgrammeLesson.findById(lessonId)
            .populate({
                path: 'moduleId',
                populate: { path: 'programmeId' }
            }) as PopulatedProgrammeLesson | null;

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        const moduleData = lesson.moduleId;
        const moduleId = moduleData._id;
        const programmeId = ((moduleData.programmeId as any)?._id || moduleData.programmeId).toString();

        // Start transaction for atomic operation
        const session = await UserCourseProgress.startSession();
        session.startTransaction();

        try {
            // Find or create progress record
            let progressRecord = await UserCourseProgress.findOne({
                studentId,
                programmeId,
                moduleId,
                lessonId
            }).session(session);

            if (!progressRecord) {
                progressRecord = new UserCourseProgress({
                    studentId,
                    programmeId,
                    moduleId,
                    lessonId,
                    status: 'COMPLETED',
                    progressPercentage: 100,
                    timeSpent: timeSpent || 0,
                    startedAt: new Date(),
                    completedAt: new Date(),
                    lastAccessedAt: new Date(),
                    attempts: 1,
                    watchTimeVideo: watchTimeVideo || 0,
                    notes: notes || '',
                    isRequired: true
                });
            } else {
                await progressRecord.markAsCompleted(timeSpent || 0);
                if (watchTimeVideo) progressRecord.watchTimeVideo = (progressRecord.watchTimeVideo || 0) + watchTimeVideo;
                if (notes) progressRecord.notes = notes;
            }

            await progressRecord.save({ session });

            // Update enrollment progress
            const enrollment = await Enrollment.findOne({
                studentId,
                programmeId
            }).session(session);

            if (enrollment) {
                // Check if lesson already in completed list
                const lessonIndex = enrollment.progress.completedLessons.findIndex(
                    (id: any) => id.toString() === lessonId
                );
                
                if (lessonIndex === -1) {
                    enrollment.progress.completedLessons.push(lessonId as any);
                }
                
                // Update total time spent
                enrollment.progress.timeSpent += timeSpent || 0;
                
                // Recalculate total progress
                const totalLessons = await ProgrammeLesson.countDocuments({
                    moduleId: { $in: await ProgrammeModule.find({ programmeId }).distinct('_id') }
                });
                
                enrollment.progress.totalProgress = (enrollment.progress.completedLessons.length / totalLessons) * 100;
                
                await enrollment.save({ session });
            }

            await session.commitTransaction();

            // Update analytics after successful completion
            try {
                const points = 10; // Base points for lesson completion
                await AnalyticsService.updateAnalyticsOnLessonCompletion(
                    studentId,
                    lessonId,
                    (programmeId as any).toString(),
                    timeSpent || 0,
                    points
                );
            } catch (analyticsError) {
                console.error('Error updating analytics:', analyticsError);
                // Don't fail the main operation if analytics update fails
            }

            res.status(200).json({
                success: true,
                message: 'Lesson marked as completed successfully',
                data: {
                    progressRecord,
                    lessonTitle: lesson.title,
                    moduleTitle: moduleData.title,
                    completionPercentage: enrollment?.progress.totalProgress || 0
                }
            });

        } catch (transactionError) {
            await session.abortTransaction();
            throw transactionError;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Error marking lesson as completed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark lesson as completed',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

/**
 * Update lesson progress (for partial completion)
 */
export const updateLessonProgress = async (req: AuthRequest, res: Response) => {
    try {
        const { lessonId } = req.params;
        const { progressPercentage, timeSpent, watchTimeVideo, notes } = req.body;
        const studentId = req.user?.id;

        if (!Types.ObjectId.isValid(lessonId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid lesson ID'
            });
        }

        if (progressPercentage < 0 || progressPercentage > 100) {
            return res.status(400).json({
                success: false,
                message: 'Progress percentage must be between 0 and 100'
            });
        }

        // Get lesson details
        const lesson = await ProgrammeLesson.findById(lessonId)
            .populate({
                path: 'moduleId',
                populate: { path: 'programmeId' }
            }) as PopulatedProgrammeLesson | null;

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        const moduleData = lesson.moduleId;
        const moduleId = moduleData._id;
        const programmeId = moduleData.programmeId._id;

        // Find or create progress record
        let progressRecord = await UserCourseProgress.findOne({
            studentId,
            programmeId,
            moduleId,
            lessonId
        });

        if (!progressRecord) {
            progressRecord = new UserCourseProgress({
                studentId,
                programmeId,
                moduleId,
                lessonId,
                status: progressPercentage >= 100 ? 'COMPLETED' : progressPercentage > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
                progressPercentage,
                timeSpent: timeSpent || 0,
                startedAt: progressPercentage > 0 ? new Date() : undefined,
                completedAt: progressPercentage >= 100 ? new Date() : undefined,
                lastAccessedAt: new Date(),
                attempts: progressPercentage > 0 ? 1 : 0,
                watchTimeVideo: watchTimeVideo || 0,
                notes: notes || '',
                isRequired: true
            });
        } else {
            await progressRecord.updateProgress(progressPercentage, timeSpent || 0, watchTimeVideo || 0);
            
            if (progressPercentage >= 100 && progressRecord.status !== 'COMPLETED') {
                progressRecord.status = 'COMPLETED';
                progressRecord.completedAt = new Date();
            } else if (progressPercentage > 0 && progressRecord.status === 'NOT_STARTED') {
                progressRecord.status = 'IN_PROGRESS';
                progressRecord.startedAt = new Date();
                progressRecord.attempts += 1;
            }
            
            if (notes) progressRecord.notes = notes;
        }

        await progressRecord.save();

        res.status(200).json({
            success: true,
            message: 'Lesson progress updated successfully',
            data: {
                progressRecord,
                lessonTitle: lesson.title,
                moduleTitle: (lesson.moduleId as any).title
            }
        });

    } catch (error) {
        console.error('Error updating lesson progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update lesson progress',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

/**
 * Record quiz/assessment results
 */
export const recordQuizResult = async (req: AuthRequest, res: Response) => {
    try {
        const { lessonId } = req.params;
        const { 
            quizId, 
            score, 
            maxScore, 
            passingScore, 
            timeSpent, 
            answers,
            feedback 
        } = req.body;
        const studentId = req.user?.id;

        if (!Types.ObjectId.isValid(lessonId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid lesson ID'
            });
        }

        // Get lesson details
        const lesson = await ProgrammeLesson.findById(lessonId)
            .populate({
                path: 'moduleId',
                populate: { path: 'programmeId' }
            }) as PopulatedProgrammeLesson | null;

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        const moduleData = lesson.moduleId;
        const moduleId = moduleData._id;
        const programmeId = moduleData.programmeId._id;

        // Calculate percentage and pass status
        const percentage = (score / maxScore) * 100;
        const isPassed = percentage >= passingScore;

        // Get current attempt number
        const previousAttempts = await QuizResult.countDocuments({
            studentId,
            lessonId,
            quizId: quizId || 'default'
        });

        // Start transaction
        const session = await QuizResult.startSession();
        session.startTransaction();

        try {
            // Create quiz result
            const quizResult = new QuizResult({
                studentId,
                programmeId,
                moduleId,
                lessonId,
                quizId: quizId || 'default',
                score,
                maxScore,
                percentage,
                passingScore,
                isPassed,
                timeSpent: timeSpent || 0,
                startedAt: new Date(Date.now() - (timeSpent || 0) * 60000), // Estimate start time
                completedAt: new Date(),
                attempt: previousAttempts + 1,
                answers: answers || [],
                feedback: feedback || ''
            });

            await quizResult.save({ session });

            // If quiz passed, update lesson progress
            if (isPassed) {
                let progressRecord = await UserCourseProgress.findOne({
                    studentId,
                    programmeId,
                    moduleId,
                    lessonId
                }).session(session);

                if (!progressRecord) {
                    progressRecord = new UserCourseProgress({
                        studentId,
                        programmeId,
                        moduleId,
                        lessonId,
                        status: 'COMPLETED',
                        progressPercentage: 100,
                        timeSpent: timeSpent || 0,
                        startedAt: new Date(),
                        completedAt: new Date(),
                        lastAccessedAt: new Date(),
                        attempts: 1,
                        isRequired: true
                    });
                } else if (progressRecord.status !== 'COMPLETED') {
                    await progressRecord.markAsCompleted(timeSpent || 0);
                }

                await progressRecord.save({ session });
            }

            await session.commitTransaction();

            res.status(200).json({
                success: true,
                message: 'Quiz result recorded successfully',
                data: {
                    quizResult,
                    lessonTitle: lesson.title,
                    moduleTitle: (lesson.moduleId as any).title,
                    passed: isPassed,
                    attemptNumber: previousAttempts + 1
                }
            });

        } catch (transactionError) {
            await session.abortTransaction();
            throw transactionError;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Error recording quiz result:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record quiz result',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

/**
 * Get detailed progress for a specific course
 */
export const getCourseProgressDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { programmeId } = req.params;
        const studentId = req.user?.id;

        if (!Types.ObjectId.isValid(programmeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid programme ID'
            });
        }

        // Get course structure
        const programme = await Programme.findById(programmeId);

        if (!programme) {
            return res.status(404).json({
                success: false,
                message: 'Programme not found'
            });
        }

        // Get modules for this programme
        const modules = await ProgrammeModule.find({ programmeId })
            .populate({
                path: 'lessons',
                select: 'title description duration type isRequired estimatedTime'
            })
            .sort({ orderIndex: 1 });

        // Get all lesson progress for this student and course
        const progressRecords = await UserCourseProgress.find({
            studentId,
            programmeId
        }).populate('lessonId moduleId');

        // Get quiz results
        const quizResults = await QuizResult.find({
            studentId,
            programmeId
        }).populate('lessonId');

        // Build detailed progress structure
        const moduleProgress = await Promise.all(
            modules.map(async (module: any) => {
                // Get lessons for this module
                const lessons = await ProgrammeLesson.find({ moduleId: module._id })
                    .select('title description duration type isRequired estimatedTime')
                    .sort({ orderIndex: 1 });

                const moduleLessons = await Promise.all(
                    lessons.map(async (lesson: any) => {
                        const progress = progressRecords.find(
                            p => {
                                if (!p.lessonId) return false;
                                // Check if lessonId is populated (has _id property) or is just ObjectId
                                const lessonIdStr = (p.lessonId as any)._id 
                                    ? (p.lessonId as any)._id.toString() 
                                    : p.lessonId.toString();
                                return lessonIdStr === lesson._id.toString();
                            }
                        );
                        
                        const quizzes = quizResults.filter(
                            q => {
                                if (!q.lessonId) return false;
                                // Check if lessonId is populated (has _id property) or is just ObjectId
                                const lessonIdStr = (q.lessonId as any)._id
                                    ? (q.lessonId as any)._id.toString()
                                    : q.lessonId.toString();
                                return lessonIdStr === lesson._id.toString();
                            }
                        );

                        const bestQuizScore = quizzes.length > 0 
                            ? Math.max(...quizzes.map(q => q.percentage))
                            : null;

                        return {
                            lesson: {
                                id: lesson._id,
                                title: lesson.title,
                                description: lesson.description,
                                duration: lesson.duration,
                                type: lesson.type,
                                isRequired: lesson.isRequired,
                                estimatedTime: lesson.estimatedTime
                            },
                            progress: {
                                status: progress?.status || 'NOT_STARTED',
                                progressPercentage: progress?.progressPercentage || 0,
                                timeSpent: progress?.timeSpent || 0,
                                watchTimeVideo: progress?.watchTimeVideo || 0,
                                startedAt: progress?.startedAt,
                                completedAt: progress?.completedAt,
                                lastAccessedAt: progress?.lastAccessedAt,
                                attempts: progress?.attempts || 0,
                                bookmarked: progress?.bookmarked || false,
                                notes: progress?.notes || ''
                            },
                            quiz: {
                                hasQuiz: quizzes.length > 0,
                                bestScore: bestQuizScore,
                                totalAttempts: quizzes.length,
                                passed: quizzes.some(q => q.isPassed)
                            }
                        };
                    })
                );

                // Calculate module statistics
                const totalLessons = moduleLessons.length;
                const completedLessons = moduleLessons.filter(l => l.progress.status === 'COMPLETED').length;
                const moduleProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
                const totalTimeSpent = moduleLessons.reduce((sum, l) => sum + l.progress.timeSpent, 0);

                return {
                    module: {
                        id: module._id,
                        title: module.title,
                        description: module.description,
                        order: module.order
                    },
                    progress: {
                        progressPercentage: Math.round(moduleProgress * 100) / 100,
                        completedLessons,
                        totalLessons,
                        totalTimeSpent
                    },
                    lessons: moduleLessons
                };
            })
        );

        // Calculate overall course statistics
        const totalLessons = moduleProgress.reduce((sum: number, m: any) => sum + m.progress.totalLessons, 0);
        const completedLessons = moduleProgress.reduce((sum: number, m: any) => sum + m.progress.completedLessons, 0);
        const totalTimeSpent = moduleProgress.reduce((sum: number, m: any) => sum + m.progress.totalTimeSpent, 0);
        const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        // Get enrollment info for tracking status
        const enrollment = await Enrollment.findOne({ studentId, programmeId });
        const enrollmentDate = enrollment?.enrollmentDate || new Date();
        const daysElapsed = Math.floor((Date.now() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate expected progress (assuming linear progression over course duration)
        const courseDuration = programme.estimatedDuration || 30; // days
        const expectedProgress = Math.min(100, (daysElapsed / courseDuration) * 100);
        const deviation = overallProgress - expectedProgress;
        
        let trackingStatus: 'ON_TRACK' | 'BEHIND' | 'AHEAD' = 'ON_TRACK';
        if (deviation < -10) trackingStatus = 'BEHIND';
        else if (deviation > 10) trackingStatus = 'AHEAD';

        res.status(200).json({
            success: true,
            data: {
                course: {
                    id: programme._id,
                    title: programme.title,
                    description: programme.description,
                    estimatedDuration: programme.estimatedDuration
                },
                enrollment: {
                    enrollmentDate,
                    daysElapsed,
                    status: enrollment?.status || 'ACTIVE'
                },
                overview: {
                    overallProgress: Math.round(overallProgress * 100) / 100,
                    completedLessons,
                    totalLessons,
                    totalTimeSpent,
                    expectedProgress: Math.round(expectedProgress * 100) / 100,
                    deviation: Math.round(deviation * 100) / 100,
                    trackingStatus
                },
                modules: moduleProgress
            }
        });

    } catch (error) {
        console.error('Error fetching course progress details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch course progress details',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

/**
 * Get comprehensive progress dashboard for a student
 */
export const getProgressDashboard = async (req: AuthRequest, res: Response) => {
    try {
        console.log('getProgressDashboard called with studentId:', req.params.studentId);
        const { studentId } = req.params;
        const userId = req.user?.id;

        // Ensure user can only access their own data or has admin privileges
        if (userId !== studentId && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (!Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid student ID'
            });
        }

        // Get all enrollments for the student
        console.log('Fetching enrollments for studentId:', studentId);
        const enrollments = await Enrollment.find({ studentId })
            .populate('programmeId', 'title category durationDays totalLessons')
            .lean();
        console.log('Found enrollments:', enrollments.length);

        // Get lesson completions
        console.log('Fetching lesson completions for userId:', studentId);
        const allCompletions = await LessonCompletion.find({ userId: studentId }).lean();
        console.log('Found lesson completions:', allCompletions.length);

        // Get quiz results
        const quizResults = await QuizResult.find({ studentId: studentId }).lean();

        // Calculate dashboard metrics
        const enrolledCoursesCount = enrollments.length;
        const completedCoursesCount = enrollments.filter(e => e.status === 'COMPLETED').length;
        
        // Calculate overall progress
        let totalProgress = 0;
        let upcomingDeadlines: Array<{
            courseTitle: string;
            daysLeft: number;
            expectedDate: Date;
        }> = [];
        let totalStudyTime = 0;

        const courseProgressList = enrollments
          .map(enrollment => {
            const programme = enrollment.programmeId as any;
            if (!programme) {
              console.warn('Programme not found for enrollment', enrollment._id);
              return null;
            }
            const courseCompletions = allCompletions.filter(c => c.courseId.toString() === (programme && programme._id ? programme._id.toString() : ''));
            const actualProgress = (courseCompletions.length / (programme.totalLessons || 1)) * 100;
            totalProgress += actualProgress;

            // Calculate study time from completions
            const courseStudyTime = courseCompletions.reduce((sum, c) => sum + (c.timeSpent || 0), 0);
            totalStudyTime += courseStudyTime;

            // Calculate expected completion date
            const enrollmentDate = new Date(enrollment.enrollmentDate);
            const expectedCompletionDate = new Date(enrollmentDate.getTime() + (programme.durationDays || 30) * 24 * 60 * 60 * 1000);

            // Check if deadline is within next 7 days
            const now = new Date();
            const daysUntilDeadline = Math.ceil((expectedCompletionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntilDeadline <= 7 && daysUntilDeadline > 0 && enrollment.status !== 'COMPLETED') {
              upcomingDeadlines.push({
                courseTitle: programme.title,
                daysLeft: daysUntilDeadline,
                expectedDate: expectedCompletionDate
              });
            }

            return {
              courseId: programme._id,
              title: programme.title,
              progress: Math.round(actualProgress),
              status: enrollment.status,
              category: programme.category
            };
          })
          .filter(Boolean);

        const overallProgress = enrollments.length > 0 ? totalProgress / enrollments.length : 0;

        // Calculate learning streaks (simplified - consecutive days with lesson completions)
        const sortedCompletions = allCompletions
            .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
        
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let lastDate = null;

        for (const completion of sortedCompletions) {
            const completionDate = new Date(completion.completedAt);
            const dateString = completionDate.toDateString();
            
            if (lastDate === null) {
                tempStreak = 1;
            } else {
                const daysDiff = (new Date(dateString).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24);
                if (daysDiff === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
            lastDate = dateString;
        }
        
        longestStreak = Math.max(longestStreak, tempStreak);
        
        // Check if streak continues to today
        if (lastDate) {
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
            if (lastDate === today || lastDate === yesterday) {
                currentStreak = tempStreak;
            }
        }

        const dashboardData = {
            studentId,
            metrics: {
                enrolledCoursesCount,
                completedCoursesCount,
                overallProgress: Math.round(overallProgress),
                totalStudyTimeHours: Math.round(totalStudyTime / 60), // Convert minutes to hours
                currentStreak,
                longestStreak,
                totalQuizzes: quizResults.length,
                averageQuizScore: quizResults.length > 0 ? 
                    Math.round(quizResults.reduce((sum, q) => sum + (q.score / q.maxScore * 100), 0) / quizResults.length) : 0
            },
            courses: courseProgressList,
            upcomingDeadlines: upcomingDeadlines.sort((a, b) => a.daysLeft - b.daysLeft),
            recentActivity: sortedCompletions.slice(-10).reverse().map(completion => ({
                type: 'lesson_completion',
                courseId: completion.courseId,
                lessonId: completion.lessonId,
                completedAt: completion.completedAt,
                timeSpent: completion.timeSpent
            }))
        };

        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Error getting progress dashboard:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard data',
            error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
        });
    }
};

/**
 * Get smart progress calculation for a user's course with deviation tracking
 */
export const getUserSmartProgress = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid course ID'
            });
        }

        // Get enrollment
        const enrollment = await Enrollment.findOne({ 
            studentId: userId, 
            programmeId: courseId 
        }).lean();

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        // Get course details with duration
        const programme = await Programme.findById(courseId).lean();
        if (!programme) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Get lesson completions
        const completions = await LessonCompletion.find({
            userId,
            courseId
        }).lean();

        // Calculate smart progress metrics
        const enrollmentDate = new Date(enrollment.enrollmentDate);
        const now = new Date();
        const daysElapsed = Math.floor((now.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const totalLessons = programme.totalLessons || 1;
        const totalCourseDays = programme.durationDays || 30;
        const lessonsCompleted = completions.length;

        // Smart progress formulas
        const actualProgress = (lessonsCompleted / totalLessons) * 100;
        const expectedProgress = Math.min(100, (daysElapsed / totalCourseDays) * 100);
        const deviation = actualProgress - expectedProgress;

        // Deviation labels
        let label: string;
        if (deviation > 5) {
            label = 'Ahead';
        } else if (deviation < -5) {
            label = 'Behind';
        } else {
            label = 'On Track';
        }

        const progressData = {
            courseId,
            courseName: programme.title,
            totalLessons,
            lessonsCompleted,
            daysElapsed,
            totalCourseDays,
            actualProgress: Math.round(actualProgress * 100) / 100,
            expectedProgress: Math.round(expectedProgress * 100) / 100,
            deviation: Math.round(deviation * 100) / 100,
            label,
            enrollmentDate: enrollment.enrollmentDate,
            lastActivity: completions.length > 0 ? 
                completions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0].completedAt : 
                enrollment.enrollmentDate
        };

        res.status(200).json({
            success: true,
            data: progressData
        });
    } catch (error) {
        console.error('Error getting smart progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve smart progress data'
        });
    }
};

/**
 * Get quiz results for a specific lesson
 */
export const getQuizResults = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, lessonId } = req.params;
        const userId = req.user?.id;

        // Ensure user can only access their own data or has admin privileges
        if (userId !== studentId && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (!Types.ObjectId.isValid(studentId) || !Types.ObjectId.isValid(lessonId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid student ID or lesson ID'
            });
        }

        // Get lesson details
        const lesson = await ProgrammeLesson.findById(lessonId)
            .populate({
                path: 'moduleId',
                populate: { path: 'programmeId' }
            }) as PopulatedProgrammeLesson | null;

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        // Get all quiz results for this student and lesson
        const quizResults = await QuizResult.find({
            studentId,
            lessonId
        }).sort({ completedAt: -1 }); // Most recent first

        if (!quizResults || quizResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No quiz results found for this lesson'
            });
        }

        // Calculate statistics
        const bestScore = Math.max(...quizResults.map(q => q.percentage));
        const averageScore = quizResults.reduce((sum, q) => sum + q.percentage, 0) / quizResults.length;
        const totalAttempts = quizResults.length;
        const hasPassed = quizResults.some(q => q.isPassed);
        const latestAttempt = quizResults[0]; // Most recent due to sorting

        const quizStats = {
            lesson: {
                id: lesson._id,
                title: lesson.title,
                moduleTitle: lesson.moduleId.title,
                programmeTitle: lesson.moduleId.programmeId.title
            },
            statistics: {
                totalAttempts,
                bestScore: Math.round(bestScore * 100) / 100,
                averageScore: Math.round(averageScore * 100) / 100,
                hasPassed,
                latestScore: latestAttempt.percentage,
                latestAttemptDate: latestAttempt.completedAt
            },
            attempts: quizResults.map(result => ({
                attemptNumber: result.attempt,
                score: result.score,
                maxScore: result.maxScore,
                percentage: Math.round(result.percentage * 100) / 100,
                isPassed: result.isPassed,
                timeSpent: result.timeSpent,
                completedAt: result.completedAt,
                feedback: result.feedback || '',
                quizId: result.quizId
            }))
        };

        res.status(200).json({
            success: true,
            data: quizStats
        });

    } catch (error) {
        console.error('Error getting quiz results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve quiz results',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

