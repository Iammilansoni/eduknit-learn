import { Response, Request } from 'express';
import { Types } from 'mongoose';
import Enrollment from '../models/Enrollment';
import UserCourseProgress from '../models/UserCourseProgress';
import QuizResult from '../models/QuizResult';
import Programme from '../models/Programme';
import ProgrammeLesson from '../models/ProgrammeLesson';
import ProgrammeModule from '../models/ProgrammeModule';
import { AuthRequest } from '../middleware/auth';
import ProgressService from '../services/progressService';

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
        const { studentId, programmeId, moduleId, lessonId, timeSpent = 0 } = req.body;

        // Validate required fields
        if (!studentId || !programmeId || !moduleId || !lessonId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: studentId, programmeId, moduleId, lessonId'
            });
        }

        // Validate ObjectIds
        const objectIds = [studentId, programmeId, moduleId, lessonId];
        if (!objectIds.every(id => Types.ObjectId.isValid(id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format'
            });
        }

        // Check if enrollment exists
        const enrollment = await Enrollment.findOne({ studentId, programmeId });
        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        // Check if lesson exists
        const lesson = await ProgrammeLesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        // Update or create lesson progress
        const lessonProgress = await UserCourseProgress.findOneAndUpdate(
            { studentId, programmeId, moduleId, lessonId },
            {
                studentId,
                programmeId,
                moduleId,
                lessonId,
                status: 'COMPLETED',
                progressPercentage: 100,
                completedAt: new Date(),
                lastAccessedAt: new Date(),
                $inc: { timeSpent: timeSpent },
                isRequired: lesson.isRequired
            },
            { upsert: true, new: true }
        );

        // Update enrollment progress
        if (!enrollment.progress.completedLessons.includes(lessonId)) {
            enrollment.progress.completedLessons.push(lessonId);
            enrollment.progress.timeSpent += timeSpent;
            enrollment.progress.lastActivityDate = new Date();

            // Recalculate total progress
            const programme = await Programme.findById(programmeId);
            if (programme) {
                const completionPercentage = (enrollment.progress.completedLessons.length / programme.totalLessons) * 100;
                enrollment.progress.totalProgress = Math.round(completionPercentage);

                // Mark course as completed if 100%
                if (completionPercentage >= 100 && enrollment.status === 'ACTIVE') {
                    enrollment.status = 'COMPLETED';
                    enrollment.completionDate = new Date();
                }
            }

            await enrollment.save();
        }

        res.status(200).json({
            success: true,
            message: 'Lesson marked as completed successfully',
            data: {
                lessonProgress,
                enrollmentProgress: {
                    totalProgress: enrollment.progress.totalProgress,
                    completedLessons: enrollment.progress.completedLessons.length,
                    status: enrollment.status
                }
            }
        });
    } catch (error) {
        console.error('Error marking lesson as completed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark lesson as completed'
        });
    }
};

/**
 * Update lesson progress (for partial completion)
 */
export const updateLessonProgress = async (req: AuthRequest, res: Response) => {
    try {
        const {
            studentId,
            programmeId,
            moduleId,
            lessonId,
            progressPercentage,
            timeSpent = 0,
            watchTimeVideo = 0
        } = req.body;

        // Validate required fields
        if (!studentId || !programmeId || !moduleId || !lessonId || progressPercentage === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate progress percentage
        if (progressPercentage < 0 || progressPercentage > 100) {
            return res.status(400).json({
                success: false,
                message: 'Progress percentage must be between 0 and 100'
            });
        }

        // Update or create lesson progress
        const lessonProgress = await UserCourseProgress.findOneAndUpdate(
            { studentId, programmeId, moduleId, lessonId },
            {
                $set: {
                    progressPercentage,
                    lastAccessedAt: new Date(),
                    status: progressPercentage === 0 ? 'NOT_STARTED' : 
                           progressPercentage === 100 ? 'COMPLETED' : 'IN_PROGRESS'
                },
                $inc: {
                    timeSpent: timeSpent,
                    watchTimeVideo: watchTimeVideo
                }
            },
            { upsert: true, new: true }
        );

        // If lesson is completed, trigger completion logic
        if (progressPercentage === 100) {
            await lessonProgress.markAsCompleted(timeSpent);
        }

        res.status(200).json({
            success: true,
            message: 'Lesson progress updated successfully',
            data: lessonProgress
        });
    } catch (error) {
        console.error('Error updating lesson progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update lesson progress'
        });
    }
};

/**
 * Record quiz/assessment results
 */
export const recordQuizResults = async (req: AuthRequest, res: Response) => {
    try {
        const {
            studentId,
            programmeId,
            moduleId,
            lessonId,
            quizId,
            score,
            maxScore,
            timeSpent,
            answers,
            passingScore = 70
        } = req.body;

        // Validate required fields
        if (!studentId || !programmeId || !moduleId || !lessonId || 
            score === undefined || !maxScore || !timeSpent || !answers) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields for quiz result'
            });
        }

        // Get existing attempts
        const existingAttempts = await QuizResult.countDocuments({
            studentId,
            lessonId
        });

        // Calculate percentage and pass status
        const percentage = Math.round((score / maxScore) * 100);
        const isPassed = percentage >= passingScore;

        // Create quiz result
        const quizResult = new QuizResult({
            studentId,
            programmeId,
            moduleId,
            lessonId,
            quizId,
            score,
            maxScore,
            percentage,
            passingScore,
            isPassed,
            timeSpent,
            startedAt: new Date(Date.now() - (timeSpent * 60 * 1000)), // Approximate start time
            completedAt: new Date(),
            attempt: existingAttempts + 1,
            answers
        });

        await quizResult.save();

        // If quiz is passed, mark lesson as completed
        if (isPassed) {
            await markLessonCompleted(
                {
                    ...req,
                    body: { studentId, programmeId, moduleId, lessonId, timeSpent }
                } as AuthRequest,
                res
            );
            return; // markLessonCompleted will send response
        }

        res.status(200).json({
            success: true,
            message: 'Quiz results recorded successfully',
            data: {
                quizResult,
                isPassed,
                percentage,
                attempt: quizResult.attempt
            }
        });
    } catch (error) {
        console.error('Error recording quiz results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record quiz results'
        });
    }
};

/**
 * Get quiz results for a lesson
 */
export const getQuizResults = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, lessonId } = req.params;

        if (!Types.ObjectId.isValid(studentId) || !Types.ObjectId.isValid(lessonId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid student ID or lesson ID'
            });
        }

        const quizResults = await QuizResult.find({ studentId, lessonId })
            .sort({ attempt: -1 })
            .lean();

        const bestAttempt = await QuizResult.getBestAttempt(studentId, lessonId);

        res.status(200).json({
            success: true,
            data: {
                attempts: quizResults,
                bestAttempt,
                totalAttempts: quizResults.length
            }
        });
    } catch (error) {
        console.error('Error getting quiz results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve quiz results'
        });
    }
};

/**
 * Get comprehensive progress dashboard for a student
 */
export const getProgressDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId } = req.params;

        // Validate studentId
        if (!Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid student ID'
            });
        }

        // Check if user is authorized to view this data
        if (req.user?.id !== studentId && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const dashboardData = await ProgressService.getProgressDashboard(studentId);

        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Error getting progress dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve progress dashboard'
        });
    }
};

/**
 * Get detailed analytics for a specific course
 */
export const getCourseAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, programmeId } = req.params;

        // Validate IDs
        if (!Types.ObjectId.isValid(studentId) || !Types.ObjectId.isValid(programmeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid student ID or programme ID'
            });
        }

        const courseData = await ProgressService.getCourseProgressData(studentId, programmeId);

        res.status(200).json({
            success: true,
            data: courseData
        });
    } catch (error) {
        console.error('Error getting course analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve course analytics'
        });
    }
};

/**
 * Get the next module to complete based on current progress and prerequisites
 */
export const getNextModule = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, programmeId } = req.params;

        // Validate IDs
        if (!Types.ObjectId.isValid(studentId) || !Types.ObjectId.isValid(programmeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid student ID or programme ID'
            });
        }

        // Get student's enrollment
        const enrollment = await Enrollment.findOne({
            studentId,
            programmeId,
            status: { $in: ['ACTIVE', 'IN_PROGRESS'] }
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Student not enrolled in this programme'
            });
        }

        // Get all modules for the programme
        const modules = await ProgrammeModule.find({
            programmeId,
            isActive: true
        }).sort({ orderIndex: 1 }).populate('prerequisites');

        // Get completed modules
        const completedLessons = await UserCourseProgress.find({
            studentId,
            programmeId,
            status: 'COMPLETED'
        }).populate('moduleId');

        const completedModuleIds = new Set();
        completedLessons.forEach(progress => {
            if (progress.moduleId) {
                completedModuleIds.add((progress.moduleId as any)._id.toString());
            }
        });

        // Find next module based on prerequisites and completion status
        let nextModule = null;
        for (const module of modules) {
            const moduleId = (module._id as Types.ObjectId).toString();
            
            // Skip if already completed
            if (completedModuleIds.has(moduleId)) {
                continue;
            }

            // Check if all prerequisites are met
            const prerequisitesComplete = module.prerequisites.every(prereqId => 
                completedModuleIds.has(prereqId.toString())
            );

            if (prerequisitesComplete) {
                // Get lessons count for this module
                const lessonsInModule = await ProgrammeLesson.countDocuments({
                    moduleId: module._id,
                    isActive: true
                });

                // Get completed lessons in this module
                const completedLessonsInModule = await UserCourseProgress.countDocuments({
                    studentId,
                    moduleId: module._id,
                    status: 'COMPLETED'
                });

                const moduleProgress = lessonsInModule > 0 ? 
                    (completedLessonsInModule / lessonsInModule) * 100 : 0;

                nextModule = {
                    id: module._id,
                    title: module.title,
                    description: module.description,
                    estimatedDuration: module.estimatedDuration,
                    dueDate: module.dueDate,
                    orderIndex: module.orderIndex,
                    totalLessons: lessonsInModule,
                    completedLessons: completedLessonsInModule,
                    progress: Math.round(moduleProgress),
                    isStarted: completedLessonsInModule > 0
                };
                break;
            }
        }

        if (!nextModule) {
            // All modules completed or no available modules
            const totalModules = modules.length;
            const completedModules = Array.from(completedModuleIds).length;

            return res.json({
                success: true,
                data: {
                    nextModule: null,
                    allCompleted: completedModules === totalModules,
                    totalModules,
                    completedModules,
                    message: completedModules === totalModules ? 
                        'Congratulations! You have completed all modules.' :
                        'No modules available to start. Please check prerequisites.'
                }
            });
        }

        res.json({
            success: true,
            data: {
                nextModule,
                allCompleted: false
            }
        });

    } catch (error) {
        console.error('Error fetching next module:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get learning statistics and history for a student
 */
export const getLearningStatistics = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId } = req.params;
        const { programmeId, timeframe = '30' } = req.query;

        // Validate studentId
        if (!Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid student ID'
            });
        }

        const days = parseInt(timeframe as string) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        let matchCriteria: any = {
            studentId: new Types.ObjectId(studentId),
            lastAccessedAt: { $gte: startDate }
        };

        if (programmeId && Types.ObjectId.isValid(programmeId as string)) {
            matchCriteria.programmeId = new Types.ObjectId(programmeId as string);
        }

        // Aggregate statistics
        const stats = await UserCourseProgress.aggregate([
            { $match: matchCriteria },
            {
                $group: {
                    _id: null,
                    totalLessonsCompleted: {
                        $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
                    },
                    totalTimeSpent: { $sum: '$timeSpent' }, // in minutes
                    totalLessonsStarted: {
                        $sum: { $cond: [{ $in: ['$status', ['IN_PROGRESS', 'COMPLETED']] }, 1, 0] }
                    },
                    averageProgress: { $avg: '$progressPercentage' },
                    totalAttempts: { $sum: '$attempts' }
                }
            }
        ]);

        // Get daily activity for the chart
        const dailyActivity = await UserCourseProgress.aggregate([
            { $match: matchCriteria },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$lastAccessedAt' } }
                    },
                    lessonsCompleted: {
                        $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
                    },
                    timeSpent: { $sum: '$timeSpent' },
                    uniqueLessons: { $addToSet: '$lessonId' }
                }
            },
            {
                $project: {
                    date: '$_id.date',
                    lessonsCompleted: 1,
                    timeSpent: 1,
                    uniqueLessonsCount: { $size: '$uniqueLessons' }
                }
            },
            { $sort: { date: 1 } }
        ]);

        // Get course-wise breakdown if no specific programme
        let courseBreakdown = [];
        if (!programmeId) {
            courseBreakdown = await UserCourseProgress.aggregate([
                { 
                    $match: { 
                        studentId: new Types.ObjectId(studentId),
                        lastAccessedAt: { $gte: startDate }
                    } 
                },
                {
                    $group: {
                        _id: '$programmeId',
                        completedLessons: {
                            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
                        },
                        totalTimeSpent: { $sum: '$timeSpent' },
                        averageProgress: { $avg: '$progressPercentage' }
                    }
                },
                {
                    $lookup: {
                        from: 'programmes',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'programme'
                    }
                },
                {
                    $project: {
                        programmeTitle: { $arrayElemAt: ['$programme.title', 0] },
                        completedLessons: 1,
                        totalTimeSpent: 1,
                        averageProgress: { $round: ['$averageProgress', 2] }
                    }
                }
            ]);
        }

        const defaultStats = {
            totalLessonsCompleted: 0,
            totalTimeSpent: 0,
            totalLessonsStarted: 0,
            averageProgress: 0,
            totalAttempts: 0
        };

        const result = stats.length > 0 ? stats[0] : defaultStats;

        res.json({
            success: true,
            data: {
                summary: {
                    totalLessonsCompleted: result.totalLessonsCompleted,
                    totalTimeSpent: Math.round(result.totalTimeSpent), // minutes
                    totalHoursSpent: Math.round((result.totalTimeSpent / 60) * 100) / 100, // hours
                    totalLessonsStarted: result.totalLessonsStarted,
                    averageProgress: Math.round(result.averageProgress * 100) / 100,
                    totalAttempts: result.totalAttempts,
                    timeframe: days
                },
                dailyActivity,
                courseBreakdown: programmeId ? [] : courseBreakdown
            }
        });

    } catch (error) {
        console.error('Error fetching learning statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

