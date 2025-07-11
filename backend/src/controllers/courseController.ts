import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import Programme from '../models/Programme';
import ProgrammeModule from '../models/ProgrammeModule';
import ProgrammeLesson from '../models/ProgrammeLesson';
import UserCourseProgress from '../models/UserCourseProgress';
import Enrollment from '../models/Enrollment';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all active courses for programs page
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
 * Get course by ID with detailed information
 */
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { studentId } = req.query;

    if (!Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }

    const course = await Programme.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get enrollment status if studentId is provided
    let enrollment = null;
    if (studentId && Types.ObjectId.isValid(studentId as string)) {
      enrollment = await Enrollment.findOne({
        studentId: new mongoose.Types.ObjectId(studentId as string),
        programmeId: new mongoose.Types.ObjectId(courseId)
      });
    }

    // Get course progress if enrolled
    let progress = null;
    if (enrollment) {
      const progressData = await UserCourseProgress.aggregate([
        {
                  $match: {
          studentId: new mongoose.Types.ObjectId(studentId as string),
          programmeId: new mongoose.Types.ObjectId(courseId)
        }
        },
        {
          $group: {
            _id: null,
            totalLessons: { $sum: 1 },
            completedLessons: {
              $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
            },
            totalTimeSpent: { $sum: '$timeSpent' }
          }
        }
      ]);

      if (progressData.length > 0) {
        const data = progressData[0];
        progress = {
          totalLessons: data.totalLessons,
          completedLessons: data.completedLessons,
          progressPercentage: data.totalLessons > 0 ? 
            Math.round((data.completedLessons / data.totalLessons) * 100) : 0,
          timeSpent: data.totalTimeSpent
        };
      }
    }

    res.json({
      success: true,
      data: {
        course,
        enrollment,
        progress
      }
    });
  } catch (error) {
    console.error('Error getting course by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course'
    });
  }
};

/**
 * Get course by slug for public course detail page
 */
export const getCourseBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    console.log('🔍 getCourseBySlug called with slug:', slug);

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Slug is required'
      });
    }

    // First, let's check if the course exists at all (regardless of isActive)
    const allCourses = await Programme.find({ slug })
      .select('_id title slug isActive');
    
    console.log('🔍 Found courses with slug:', slug, ':', allCourses);

    const course = await Programme.findOne({ slug, isActive: true })
      .select('_id title slug description category instructor level price currency imageUrl totalModules totalLessons estimatedDuration skills prerequisites overview isActive');

    console.log('🔍 Active course found:', course);

    if (!course) {
      // Let's also check what courses exist with this slug
      const coursesWithSlug = await Programme.find({ slug })
        .select('title slug isActive');
      
      console.log('🔍 All courses with slug', slug, ':', coursesWithSlug);
      
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error getting course by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course'
    });
  }
};

/**
 * Get course mapping for frontend routing
 */
export const getCourseMapping = async (req: Request, res: Response) => {
  try {
    const courses = await Programme.find({ isActive: true })
      .select('slug _id title')
      .sort({ title: 1 });

    const mapping: Record<string, { id: string; title: string }> = {};
    courses.forEach(course => {
      mapping[course.slug] = {
        id: (course._id as mongoose.Types.ObjectId).toString(),
        title: course.title
      };
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

/**
 * Debug endpoint to list all courses with slugs
 */
export const debugAllCourses = async (req: Request, res: Response) => {
  try {
    const allCourses = await Programme.find({})
      .select('_id title slug isActive')
      .sort({ title: 1 });

    console.log('🔍 DEBUG: All courses in database:', allCourses);

    res.json({
      success: true,
      data: allCourses,
      total: allCourses.length
    });
  } catch (error) {
    console.error('Error in debugAllCourses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get debug info'
    });
  }
};

/**
 * Get student's enrolled courses
 */
export const getStudentCourses = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Student ID required'
      });
    }

    // Get all enrollments for the student
    const enrollments = await Enrollment.find({
      studentId: new mongoose.Types.ObjectId(studentId)
    }).populate('programmeId');

    // Get progress for each enrollment
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const programme = enrollment.programmeId as any;
        
        // Get progress data
        const progressData = await UserCourseProgress.aggregate([
          {
                    $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          programmeId: programme._id
        }
          },
          {
            $group: {
              _id: null,
              totalLessons: { $sum: 1 },
              completedLessons: {
                $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
              },
              totalTimeSpent: { $sum: '$timeSpent' },
              lastAccessed: { $max: '$lastAccessedAt' }
            }
          }
        ]);

        const progress = progressData.length > 0 ? progressData[0] : {
          totalLessons: 0,
          completedLessons: 0,
          totalTimeSpent: 0,
          lastAccessed: null
        };

        // Get next lesson
        const nextLesson = await UserCourseProgress.findOne({
          studentId: new mongoose.Types.ObjectId(studentId),
          programmeId: programme._id,
          status: { $ne: 'COMPLETED' }
        }).populate('lessonId');

        return {
          id: (enrollment._id as mongoose.Types.ObjectId).toString(),
          programmeId: programme._id.toString(),
          title: programme.title,
          description: programme.description,
          image: programme.imageUrl || '/placeholder.svg',
          instructor: programme.instructor || 'EduKnit Team',
          progress: progress.totalLessons > 0 ? 
            Math.round((progress.completedLessons / progress.totalLessons) * 100) : 0,
          status: progress.completedLessons === progress.totalLessons ? 'Completed' : 
                 progress.completedLessons > 0 ? 'In Progress' : 'Not Started',
          lastAccessed: progress.lastAccessed ? 
            new Date(progress.lastAccessed).toLocaleDateString() : 'Never',
          nextLesson: nextLesson?.lessonId ? (nextLesson.lessonId as any).title : 'Start Course',
          enrollmentDate: enrollment.enrollmentDate,
          totalModules: programme.totalModules || 0,
          totalLessons: programme.totalLessons || 0,
          completedModules: 0, // TODO: Calculate from module progress
          completedLessons: progress.completedLessons,
          estimatedDuration: programme.estimatedDuration || 0,
          category: programme.category || 'General',
          level: programme.level || 'Beginner'
        };
      })
    );

    res.json({
      success: true,
      data: {
        courses: coursesWithProgress,
        total: coursesWithProgress.length
      }
    });
  } catch (error) {
    console.error('Error getting student courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student courses'
    });
  }
};

/**
 * Enroll student in a course
 */
export const enrollInCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { programmeId } = req.body;
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!Types.ObjectId.isValid(programmeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid programme ID'
      });
    }

    // Check if course exists and is active
    const programme = await Programme.findById(programmeId);
    if (!programme) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!programme.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for enrollment'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      programmeId: new mongoose.Types.ObjectId(programmeId)
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      studentId: new mongoose.Types.ObjectId(studentId),
      programmeId: new mongoose.Types.ObjectId(programmeId),
      enrollmentDate: new Date(),
      status: 'active'
    });

    await enrollment.save();

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        enrollmentId: (enrollment._id as mongoose.Types.ObjectId).toString(),
        programmeId: enrollment.programmeId.toString(),
        enrollmentDate: enrollment.enrollmentDate
      }
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course'
    });
  }
};

/**
 * Get course progress for a student
 */
export const getCourseProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?.id;

    if (!studentId) {
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

    // Get course details
    const course = await Programme.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get enrollment
    const enrollment = await Enrollment.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      programmeId: new mongoose.Types.ObjectId(courseId)
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Get modules and lessons
    const modules = await ProgrammeModule.find({
      programmeId: new mongoose.Types.ObjectId(courseId),
      isActive: true
    }).sort({ orderIndex: 1 });

    const moduleProgress = await Promise.all(
      modules.map(async (module) => {
        const lessons = await ProgrammeLesson.find({
          moduleId: module._id,
          isActive: true
        }).sort({ orderIndex: 1 });

        const lessonProgress = await Promise.all(
          lessons.map(async (lesson) => {
            const progress = await UserCourseProgress.findOne({
              studentId: new mongoose.Types.ObjectId(studentId),
              lessonId: lesson._id
            });

            return {
              id: (lesson._id as mongoose.Types.ObjectId).toString(),
              title: lesson.title,
              description: lesson.description,
              type: lesson.type,
              orderIndex: lesson.orderIndex,
              status: progress?.status || 'NOT_STARTED',
              progressPercentage: progress?.progressPercentage || 0,
              timeSpent: progress?.timeSpent || 0,
              completedAt: progress?.completedAt
            };
          })
        );

        const completedLessons = lessonProgress.filter(l => l.status === 'COMPLETED').length;
        const moduleProgressPercentage = lessons.length > 0 ? 
          (completedLessons / lessons.length) * 100 : 0;

        return {
          id: (module._id as mongoose.Types.ObjectId).toString(),
          title: module.title,
          description: module.description,
          orderIndex: module.orderIndex,
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
    const completedLessons = moduleProgress.reduce((sum, module) => sum + module.progress.completedLessons, 0);
    const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    res.json({
      success: true,
      data: {
        course: {
          id: (course._id as mongoose.Types.ObjectId).toString(),
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          totalModules: course.totalModules,
          totalLessons: course.totalLessons,
          estimatedDuration: course.estimatedDuration
        },
        enrollment: {
          id: (enrollment._id as mongoose.Types.ObjectId).toString(),
          enrollmentDate: enrollment.enrollmentDate,
          status: enrollment.status
        },
        progress: {
          overall: Math.round(overallProgress * 100) / 100,
          completedLessons,
          totalLessons,
          completedModules: moduleProgress.filter(m => m.progress.percentage === 100).length,
          totalModules: modules.length
        },
        modules: moduleProgress
      }
    });
  } catch (error) {
    console.error('Error getting course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course progress'
    });
  }
};

export default {
  getAllCourses,
  getCourseById,
  getCourseBySlug,
  getCourseMapping,
  debugAllCourses,
  getStudentCourses,
  enrollInCourse,
  getCourseProgress
};
