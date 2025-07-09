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
import LessonCompletion from '../models/LessonCompletion';

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
        const enrollments = await Enrollment.find({ studentId })
            .populate('programmeId', 'title category durationDays totalLessons')
            .lean();

        // Get lesson completions
        const allCompletions = await LessonCompletion.find({ userId: studentId }).lean();

        // Get quiz results
        const quizResults = await QuizResult.find({ userId: studentId }).lean();

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

        const courseProgressList = enrollments.map(enrollment => {
            const programme = enrollment.programmeId as any;
            const courseCompletions = allCompletions.filter(c => c.courseId.toString() === programme._id.toString());
            
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
        });

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
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard data'
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

