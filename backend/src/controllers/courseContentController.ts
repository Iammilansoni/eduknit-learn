import { Request, Response } from 'express';
import Programme from '../models/Programme';
import ProgrammeModule from '../models/ProgrammeModule';
import ProgrammeLesson from '../models/ProgrammeLesson';
import UserCourseProgress from '../models/UserCourseProgress';
import Enrollment from '../models/Enrollment';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth';

export const getAllCourses = async (req: Request, res: Response) => {
    try {
        const { category, level, search } = req.query;
        
        let query: any = { isActive: true };
        
        if (category) query.category = category;
        if (level) query.level = level;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { skills: { $in: [new RegExp(search as string, 'i')] } }
            ];
        }

        const courses = await Programme.find(query).sort({ createdAt: -1 });
        
        const data = await Promise.all(courses.map(async (course) => {
            const modulesCount = await ProgrammeModule.countDocuments({ 
                programmeId: course._id, 
                isActive: true 
            });
            const lessonsCount = await ProgrammeLesson.countDocuments({ 
                programmeId: course._id, 
                isActive: true 
            });
            
            return {
                id: course._id,
                title: course.title,
                description: course.description,
                category: course.category,
                level: course.level,
                instructor: course.instructor,
                duration: course.duration,
                timeframe: course.timeframe,
                skills: course.skills,
                prerequisites: course.prerequisites,
                imageUrl: course.imageUrl,
                price: course.price,
                currency: course.currency,
                certificateAwarded: course.certificateAwarded,
                modulesCount,
                lessonsCount,
                totalLessons: course.totalLessons,
                totalModules: course.totalModules,
                estimatedDuration: course.estimatedDuration
            };
        }));
        
        res.json({ success: true, data, total: data.length });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch courses' });
    }
};

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

        let modulesWithProgress = modules;

        // If studentId is provided, include progress information
        if (studentId && Types.ObjectId.isValid(studentId as string)) {
            const progressData = await Promise.all(
                modules.map(async (module) => {
                    // Get total lessons in module
                    const totalLessons = await ProgrammeLesson.countDocuments({
                        moduleId: module._id,
                        isActive: true
                    });

                    // Get completed lessons for this student
                    const completedLessons = await UserCourseProgress.countDocuments({
                        studentId: new Types.ObjectId(studentId as string),
                        moduleId: module._id,
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
                        }
                    };
                })
            );
            modulesWithProgress = progressData as any;
        }

        res.json({ success: true, data: modulesWithProgress });
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch modules' });
    }
};

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

        let lessonsWithProgress = lessons;

        // If studentId is provided, include progress information
        if (studentId && Types.ObjectId.isValid(studentId as string)) {
            const progressData = await Promise.all(
                lessons.map(async (lesson) => {
                    const progress = await UserCourseProgress.findOne({
                        studentId: new Types.ObjectId(studentId as string),
                        lessonId: lesson._id
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
                        } : {
                            status: 'NOT_STARTED',
                            progressPercentage: 0,
                            timeSpent: 0,
                            lastAccessedAt: null,
                            completedAt: null,
                            bookmarked: false,
                            notes: '',
                            attempts: 0
                        }
                    };
                })
            );
            lessonsWithProgress = progressData as any;
        }

        res.json({ success: true, data: lessonsWithProgress });
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch lessons' });
    }
};

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

        res.json({
            success: true,
            data: {
                lesson: {
                    id: lesson._id,
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
                    previousLesson,
                    nextLesson,
                    currentPosition: currentIndex + 1,
                    totalLessons: siblingLessons.length
                },
                stats: {
                    averageCompletionTime: Math.round(stats.avgTime || 0),
                    totalCompletions: stats.totalCompletions,
                    averageAttempts: Math.round((stats.avgAttempts || 0) * 100) / 100
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
            }
        });
    } catch (error) {
        console.error('Error fetching lesson details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch lesson details' });
    }
};

export const getCourseDetails = async (req: Request, res: Response) => {
    try {
        const { programmeId } = req.params;
        
        if (!Types.ObjectId.isValid(programmeId)) {
            return res.status(400).json({ success: false, message: 'Invalid programmeId' });
        }

        const course = await Programme.findById(programmeId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Get modules with lesson counts
        const modules = await ProgrammeModule.aggregate([
            { $match: { programmeId: new Types.ObjectId(programmeId), isActive: true } },
            { $sort: { orderIndex: 1 } },
            {
                $lookup: {
                    from: 'programmelessons',
                    localField: '_id',
                    foreignField: 'moduleId',
                    as: 'lessons'
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    orderIndex: 1,
                    estimatedDuration: 1,
                    totalLessons: 1,
                    prerequisites: 1,
                    dueDate: 1,
                    learningObjectives: 1,
                    actualLessonsCount: { $size: '$lessons' }
                }
            }
        ]);

        // Get enrollment stats
        const enrollmentStats = await Enrollment.aggregate([
            { $match: { programmeId: new Types.ObjectId(programmeId) } },
            {
                $group: {
                    _id: null,
                    totalEnrollments: { $sum: 1 },
                    activeEnrollments: {
                        $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] }
                    },
                    completedEnrollments: {
                        $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
                    }
                }
            }
        ]);

        const stats = enrollmentStats[0] || {
            totalEnrollments: 0,
            activeEnrollments: 0,
            completedEnrollments: 0
        };

        res.json({
            success: true,
            data: {
                course: {
                    id: course._id,
                    title: course.title,
                    description: course.description,
                    overview: course.overview,
                    category: course.category,
                    level: course.level,
                    instructor: course.instructor,
                    duration: course.duration,
                    timeframe: course.timeframe,
                    skills: course.skills,
                    prerequisites: course.prerequisites,
                    imageUrl: course.imageUrl,
                    price: course.price,
                    currency: course.currency,
                    certificateAwarded: course.certificateAwarded,
                    totalModules: course.totalModules,
                    totalLessons: course.totalLessons,
                    estimatedDuration: course.estimatedDuration,
                    createdAt: course.createdAt,
                    updatedAt: course.updatedAt
                },
                modules,
                stats
            }
        });
    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch course details' });
    }
};
