import express from 'express';
import {
    getAllCourses,
    getCourseDetails,
    getModulesForCourse,
    getLessonsForModule,
    getLessonDetails
} from '../controllers/courseContentController';
import {
    enrollInCourse,
    getMyCourses,
    getEnrolledCourseDetail,
    updateCourseProgress
} from '../controllers/courseController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Public routes (for course catalog)
router.get('/courses', getAllCourses);
router.get('/courses/:programmeId', getCourseDetails);

// Protected routes (require authentication for detailed content)
router.use(authenticateJWT);

router.get('/courses/:programmeId/modules', getModulesForCourse);
router.get('/modules/:moduleId/lessons', getLessonsForModule);
router.get('/lessons/:lessonId', getLessonDetails);

// User course enrollment routes
router.post('/course/enroll', enrollInCourse);
router.get('/course/my-courses', getMyCourses);
router.get('/course/my-course/:courseId', getEnrolledCourseDetail);
router.post('/course/progress', updateCourseProgress);

export default router;
