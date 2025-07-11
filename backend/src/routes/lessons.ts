import express from 'express';
import { getLessonContent } from '../controllers/courseContentController';

const router = express.Router();

/**
 * @route GET /api/lessons/:lessonId/content
 * @desc Get lesson content (alternative route for compatibility)
 * @access Public (with optional studentId query param)
 */
router.get('/:lessonId/content', getLessonContent);

export default router;
