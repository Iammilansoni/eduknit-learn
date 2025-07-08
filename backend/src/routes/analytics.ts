import express from 'express';
import {
    getAnalyticsOverview,
    getProgressHistory,
    getCategoryPerformance,
    getStreaksAndAchievements
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

export default router;
