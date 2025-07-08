import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import {
    getUserIntegrations,
    createOrUpdateIntegration,
    testIntegration,
    deleteIntegration,
    sendTestNotification
} from '../controllers/integrationController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

/**
 * @route GET /api/integrations
 * @desc Get user integrations
 * @access Private
 */
router.get('/', getUserIntegrations);

/**
 * @route POST /api/integrations
 * @desc Create or update an integration
 * @body platform, enabled, config, preferences
 * @access Private
 */
router.post('/', createOrUpdateIntegration);

/**
 * @route POST /api/integrations/:platform/test
 * @desc Test integration connection
 * @access Private
 */
router.post('/:platform/test', testIntegration);

/**
 * @route DELETE /api/integrations/:platform
 * @desc Delete an integration
 * @access Private
 */
router.delete('/:platform', deleteIntegration);

/**
 * @route POST /api/integrations/notify
 * @desc Send test notification
 * @body platform, type
 * @access Private
 */
router.post('/notify', sendTestNotification);

export default router;
