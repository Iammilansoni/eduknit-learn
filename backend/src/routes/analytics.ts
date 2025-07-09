import express from 'express';
import {
    getAnalyticsOverview,
    getProgressHistory,
    getCategoryPerformance,
    getStreaksAndAchievements,
    getStudentAnalytics,
    getCourseAnalytics,
    getLearningStreak,
    getAchievements
} from '../controllers/analyticsController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// All analytics routes require authentication
router.use(authenticateJWT);

// Analytics routes
router.get('/overview', getAnalyticsOverview);
router.get('/progress-history', getProgressHistory);
router.get('/category-performance', getCategoryPerformance);
router.get('/streaks', getStreaksAndAchievements);

// Student analytics routes
router.get('/student', getStudentAnalytics);
router.get('/course/:courseId', getCourseAnalytics);
router.get('/streak', getLearningStreak);
router.get('/achievements', getAchievements);

export default router;
