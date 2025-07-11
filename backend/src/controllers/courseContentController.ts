import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Programme from '../models/Programme';
import ProgrammeModule from '../models/ProgrammeModule';
import ProgrammeLesson from '../models/ProgrammeLesson';
import UserCourseProgress from '../models/UserCourseProgress';
import LessonCompletion from '../models/LessonCompletion';
import QuizResult from '../models/QuizResult';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all modules for a course with progress information
 */
export const getModulesForCourse = async (req: Request, res: Response) => {
    try {
        const { programmeId } = req.params;
        const { studentId } = req.query;
        
        if (!Types.ObjectId.isValid(programmeId)) {
            return res.status(400).json({ success: false, message: 'Invalid programmeId' });
        }

        const modules = await ProgrammeModule.find({ 
            programmeId, 
            isActive: true 
        }).sort({ orderIndex: 1 }).populate('prerequisites');

        let modulesWithProgress: any[] = modules;

        // If studentId is provided, include progress information
        if (studentId && Types.ObjectId.isValid(studentId as string)) {
            const progressData = await Promise.all(
                modules.map(async (module) => {
                    // Get total lessons in module
                    const totalLessons = await ProgrammeLesson.countDocuments({
                        moduleId: module._id as Types.ObjectId,
                        isActive: true
                    });

                    // Get completed lessons for this student
                    const completedLessons = await UserCourseProgress.countDocuments({
                        studentId: new Types.ObjectId(studentId as string),
                        moduleId: module._id as Types.ObjectId,
                        status: 'COMPLETED'
                    });

                    // Calculate progress
                    const progress = totalLessons > 0 ? 
                        Math.round((completedLessons / totalLessons) * 100) : 0;

                    return {
                        ...module.toObject(),
                        progress: {
                            completedLessons,
                            totalLessons,
                            progressPercentage: progress,
                            isCompleted: progress === 100,
                            isStarted: completedLessons > 0
                        },
                        actualLessonsCount: totalLessons
                    };
                })
            );
            modulesWithProgress = progressData;
        }

        res.status(200).json({
            success: true,
            data: modulesWithProgress
        });
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch modules'
        });
    }
};

/**
 * Get all lessons for a module with progress information
 */
export const getLessonsForModule = async (req: Request, res: Response) => {
    try {
        const { moduleId } = req.params;
        const { studentId } = req.query;
        
        if (!Types.ObjectId.isValid(moduleId)) {
            return res.status(400).json({ success: false, message: 'Invalid moduleId' });
        }

        const lessons = await ProgrammeLesson.find({ 
            moduleId, 
            isActive: true 
        }).sort({ orderIndex: 1 });

        let lessonsWithProgress: any[] = lessons;

        // If studentId is provided, include progress information
        if (studentId && Types.ObjectId.isValid(studentId as string)) {
            const progressData = await Promise.all(
                lessons.map(async (lesson) => {
                    const progress = await UserCourseProgress.findOne({
                        studentId: new Types.ObjectId(studentId as string),
                        lessonId: lesson._id as Types.ObjectId
                    });

                    return {
                        ...lesson.toObject(),
                        progress: progress ? {
                            status: progress.status,
                            progressPercentage: progress.progressPercentage,
                            timeSpent: progress.timeSpent,
                            lastAccessedAt: progress.lastAccessedAt,
                            completedAt: progress.completedAt,
                            bookmarked: progress.bookmarked,
                            notes: progress.notes,
                            attempts: progress.attempts
                        } : null
                    };
                })
            );
            lessonsWithProgress = progressData;
        }

        res.status(200).json({
            success: true,
            data: lessonsWithProgress
        });
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lessons'
        });
    }
};

/**
 * Get detailed lesson information with navigation
 */
export const getLessonDetails = async (req: Request, res: Response) => {
    try {
        const { lessonId } = req.params;
        const { studentId } = req.query;
        
        if (!Types.ObjectId.isValid(lessonId)) {
            return res.status(400).json({ success: false, message: 'Invalid lessonId' });
        }

        const lesson = await ProgrammeLesson.findById(lessonId)
            .populate('moduleId', 'title description')
            .populate('programmeId', 'title');
            
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        // Calculate average completion time
        const completionStats = await UserCourseProgress.aggregate([
            { $match: { lessonId: new Types.ObjectId(lessonId), status: 'COMPLETED' } },
            {
                $group: {
                    _id: null,
                    avgTime: { $avg: '$timeSpent' },
                    totalCompletions: { $sum: 1 },
                    avgAttempts: { $avg: '$attempts' }
                }
            }
        ]);

        const stats = completionStats[0] || {
            avgTime: 0,
            totalCompletions: 0,
            avgAttempts: 0
        };

        let studentProgress = null;
        if (studentId && Types.ObjectId.isValid(studentId as string)) {
            studentProgress = await UserCourseProgress.findOne({
                studentId: new Types.ObjectId(studentId as string),
                lessonId: new Types.ObjectId(lessonId)
            });
        }

        // Get next and previous lessons in the module
        const siblingLessons = await ProgrammeLesson.find({
            moduleId: lesson.moduleId,
            isActive: true
        }).sort({ orderIndex: 1 }).select('_id title orderIndex');

        const currentIndex = siblingLessons.findIndex(l => (l._id as Types.ObjectId).toString() === lessonId.toString());
        const previousLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
        const nextLesson = currentIndex < siblingLessons.length - 1 ? siblingLessons[currentIndex + 1] : null;

        const lessonData = {
            lesson: {
                id: (lesson._id as Types.ObjectId).toString(),
                title: lesson.title,
                description: lesson.description,
                type: lesson.type,
                estimatedDuration: lesson.estimatedDuration,
                content: lesson.content,
                learningObjectives: lesson.learningObjectives,
                resources: lesson.resources,
                isRequired: lesson.isRequired,
                orderIndex: lesson.orderIndex,
                module: lesson.moduleId,
                programme: lesson.programmeId
            },
            navigation: {
                previousLesson: previousLesson ? {
                    _id: (previousLesson._id as Types.ObjectId).toString(),
                    title: previousLesson.title,
                    orderIndex: previousLesson.orderIndex
                } : null,
                nextLesson: nextLesson ? {
                    _id: (nextLesson._id as Types.ObjectId).toString(),
                    title: nextLesson.title,
                    orderIndex: nextLesson.orderIndex
                } : null,
                currentPosition: currentIndex + 1,
                totalLessons: siblingLessons.length
            },
            stats: {
                averageCompletionTime: Math.round(stats.avgTime || 0),
                totalCompletions: stats.totalCompletions || 0,
                averageAttempts: Math.round(stats.avgAttempts || 0)
            },
            studentProgress: studentProgress ? {
                status: studentProgress.status,
                progressPercentage: studentProgress.progressPercentage,
                timeSpent: studentProgress.timeSpent,
                lastAccessedAt: studentProgress.lastAccessedAt,
                completedAt: studentProgress.completedAt,
                bookmarked: studentProgress.bookmarked,
                notes: studentProgress.notes,
                attempts: studentProgress.attempts,
                watchTimeVideo: studentProgress.watchTimeVideo
            } : null
        };

        res.status(200).json({
            success: true,
            data: lessonData
        });
    } catch (error) {
        console.error('Error fetching lesson details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lesson details'
        });
    }
};

/**
 * Get lesson content with quiz if available
 */
export const getLessonContent = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { studentId } = req.query;

    if (!Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson ID'
      });
    }

    const lesson = await ProgrammeLesson.findById(lessonId)
      .populate({
        path: 'moduleId',
        populate: {
          path: 'programmeId',
          select: 'title category level'
        }
      })
      .lean();

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Get student's progress for this lesson
    let lessonProgress = null;
    if (studentId && Types.ObjectId.isValid(studentId as string)) {
      lessonProgress = await UserCourseProgress.findOne({
        studentId,
        lessonId
      }).lean();
    }

    // Get quiz if lesson has one
    let quiz = null;
    if (lesson.content?.quiz) {
      quiz = {
        id: (lesson._id as Types.ObjectId).toString(),
        title: lesson.title,
        description: lesson.description,
        timeLimit: lesson.content.quiz.timeLimit,
        passingScore: lesson.content.quiz.passingScore,
        totalQuestions: lesson.content.quiz.questions?.length || 0,
        // Don't send answers to client
        questions: lesson.content.quiz.questions?.map((q: any) => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.type === 'MULTIPLE_CHOICE' ? q.options : undefined,
          points: q.points
        })) || []
      };
    }

    // Handle different content formats and ensure rich content is properly structured
    let processedContent = lesson.content;
    
    // If lesson has rich content (JSON blocks), use that
    if (lesson.content?.richContent && lesson.content.richContent.length > 0) {
      processedContent = {
        ...lesson.content,
        contentFormat: lesson.content.contentFormat || 'JSON',
        richContent: lesson.content.richContent.map((item: any, index: number) => ({
          id: item.id || `content-${index}`,
          type: item.type || 'text',
          title: item.title,
          content: item.content,
          metadata: item.metadata || {}
        }))
      };
    } else if (lesson.content?.textContent) {
      // Try to detect if textContent is JSON or HTML
      try {
        const parsed = JSON.parse(lesson.content.textContent);
        if (Array.isArray(parsed)) {
          // It's structured JSON content
          processedContent = {
            ...lesson.content,
            contentFormat: 'JSON',
            richContent: parsed.map((item: any, index: number) => ({
              id: item.id || `content-${index}`,
              type: item.type || 'text',
              title: item.title,
              content: item.content,
              metadata: item.metadata || {}
            }))
          };
        } else {
          // It's HTML content
          processedContent = {
            ...lesson.content,
            contentFormat: 'HTML',
            richContent: [{
              id: 'main-content',
              type: 'text',
              title: lesson.title,
              content: lesson.content.textContent,
              metadata: {}
            }]
          };
        }
      } catch {
        // It's HTML content
        processedContent = {
          ...lesson.content,
          contentFormat: 'HTML',
          richContent: [{
            id: 'main-content',
            type: 'text',
            title: lesson.title,
            content: lesson.content.textContent,
            metadata: {}
          }]
        };
      }
    } else {
      // Legacy content format - create a basic text content
      processedContent = {
        ...lesson.content,
        contentFormat: 'LEGACY',
        richContent: [{
          id: 'main-content',
          type: 'text',
          title: lesson.title,
          content: lesson.description || 'Content coming soon...',
          metadata: {}
        }]
      };
    }

    const lessonData = {
      ...lesson,
      content: processedContent,
      progress: lessonProgress ? {
        completed: lessonProgress.completedAt,
        timeSpent: lessonProgress.timeSpent,
        lastAccessed: lessonProgress.lastAccessedAt,
        progressPercentage: lessonProgress.progressPercentage,
        bookmarked: lessonProgress.bookmarked,
        notes: lessonProgress.notes
      } : null,
      quiz
    };

    res.status(200).json({
      success: true,
      data: lessonData
    });
  } catch (error) {
    console.error('Error getting lesson content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve lesson content'
    });
  }
};

/**
 * Update lesson progress
 */
export const updateLessonProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { studentId, timeSpent, progressPercentage, notes, bookmarked } = req.body;

    if (!Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson ID'
      });
    }

    // Get or create progress record
    let progress = await UserCourseProgress.findOne({
      studentId,
      lessonId
    });

    if (!progress) {
      const lessonDoc = await ProgrammeLesson.findById(lessonId).select('programmeId moduleId');
      if (!lessonDoc) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }
      
      progress = new UserCourseProgress({
        studentId,
        lessonId,
        programmeId: lessonDoc.programmeId,
        moduleId: lessonDoc.moduleId,
        status: 'IN_PROGRESS'
      });
    }

    // Update progress
    progress.timeSpent = timeSpent || progress.timeSpent;
    progress.progressPercentage = Math.min(progressPercentage || 0, 100);
    progress.lastAccessedAt = new Date();
    progress.notes = notes !== undefined ? notes : progress.notes;
    progress.bookmarked = bookmarked !== undefined ? bookmarked : progress.bookmarked;

    // Mark as completed if progress is 100%
    if (progress.progressPercentage >= 100 && progress.status !== 'COMPLETED') {
      progress.status = 'COMPLETED';
      progress.completedAt = new Date();
    }

    await progress.save();

    res.status(200).json({
      success: true,
      data: {
        progressPercentage: progress.progressPercentage,
        timeSpent: progress.timeSpent,
        status: progress.status,
        completed: progress.status === 'COMPLETED'
      }
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
 * Submit quiz answers
 */
export const submitQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { studentId, answers, timeSpent } = req.body;

    if (!Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson ID'
      });
    }

    // Get lesson and quiz
    const lesson = await ProgrammeLesson.findById(lessonId);
    if (!lesson || !lesson.content?.quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const quiz = lesson.content.quiz;
    let totalScore = 0;
    let maxScore = 0;
    const results = [];

    // Grade each answer
    for (const answer of answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (question) {
        maxScore += question.points;
        const isCorrect = answer.answer === question.correctAnswer;
        if (isCorrect) {
          totalScore += question.points;
        }
        results.push({
          question: question.question,
          studentAnswer: answer.answer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          points: isCorrect ? question.points : 0
        });
      }
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = percentage >= quiz.passingScore;
    const pointsEarned = passed ? Math.round(percentage) : 0;

    // Save quiz result
    const quizResult = new QuizResult({
      studentId,
      lessonId,
      programmeId: lesson.programmeId,
      answers: answers,
      score: totalScore,
      maxScore: maxScore,
      percentage: percentage,
      passed: passed,
      timeSpent: timeSpent || 0,
      submittedAt: new Date()
    });

    await quizResult.save();

    // Update lesson progress
    let progress = await UserCourseProgress.findOne({
      studentId,
      lessonId
    });

    if (!progress) {
      progress = new UserCourseProgress({
        studentId,
        lessonId,
        programmeId: lesson.programmeId,
        moduleId: lesson.moduleId,
        status: passed ? 'COMPLETED' : 'IN_PROGRESS'
      });
    }

    progress.progressPercentage = passed ? 100 : Math.max(progress.progressPercentage, 50);
    progress.timeSpent = (progress.timeSpent || 0) + (timeSpent || 0);
    progress.lastAccessedAt = new Date();

    if (passed && progress.status !== 'COMPLETED') {
      progress.status = 'COMPLETED';
      progress.completedAt = new Date();
    }

    await progress.save();

    res.status(200).json({
      success: true,
      data: {
        quizResult: {
          score: totalScore,
          maxScore: maxScore,
          percentage: percentage,
          passed: passed,
          pointsEarned: pointsEarned
        },
        results: results,
        feedback: passed 
          ? `Congratulations! You passed the quiz with ${percentage.toFixed(1)}%` 
          : `You scored ${percentage.toFixed(1)}%. You need ${quiz.passingScore}% to pass.`
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz'
    });
  }
};

/**
 * Get next module recommendation
 */
export const getNextModule = async (req: Request, res: Response) => {
  try {
    const { programmeId } = req.params;
    const { studentId } = req.query;

    if (!Types.ObjectId.isValid(programmeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid programme ID'
      });
    }

    // Get all modules for the programme
    const modules = await ProgrammeModule.find({
      programmeId,
      isActive: true
    }).sort({ orderIndex: 1 });

    if (modules.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No modules found'
      });
    }

    let nextModule = null;
    let nextLesson = null;

    if (studentId && Types.ObjectId.isValid(studentId as string)) {
      // Find the next incomplete module
      for (const module of modules) {
        const moduleProgress = await UserCourseProgress.aggregate([
          {
            $match: {
              studentId: new Types.ObjectId(studentId as string),
              moduleId: module._id as Types.ObjectId
            }
          },
          {
            $group: {
              _id: null,
              totalLessons: { $sum: 1 },
              completedLessons: {
                $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
              }
            }
          }
        ]);

        const progress = moduleProgress[0] || { totalLessons: 0, completedLessons: 0 };
        
        if (progress.completedLessons < progress.totalLessons) {
          nextModule = module;
          
          // Find the next incomplete lesson in this module
          const lessons = await ProgrammeLesson.find({
            moduleId: module._id as Types.ObjectId,
            isActive: true
          }).sort({ orderIndex: 1 });

          for (const lesson of lessons) {
            const lessonProgress = await UserCourseProgress.findOne({
              studentId: new Types.ObjectId(studentId as string),
              lessonId: lesson._id as Types.ObjectId
            });

            if (!lessonProgress || lessonProgress.status !== 'COMPLETED') {
              nextLesson = lesson;
              break;
            }
          }
          break;
        }
      }
    }

    // If no next module found, default to first module
    if (!nextModule) {
      nextModule = modules[0];
      const firstLesson = await ProgrammeLesson.findOne({
        moduleId: modules[0]._id as Types.ObjectId,
        isActive: true
      }).sort({ orderIndex: 1 });
      nextLesson = firstLesson;
    }

    res.status(200).json({
      success: true,
      data: {
        nextModule: nextModule ? {
          id: (nextModule._id as Types.ObjectId).toString(),
          title: nextModule.title,
          description: nextModule.description,
          orderIndex: nextModule.orderIndex
        } : null,
        nextLesson: nextLesson ? {
          id: (nextLesson._id as Types.ObjectId).toString(),
          title: nextLesson.title,
          description: nextLesson.description,
          type: nextLesson.type,
          orderIndex: nextLesson.orderIndex
        } : null
      }
    });
  } catch (error) {
    console.error('Error getting next module:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get next module'
    });
  }
};

/**
 * Get course progress overview
 */
export const getCourseProgress = async (req: Request, res: Response) => {
  try {
    const { programmeId } = req.params;
    const { studentId } = req.query;

    if (!Types.ObjectId.isValid(programmeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid programme ID'
      });
    }

    // Get programme details
    const programme = await Programme.findById(programmeId);
    if (!programme) {
      return res.status(404).json({
        success: false,
        message: 'Programme not found'
      });
    }

    // Get all modules and lessons
    const modules = await ProgrammeModule.find({
      programmeId,
      isActive: true
    }).sort({ orderIndex: 1 });

    let overallProgress = 0;
    let modulesCompleted = 0;
    let lessonsCompleted = 0;
    let totalTimeSpent = 0;
    let lastAccessedAt = null;

    if (studentId && Types.ObjectId.isValid(studentId as string)) {
      // Calculate progress for each module
      const moduleProgress = await Promise.all(
        modules.map(async (module) => {
          const lessons = await ProgrammeLesson.find({
            moduleId: module._id as Types.ObjectId,
            isActive: true
          }).sort({ orderIndex: 1 });

          const lessonProgress = await Promise.all(
            lessons.map(async (lesson) => {
              const progress = await UserCourseProgress.findOne({
                studentId: new Types.ObjectId(studentId as string),
                lessonId: lesson._id as Types.ObjectId
              });

              if (progress) {
                totalTimeSpent += progress.timeSpent || 0;
                if (progress.lastAccessedAt) {
                  lastAccessedAt = progress.lastAccessedAt;
                }
              }

              return {
                id: (lesson._id as Types.ObjectId).toString(),
                title: lesson.title,
                description: lesson.description,
                type: lesson.type,
                duration: lesson.estimatedDuration,
                orderIndex: lesson.orderIndex,
                status: progress?.status || 'NOT_STARTED',
                progressPercentage: progress?.progressPercentage || 0,
                timeSpent: progress?.timeSpent || 0
              };
            })
          );

          const completedLessons = lessonProgress.filter(l => l.status === 'COMPLETED').length;
          const moduleProgressPercentage = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

          if (moduleProgressPercentage === 100) {
            modulesCompleted++;
          }

          return {
            id: (module._id as Types.ObjectId).toString(),
            title: module.title,
            description: module.description,
            orderIndex: module.orderIndex,
            estimatedDuration: module.estimatedDuration,
            lessons: lessonProgress,
            progress: {
              completedLessons,
              totalLessons: lessons.length,
              percentage: moduleProgressPercentage
            }
          };
        })
      );

      // Calculate overall progress
      const totalLessons = moduleProgress.reduce((sum, module) => sum + module.progress.totalLessons, 0);
      lessonsCompleted = moduleProgress.reduce((sum, module) => sum + module.progress.completedLessons, 0);
      overallProgress = totalLessons > 0 ? (lessonsCompleted / totalLessons) * 100 : 0;

      res.status(200).json({
        success: true,
        data: {
          programmeId: (programme._id as Types.ObjectId).toString(),
          programmeTitle: programme.title,
          overallProgress: Math.round(overallProgress * 100) / 100,
          modulesCompleted,
          totalModules: modules.length,
          lessonsCompleted,
          totalLessons,
          timeSpent: totalTimeSpent,
          lastAccessedAt,
          enrollmentDate: new Date(), // This should come from enrollment
          modules: moduleProgress
        }
      });
    } else {
      // Return basic course structure without progress
      res.status(200).json({
        success: true,
        data: {
          programmeId: (programme._id as Types.ObjectId).toString(),
          programmeTitle: programme.title,
          overallProgress: 0,
          modulesCompleted: 0,
          totalModules: modules.length,
          lessonsCompleted: 0,
          totalLessons: 0,
          timeSpent: 0,
          lastAccessedAt: null,
          enrollmentDate: new Date(),
          modules: modules.map(module => ({
            id: (module._id as Types.ObjectId).toString(),
            title: module.title,
            description: module.description,
            orderIndex: module.orderIndex,
            estimatedDuration: module.estimatedDuration,
            lessons: [],
            progress: {
              completedLessons: 0,
              totalLessons: 0,
              percentage: 0
            }
          }))
        }
      });
    }
  } catch (error) {
    console.error('Error getting course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course progress'
    });
  }
};

/**
 * Get all active courses
 */
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Programme.find({})
      .select('_id title slug description category instructor level price currency imageUrl totalModules totalLessons estimatedDuration skills prerequisites overview isActive')
      .sort({ title: 1 });

    res.json({
      success: true,
      data: courses,
      total: courses.length
    });
  } catch (error) {
    console.error('Error getting all courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get courses'
    });
  }
};

/**
 * Get course slug to ID mapping
 */
export const getCourseMapping = async (req: Request, res: Response) => {
  try {
    const courses = await Programme.find({})
      .select('_id slug isActive')
      .sort({ title: 1 });

    const mapping: Record<string, string> = {};
    courses.forEach(course => {
      mapping[course.slug] = (course._id as Types.ObjectId).toString();
    });

    res.json({
      success: true,
      data: mapping
    });
  } catch (error) {
    console.error('Error getting course mapping:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course mapping'
    });
  }
};
