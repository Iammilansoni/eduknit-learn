import { Request, Response } from 'express';
import { Types } from 'mongoose';
import ProgrammeLesson from '../models/ProgrammeLesson';
import QuizAttempt from '../models/QuizAttempt';
import Enrollment from '../models/Enrollment';
import LessonCompletion from '../models/LessonCompletion';
import logger from '../config/logger';

// Helper function to calculate grade letter
const calculateGradeLetter = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
};

/**
 * Get quiz for a lesson
 * @route GET /api/quiz/lesson/:lessonId
 * @access Private (Student)
 */
export const getLessonQuiz = async (req: Request, res: Response): Promise<void> => {
    try {
        const { lessonId } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        if (!Types.ObjectId.isValid(lessonId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid lesson ID'
            });
            return;
        }

        // Get lesson with quiz data
        const lesson = await ProgrammeLesson.findById(lessonId).populate('moduleId programmeId');
        
        if (!lesson || !lesson.isActive) {
            res.status(404).json({
                success: false,
                message: 'Lesson not found or not active'
            });
            return;
        }

        // Check if lesson has a quiz
        const quizData = lesson.quiz || lesson.content?.quiz;
        if (!quizData || !quizData.questions || quizData.questions.length === 0) {
            res.status(404).json({
                success: false,
                message: 'No quiz found for this lesson'
            });
            return;
        }

        // Check if user is enrolled in the course
        const enrollment = await Enrollment.findOne({
            studentId: userId,
            programmeId: lesson.programmeId,
            status: { $in: ['ENROLLED', 'ACTIVE'] }
        });

        if (!enrollment) {
            res.status(403).json({
                success: false,
                message: 'You are not enrolled in this course'
            });
            return;
        }

        // Check previous attempts
        const previousAttempts = await QuizAttempt.findStudentAttempts(userId, lessonId);
        const bestAttempt = await QuizAttempt.findBestAttempt(userId, lessonId);

        // Prepare quiz data (without correct answers for new attempts)
        const quiz = {
            id: `quiz_${lessonId}`,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            programmeId: lesson.programmeId,
            moduleId: lesson.moduleId,
            questions: quizData.questions.map(q => ({
                id: q.id,
                question: q.question,
                type: q.type,
                options: q.options || [],
                points: q.points
                // Note: correctAnswer is not included for active attempts
            })),
            settings: {
                timeLimit: quizData.timeLimit || (quizData as any).settings?.timeLimit,
                passingScore: quizData.passingScore || (quizData as any).settings?.passingScore || 60,
                allowMultipleAttempts: (quizData as any).settings?.allowMultipleAttempts ?? true,
                showCorrectAnswers: (quizData as any).settings?.showCorrectAnswers ?? true,
                showFeedback: (quizData as any).settings?.showFeedback ?? true
            },
            totalQuestions: quizData.questions.length,
            maxScore: quizData.questions.reduce((sum, q) => sum + q.points, 0),
            previousAttempts: previousAttempts.length,
            bestScore: bestAttempt ? bestAttempt.percentage : null,
            canAttempt: true // Can add logic for attempt limits later
        };

        res.status(200).json({
            success: true,
            data: quiz
        });

    } catch (error) {
        logger.error('Error getting lesson quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Start a new quiz attempt
 * @route POST /api/quiz/lesson/:lessonId/start
 * @access Private (Student)
 */
export const startQuizAttempt = async (req: Request, res: Response): Promise<void> => {
    try {
        const { lessonId } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        // Get lesson and validate
        const lesson = await ProgrammeLesson.findById(lessonId);
        const quizData = lesson?.quiz || lesson?.content?.quiz;
        if (!lesson || !quizData) {
            res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
            return;
        }

        // Check for any incomplete attempts
        const incompleteAttempt = await QuizAttempt.findOne({
            studentId: userId,
            lessonId,
            status: 'IN_PROGRESS',
            isDeleted: false
        });

        if (incompleteAttempt) {
            res.status(400).json({
                success: false,
                message: 'You have an incomplete attempt. Please complete or abandon it first.',
                data: {
                    attemptId: incompleteAttempt.id,
                    startedAt: incompleteAttempt.startedAt
                }
            });
            return;
        }

        // Get next attempt number
        const lastAttempt = await QuizAttempt.findOne({
            studentId: userId,
            lessonId,
            isDeleted: false
        }).sort({ attemptNumber: -1 });

        const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

        // Create new attempt
        const newAttempt = new QuizAttempt({
            studentId: userId,
            programmeId: lesson.programmeId,
            moduleId: lesson.moduleId,
            lessonId,
            quizId: `quiz_${lessonId}`,
            attemptNumber,
            maxScore: quizData.questions.reduce((sum, q) => sum + q.points, 0),
            passingScore: quizData.passingScore || (quizData as any).settings?.passingScore || 60,
            settings: {
                timeLimit: quizData.timeLimit || (quizData as any).settings?.timeLimit,
                questionsRandomized: (quizData as any).settings?.questionsRandomized ?? false,
                optionsRandomized: (quizData as any).settings?.optionsRandomized ?? false,
                allowMultipleAttempts: (quizData as any).settings?.allowMultipleAttempts ?? true,
                showCorrectAnswers: (quizData as any).settings?.showCorrectAnswers ?? true,
                showFeedback: (quizData as any).settings?.showFeedback ?? true
            },
            status: 'IN_PROGRESS'
        });

        await newAttempt.save();

        logger.info(`Quiz attempt started: User ${userId}, Lesson ${lessonId}, Attempt ${attemptNumber}`);

        res.status(201).json({
            success: true,
            message: 'Quiz attempt started successfully',
            data: {
                attemptId: newAttempt.id,
                attemptNumber: newAttempt.attemptNumber,
                startedAt: newAttempt.startedAt,
                timeLimit: newAttempt.settings.timeLimit,
                maxScore: newAttempt.maxScore
            }
        });

    } catch (error) {
        logger.error('Error starting quiz attempt:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Submit quiz attempt
 * @route POST /api/quiz/attempt/:attemptId/submit
 * @access Private (Student)
 */
export const submitQuizAttempt = async (req: Request, res: Response): Promise<void> => {
    try {
        const { attemptId } = req.params;
        const { answers } = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        if (!answers || !Array.isArray(answers)) {
            res.status(400).json({
                success: false,
                message: 'Answers are required and must be an array'
            });
            return;
        }

        // Get the attempt
        const attempt = await QuizAttempt.findOne({
            _id: attemptId,
            studentId: userId,
            status: 'IN_PROGRESS',
            isDeleted: false
        });

        if (!attempt) {
            res.status(404).json({
                success: false,
                message: 'Quiz attempt not found or already completed'
            });
            return;
        }

        // Get the lesson with quiz data
        const lesson = await ProgrammeLesson.findById(attempt.lessonId);
        const quizData = lesson?.quiz || lesson?.content?.quiz;
        if (!lesson || !quizData) {
            res.status(404).json({
                success: false,
                message: 'Quiz data not found'
            });
            return;
        }

        // Validate and score answers
        const quizQuestions = quizData.questions;
        let totalScore = 0;
        const scoredAnswers: any[] = [];

        for (const submittedAnswer of answers) {
            const question = quizQuestions.find(q => q.id === submittedAnswer.questionId);
            
            if (!question) {
                res.status(400).json({
                    success: false,
                    message: `Question ${submittedAnswer.questionId} not found`
                });
                return;
            }

            let isCorrect = false;
            let pointsAwarded = 0;

            // Check answer based on question type
            switch (question.type) {
                case 'MULTIPLE_CHOICE':
                    isCorrect = submittedAnswer.answer === question.correctAnswer;
                    break;
                case 'TRUE_FALSE':
                    isCorrect = Boolean(submittedAnswer.answer) === Boolean(question.correctAnswer);
                    break;
                case 'SHORT_ANSWER':
                    // Simple string comparison (case-insensitive)
                    const submittedText = String(submittedAnswer.answer).trim().toLowerCase();
                    const correctText = String(question.correctAnswer).trim().toLowerCase();
                    isCorrect = submittedText === correctText;
                    break;
                default:
                    isCorrect = false;
            }

            if (isCorrect) {
                pointsAwarded = question.points;
                totalScore += pointsAwarded;
            }

            scoredAnswers.push({
                questionId: question.id,
                answer: submittedAnswer.answer,
                isCorrect,
                pointsAwarded,
                timeSpent: submittedAnswer.timeSpent || 0
            });
        }

        // Calculate completion time
        const completedAt = new Date();
        const timeSpent = Math.round((completedAt.getTime() - attempt.startedAt.getTime()) / 1000);

        // Update attempt with results
        attempt.completedAt = completedAt;
        attempt.timeSpent = timeSpent;
        attempt.score = totalScore;
        attempt.answers = scoredAnswers;
        attempt.status = 'COMPLETED';
        
        // Calculate results manually
        attempt.percentage = Math.round((totalScore / attempt.maxScore) * 100);
        attempt.isPassed = attempt.percentage >= attempt.passingScore;
        
        await attempt.save();

        // Mark lesson as completed if quiz is passed (optional logic)
        if (attempt.isPassed) {
            const existingCompletion = await LessonCompletion.findOne({
                userId,
                lessonId: attempt.lessonId
            });

            if (!existingCompletion) {
                const lessonCompletion = new LessonCompletion({
                    userId,
                    courseId: attempt.programmeId,
                    moduleId: attempt.moduleId,
                    lessonId: attempt.lessonId,
                    timeSpent: Math.round(timeSpent / 60), // Convert to minutes
                    score: attempt.percentage,
                    completedAt
                });
                await lessonCompletion.save();
                logger.info(`Lesson completed through quiz: User ${userId}, Lesson ${attempt.lessonId}`);
            }
        }

        // Prepare response with correct answers and feedback
        const questionsWithAnswers = quizQuestions.map((q: any) => {
            const studentAnswer: any = scoredAnswers.find((a: any) => a.questionId === q.id);
            return {
                id: q.id,
                question: q.question,
                type: q.type,
                options: q.options || [],
                correctAnswer: q.correctAnswer,
                studentAnswer: studentAnswer?.answer,
                isCorrect: studentAnswer?.isCorrect || false,
                pointsAwarded: studentAnswer?.pointsAwarded || 0,
                points: q.points
            };
        });

        logger.info(`Quiz submitted: User ${userId}, Lesson ${attempt.lessonId}, Score: ${attempt.percentage}%`);

        res.status(200).json({
            success: true,
            message: 'Quiz submitted successfully',
            data: {
                attemptId: attempt.id,
                score: totalScore,
                maxScore: attempt.maxScore,
                percentage: attempt.percentage,
                isPassed: attempt.isPassed,
                gradeLetter: calculateGradeLetter(attempt.percentage),
                timeSpent: timeSpent,
                completedAt: completedAt,
                questions: questionsWithAnswers,
                feedback: attempt.isPassed ? 
                    'Congratulations! You passed the quiz.' : 
                    'You did not pass this time. Review the material and try again.',
                canRetake: !attempt.isPassed // Logic for retakes
            }
        });

    } catch (error) {
        logger.error('Error submitting quiz attempt:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get quiz attempt results
 * @route GET /api/quiz/attempt/:attemptId
 * @access Private (Student)
 */
export const getQuizAttemptResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const { attemptId } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        const attempt = await QuizAttempt.findOne({
            _id: attemptId,
            studentId: userId,
            isDeleted: false
        }).populate('lessonId', 'title');

        if (!attempt) {
            res.status(404).json({
                success: false,
                message: 'Quiz attempt not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                id: attempt.id,
                lessonTitle: (attempt.lessonId as any)?.title || 'Unknown Lesson',
                attemptNumber: attempt.attemptNumber,
                score: attempt.score,
                maxScore: attempt.maxScore,
                percentage: attempt.percentage,
                isPassed: attempt.isPassed,
                gradeLetter: calculateGradeLetter(attempt.percentage),
                timeSpent: attempt.timeSpent,
                startedAt: attempt.startedAt,
                completedAt: attempt.completedAt,
                status: attempt.status,
                answers: attempt.answers
            }
        });

    } catch (error) {
        logger.error('Error getting quiz attempt results:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get all quiz attempts for a student
 * @route GET /api/quiz/student/attempts
 * @access Private (Student)
 */
export const getStudentQuizAttempts = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { page = 1, limit = 10, programmeId } = req.query;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        const filter: any = {
            studentId: userId,
            isDeleted: false
        };

        if (programmeId) {
            filter.programmeId = programmeId;
        }

        const attempts = await QuizAttempt.find(filter)
            .populate('lessonId', 'title')
            .populate('programmeId', 'title')
            .sort({ completedAt: -1, startedAt: -1 })
            .limit(Number(limit) * Number(page))
            .skip((Number(page) - 1) * Number(limit));

        const total = await QuizAttempt.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                attempts: attempts.map(attempt => ({
                    id: attempt.id,
                    lessonTitle: (attempt.lessonId as any)?.title || 'Unknown Lesson',
                    courseTitle: (attempt.programmeId as any)?.title || 'Unknown Course',
                    attemptNumber: attempt.attemptNumber,
                    score: attempt.score,
                    maxScore: attempt.maxScore,
                    percentage: attempt.percentage,
                    isPassed: attempt.isPassed,
                    gradeLetter: calculateGradeLetter(attempt.percentage),
                    timeSpent: attempt.timeSpent,
                    completedAt: attempt.completedAt,
                    status: attempt.status
                })),
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });

    } catch (error) {
        logger.error('Error getting student quiz attempts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get quiz analytics for admin
 * @route GET /api/quiz/lesson/:lessonId/analytics
 * @access Private (Admin)
 */
export const getQuizAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { lessonId } = req.params;
        const userRole = (req as any).user?.role;

        if (userRole !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
            return;
        }

        if (!Types.ObjectId.isValid(lessonId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid lesson ID'
            });
            return;
        }

        const analytics = await QuizAttempt.getQuizAnalytics(lessonId);
        
        if (!analytics || analytics.length === 0) {
            res.status(200).json({
                success: true,
                data: {
                    totalAttempts: 0,
                    uniqueStudents: 0,
                    averageScore: 0,
                    passRate: 0,
                    averageTimeSpent: 0,
                    highestScore: 0,
                    lowestScore: 0
                }
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: analytics[0]
        });

    } catch (error) {
        logger.error('Error getting quiz analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Create or update quiz for a lesson (Admin only)
 * @route POST /api/quiz/lesson/:lessonId/manage
 * @access Private (Admin)
 */
export const createOrUpdateQuiz = async (req: Request, res: Response): Promise<void> => {
    try {
        const { lessonId } = req.params;
        const { questions, settings } = req.body;

        if (!lessonId || !Types.ObjectId.isValid(lessonId)) {
            res.status(400).json({
                success: false,
                message: 'Valid lesson ID is required'
            });
            return;
        }

        const lesson = await ProgrammeLesson.findById(lessonId);
        if (!lesson) {
            res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
            return;
        }

        // Validate quiz data
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            res.status(400).json({
                success: false,
                message: 'At least one question is required'
            });
            return;
        }

        // Validate each question
        for (const question of questions) {
            if (!question.question || !question.type || !question.points) {
                res.status(400).json({
                    success: false,
                    message: 'Each question must have question text, type, and points'
                });
                return;
            }

            if (!['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'].includes(question.type)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid question type'
                });
                return;
            }

            if (question.type === 'MULTIPLE_CHOICE' && (!question.options || question.options.length < 2)) {
                res.status(400).json({
                    success: false,
                    message: 'Multiple choice questions must have at least 2 options'
                });
                return;
            }
        }

        const quizData = {
            isActive: true,
            questions: questions.map((q: any, index: number) => ({
                id: q.id || `q${index + 1}_${Date.now()}`,
                question: q.question,
                type: q.type,
                options: q.options || [],
                correctAnswer: q.correctAnswer,
                points: q.points,
                explanation: q.explanation || ''
            })),
            settings: {
                timeLimit: settings?.timeLimit || null,
                passingScore: settings?.passingScore || 60,
                allowMultipleAttempts: settings?.allowMultipleAttempts ?? true,
                showCorrectAnswers: settings?.showCorrectAnswers ?? true,
                showFeedback: settings?.showFeedback ?? true,
                maxAttempts: settings?.maxAttempts || 3,
                questionsRandomized: settings?.questionsRandomized ?? false,
                optionsRandomized: settings?.optionsRandomized ?? false
            }
        };

        const updatedLesson = await ProgrammeLesson.findByIdAndUpdate(
            lessonId,
            { 
                $set: { 
                    'content.quiz': quizData,
                    quiz: quizData,
                    hasQuiz: true
                } 
            },
            { new: true }
        );

        logger.info(`Quiz created/updated for lesson: ${lessonId} by admin: ${(req as any).user?.id}`);

        res.status(200).json({
            success: true,
            message: 'Quiz saved successfully',
            data: {
                lessonId: updatedLesson?._id,
                quiz: updatedLesson?.quiz || updatedLesson?.content?.quiz,
                questionCount: questions.length,
                maxScore: questions.reduce((sum: number, q: any) => sum + q.points, 0)
            }
        });

    } catch (error) {
        logger.error('Error creating/updating quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Delete quiz from a lesson (Admin only)
 * @route DELETE /api/quiz/lesson/:lessonId/manage
 * @access Private (Admin)
 */
export const deleteQuiz = async (req: Request, res: Response): Promise<void> => {
    try {
        const { lessonId } = req.params;

        if (!lessonId || !Types.ObjectId.isValid(lessonId)) {
            res.status(400).json({
                success: false,
                message: 'Valid lesson ID is required'
            });
            return;
        }

        const lesson = await ProgrammeLesson.findById(lessonId);
        if (!lesson) {
            res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
            return;
        }

        await ProgrammeLesson.findByIdAndUpdate(
            lessonId,
            { 
                $unset: { 'content.quiz': 1, quiz: 1 },
                $set: { hasQuiz: false }
            }
        );

        logger.info(`Quiz deleted from lesson: ${lessonId} by admin: ${(req as any).user?.id}`);

        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully'
        });

    } catch (error) {
        logger.error('Error deleting quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get detailed quiz analytics for admin (Admin only)
 * @route GET /api/quiz/lesson/:lessonId/admin-analytics
 * @access Private (Admin)
 */
export const getDetailedQuizAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { lessonId } = req.params;

        if (!lessonId || !Types.ObjectId.isValid(lessonId)) {
            res.status(400).json({
                success: false,
                message: 'Valid lesson ID is required'
            });
            return;
        }

        const lesson = await ProgrammeLesson.findById(lessonId);
        if (!lesson) {
            res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
            return;
        }

        // Get overall analytics
        const analytics = await QuizAttempt.getQuizAnalytics(lessonId);
        
        // Get recent attempts
        const recentAttempts = await QuizAttempt.find({
            lessonId: new Types.ObjectId(lessonId),
            status: 'COMPLETED',
            isDeleted: false
        })
        .populate('studentId', 'name email')
        .sort({ completedAt: -1 })
        .limit(10);

        // Get question-wise analytics
        const questionAnalytics = await QuizAttempt.aggregate([
            {
                $match: {
                    lessonId: new Types.ObjectId(lessonId),
                    status: 'COMPLETED',
                    isDeleted: false
                }
            },
            {
                $unwind: '$answers'
            },
            {
                $group: {
                    _id: '$answers.questionId',
                    totalAnswers: { $sum: 1 },
                    correctAnswers: {
                        $sum: { $cond: ['$answers.isCorrect', 1, 0] }
                    },
                    averagePoints: { $avg: '$answers.pointsAwarded' },
                    averageTime: { $avg: '$answers.timeSpent' }
                }
            },
            {
                $project: {
                    questionId: '$_id',
                    totalAnswers: 1,
                    correctAnswers: 1,
                    accuracy: {
                        $round: [
                            { $multiply: [{ $divide: ['$correctAnswers', '$totalAnswers'] }, 100] },
                            1
                        ]
                    },
                    averagePoints: { $round: ['$averagePoints', 1] },
                    averageTime: { $round: ['$averageTime', 1] }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: analytics[0] || {
                    totalAttempts: 0,
                    uniqueStudents: 0,
                    averageScore: 0,
                    passRate: 0,
                    averageTimeSpent: 0,
                    highestScore: 0,
                    lowestScore: 0
                },
                recentAttempts: recentAttempts.map(attempt => ({
                    studentName: (attempt.studentId as any)?.name || 'Unknown',
                    studentEmail: (attempt.studentId as any)?.email || '',
                    score: attempt.score,
                    maxScore: attempt.maxScore,
                    percentage: attempt.percentage,
                    gradeLetter: calculateGradeLetter(attempt.percentage),
                    timeSpent: attempt.timeSpent,
                    completedAt: attempt.completedAt,
                    isPassed: attempt.isPassed
                })),
                questionAnalytics,
                quiz: lesson.content?.quiz || null
            }
        });

    } catch (error) {
        logger.error('Error getting detailed quiz analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export default {
    getLessonQuiz,
    startQuizAttempt,
    submitQuizAttempt,
    getQuizAttemptResults,
    getStudentQuizAttempts,
    getQuizAnalytics,
    createOrUpdateQuiz,
    deleteQuiz,
    getDetailedQuizAnalytics
};
