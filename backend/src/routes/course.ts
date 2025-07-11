import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import courseController from '../controllers/courseController';

const router = express.Router();

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/mapping', courseController.getCourseMapping);
router.get('/debug', courseController.debugAllCourses);
router.get('/slug/:slug', courseController.getCourseBySlug);
router.get('/:courseId', courseController.getCourseById);

// Protected routes
router.get('/student/courses', authenticateJWT, courseController.getStudentCourses);
router.post('/student/enroll', authenticateJWT, courseController.enrollInCourse);
router.get('/student/progress/:courseId', authenticateJWT, courseController.getCourseProgress);

export default router;
