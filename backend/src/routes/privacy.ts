import express, { RequestHandler, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';
import PrivacyService from '../services/privacyService';
import DataDeletionService from '../services/dataDeletionService';
import AuditService from '../services/auditService';
import emailService from '../services/emailService';
import { body, param, query, validationResult } from 'express-validator';
import User from '../models/User';
import DataDeletionRequest from '../models/DataDeletionRequest';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Validation middleware
const validateRequest: RequestHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: errors.array()
        });
        return;
    }
    next();
};

// Helper function to get user role for audit logs
const getUserRoleForAudit = (role: string): 'admin' | 'user' | 'student' | 'system' => {
    if (role === 'visitor') return 'user';
    return role as 'admin' | 'user' | 'student' | 'system';
};

// Privacy Settings Routes

/**
 * GET /api/privacy/settings
 * Get current user's privacy settings
 */
router.get('/settings', authenticateJWT, async (req: AuthRequest, res: Response) => {
    try {
        const settings = await PrivacyService.getPrivacySettings(req.user!.id);
        
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get privacy settings'
        });
    }
});

/**
 * PUT /api/privacy/visibility
 * Update profile visibility setting
 */
router.put('/visibility', [
    authenticateJWT,
    body('visibility')
        .isIn(['PUBLIC', 'PRIVATE', 'CONNECTIONS_ONLY'])
        .withMessage('Invalid visibility setting'),
    validateRequest
], async (req: AuthRequest, res: Response) => {
    try {
        const { visibility } = req.body;
        
        const user = await PrivacyService.updateProfileVisibility(
            req.user!.id,
            visibility,
            req.user!.id,
            req
        );
        
        res.json({
            success: true,
            message: 'Profile visibility updated successfully',
            data: {
                profileVisibility: user.profileVisibility
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update profile visibility'
        });
    }
});

/**
 * PUT /api/privacy/settings
 * Update all privacy settings at once
 */
router.put('/settings', [
    authenticateJWT,
    body('profileVisibility')
        .optional()
        .isIn(['PUBLIC', 'PRIVATE', 'CONNECTIONS_ONLY'])
        .withMessage('Invalid profile visibility setting'),
    body('allowMessaging')
        .optional()
        .isBoolean()
        .withMessage('allowMessaging must be a boolean'),
    body('allowConnectionRequests')
        .optional()
        .isBoolean()
        .withMessage('allowConnectionRequests must be a boolean'),
    body('dataProcessingConsent')
        .optional()
        .isBoolean()
        .withMessage('dataProcessingConsent must be a boolean'),
    body('marketingConsent')
        .optional()
        .isBoolean()
        .withMessage('marketingConsent must be a boolean'),
    body('showProgress')
        .optional()
        .isBoolean()
        .withMessage('showProgress must be a boolean'),
    body('showAchievements')
        .optional()
        .isBoolean()
        .withMessage('showAchievements must be a boolean'),
    validateRequest
], async (req: AuthRequest, res: Response) => {
    try {
        const {
            profileVisibility,
            allowMessaging,
            allowConnectionRequests,
            dataProcessingConsent,
            marketingConsent,
            showProgress,
            showAchievements
        } = req.body;
        
        const user = await PrivacyService.updatePrivacySettings(
            req.user!.id,
            {
                profileVisibility,
                allowMessaging,
                allowConnectionRequests,
                dataProcessingConsent,
                marketingConsent,
                showProgress,
                showAchievements
            },
            req.user!.id,
            req
        );
        
        res.json({
            success: true,
            message: 'Privacy settings updated successfully',
            data: {
                profileVisibility: user.profileVisibility,
                allowMessaging: user.allowMessaging,
                allowConnectionRequests: user.allowConnectionRequests,
                dataProcessingConsent: user.dataProcessingConsent,
                marketingConsent: user.marketingConsent,
                showProgress: user.showProgress,
                showAchievements: user.showAchievements
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update privacy settings'
        });
    }
});

/**
 * PUT /api/privacy/consent
 * Update consent settings
 */
router.put('/consent', [
    authenticateJWT,
    body('dataProcessingConsent')
        .optional()
        .isBoolean()
        .withMessage('dataProcessingConsent must be a boolean'),
    body('marketingConsent')
        .optional()
        .isBoolean()
        .withMessage('marketingConsent must be a boolean'),
    validateRequest
], async (req: AuthRequest, res: Response) => {
    try {
        const { dataProcessingConsent, marketingConsent } = req.body;
        
        const user = await PrivacyService.updateConsentSettings(
            req.user!.id,
            { dataProcessingConsent, marketingConsent },
            req.user!.id,
            req
        );
        
        res.json({
            success: true,
            message: 'Consent settings updated successfully',
            data: {
                dataProcessingConsent: user.dataProcessingConsent,
                marketingConsent: user.marketingConsent
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update consent settings'
        });
    }
});

/**
 * POST /api/privacy/delete-account
 * Request immediate account deletion (soft delete with 30-day grace period)
 */
router.post('/delete-account', [
    authenticateJWT,
    body('password')
        .notEmpty()
        .withMessage('Password is required for account deletion'),
    body('reason')
        .notEmpty()
        .withMessage('Reason is required')
        .isLength({ max: 1000 })
        .withMessage('Reason must be less than 1000 characters'),
    body('confirmText')
        .equals('DELETE MY ACCOUNT')
        .withMessage('Confirmation text must match exactly'),
    validateRequest
], async (req: AuthRequest, res: Response) => {
    try {
        const { password, reason, confirmText } = req.body;
        
        // Verify password first
        const user = await User.findById(req.user!.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({
                success: false,
                message: 'Invalid password'
            });
            return;
        }

        // Check if user is already scheduled for deletion
        if (user.deletionRequested) {
            res.status(400).json({
                success: false,
                message: 'Account deletion is already scheduled'
            });
            return;
        }

        // Schedule deletion for 30 days from now
        const deletionDate = new Date();
        deletionDate.setDate(deletionDate.getDate() + 30);

        // Update user record
        user.deletionRequested = true;
        user.deletionRequestedAt = new Date();
        user.deletionScheduledFor = deletionDate;
        user.deletionReason = reason;
        await user.save();

        // Create deletion request record
        const deletionRequest = await DataDeletionService.createDeletionRequest(
            user.id,
            user.id,
            reason,
            'account_deletion',
            req
        );

        // Auto-approve the request since it's user-initiated
        await DataDeletionService.processDeletionRequest(
            deletionRequest.id,
            'approve',
            'system',
            'User-initiated account deletion with 30-day grace period',
            deletionDate
        );

        // Log the deletion request
        await AuditService.logEvent({
            userId: user.id,
            action: 'deletion_request',
            resource: 'user_account',
            performedBy: user.id,
            performedByRole: getUserRoleForAudit(user.role),
            req,
            details: {
                reason,
                metadata: {
                    deletionType: 'user_initiated',
                    gracePeriodDays: 30,
                    scheduledFor: deletionDate
                }
            }
        });

        // Send email notification
        try {
            const userName = user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.username || 'User';
            await emailService.sendAccountDeletionScheduledEmail(
                user.email, 
                userName, 
                deletionDate
            );
        } catch (emailError) {
            // Don't fail the request if email fails, just log it
            console.error('Failed to send deletion scheduled email:', emailError);
        }

        res.json({
            success: true,
            message: 'Account deletion scheduled successfully',
            data: {
                scheduledFor: deletionDate,
                gracePeriodDays: 30
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to process account deletion'
        });
    }
});

/**
 * POST /api/privacy/cancel-deletion
 * Cancel scheduled account deletion (within grace period)
 */
router.post('/cancel-deletion', [
    authenticateJWT,
    body('reason')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Reason must be less than 500 characters'),
    validateRequest
], async (req: AuthRequest, res: Response) => {
    try {
        const { reason = 'User cancelled deletion request' } = req.body;
        
        const user = await User.findById(req.user!.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        if (!user.deletionRequested) {
            res.status(400).json({
                success: false,
                message: 'No deletion request found to cancel'
            });
            return;
        }

        // Check if still within grace period
        if (user.deletionScheduledFor && user.deletionScheduledFor <= new Date()) {
            res.status(400).json({
                success: false,
                message: 'Deletion grace period has expired'
            });
            return;
        }

        // Cancel deletion
        user.deletionRequested = false;
        user.deletionRequestedAt = undefined;
        user.deletionScheduledFor = undefined;
        user.deletionReason = undefined;
        await user.save();

        // Update deletion request status
        await DataDeletionRequest.updateMany(
            { userId: user.id, status: 'approved' },
            { 
                status: 'cancelled',
                processedBy: user.id,
                processedAt: new Date(),
                adminNotes: reason
            }
        );

        // Log the cancellation
        await AuditService.logEvent({
            userId: user.id,
            action: 'update',
            resource: 'deletion_request',
            performedBy: user.id,
            performedByRole: getUserRoleForAudit(user.role),
            req,
            details: {
                reason,
                metadata: {
                    action: 'cancelled'
                }
            }
        });

        // Send email notification
        try {
            const userName = user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.username || 'User';
            await emailService.sendAccountDeletionCancelledEmail(
                user.email, 
                userName
            );
        } catch (emailError) {
            // Don't fail the request if email fails, just log it
            console.error('Failed to send deletion cancelled email:', emailError);
        }

        res.json({
            success: true,
            message: 'Account deletion cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to cancel deletion'
        });
    }
});

/**
 * GET /api/privacy/deletion-status
 * Get current deletion status and remaining days
 */
router.get('/deletion-status', authenticateJWT, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        const deletionStatus = {
            isScheduled: user.deletionRequested,
            requestedAt: user.deletionRequestedAt,
            scheduledFor: user.deletionScheduledFor,
            reason: user.deletionReason,
            remainingDays: user.deletionScheduledFor 
                ? Math.ceil((user.deletionScheduledFor.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : null
        };

        res.json({
            success: true,
            data: deletionStatus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get deletion status'
        });
    }
});
router.post('/deletion-request', [
    authenticateJWT,
    body('reason')
        .notEmpty()
        .withMessage('Reason is required')
        .isLength({ max: 1000 })
        .withMessage('Reason must be less than 1000 characters'),
    body('requestType')
        .optional()
        .isIn(['account_deletion', 'data_export', 'data_deletion'])
        .withMessage('Invalid request type'),
    validateRequest
], async (req: AuthRequest, res: Response) => {
    try {
        const { reason, requestType = 'account_deletion' } = req.body;
        
        const deletionRequest = await DataDeletionService.createDeletionRequest(
            req.user!.id,
            req.user!.id,
            reason,
            requestType,
            req
        );
        
        res.status(201).json({
            success: true,
            message: 'Deletion request created successfully',
            data: deletionRequest
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create deletion request'
        });
    }
});

/**
 * GET /api/privacy/deletion-requests
 * Get user's deletion requests
 */
router.get('/deletion-requests', authenticateJWT, async (req: AuthRequest, res: Response) => {
    try {
        const requests = await DataDeletionService.getUserDeletionRequests(req.user!.id);
        
        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get deletion requests'
        });
    }
});

/**
 * GET /api/privacy/export-data
 * Export user data
 */
router.get('/export-data', authenticateJWT, async (req: AuthRequest, res: Response) => {
    try {
        const { filename, data } = await DataDeletionService.exportUserData(req.user!.id);
        
        // Log data export
        await AuditService.logEvent({
            userId: req.user!.id,
            action: 'export_data',
            resource: 'user_data',
            performedBy: req.user!.id,
            performedByRole: getUserRoleForAudit(req.user!.role),
            req,
            details: {
                metadata: {
                    exportType: 'full_data_export',
                    filename
                }
            }
        });
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/json');
        res.json(data);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to export data'
        });
    }
});

// Audit Log Routes

/**
 * GET /api/privacy/audit-logs
 * Get user's audit logs
 */
router.get('/audit-logs', [
    authenticateJWT,
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('skip')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Skip must be non-negative'),
    query('action')
        .optional()
        .isIn(['view', 'create', 'update', 'delete', 'login', 'logout', 'export_data', 'deletion_request'])
        .withMessage('Invalid action filter'),
    validateRequest
], async (req: AuthRequest, res: Response) => {
    try {
        const {
            limit = 50,
            skip = 0,
            action,
            startDate,
            endDate
        } = req.query;
        
        const options = {
            limit: parseInt(limit as string),
            skip: parseInt(skip as string),
            action: action as string,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined
        };
        
        const { logs, total } = await AuditService.getUserAuditLogs(req.user!.id, options);
        
        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    total,
                    limit: options.limit,
                    skip: options.skip,
                    hasMore: total > options.skip + options.limit
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get audit logs'
        });
    }
});

// Admin Routes

/**
 * GET /api/privacy/admin/deletion-requests
 * Get all deletion requests (admin only)
 */
router.get('/admin/deletion-requests', [
    authenticateJWT,
    authorizeRoles('admin'),
    query('status')
        .optional()
        .isIn(['pending', 'approved', 'rejected', 'completed', 'cancelled'])
        .withMessage('Invalid status filter'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('skip')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Skip must be non-negative'),
    validateRequest
], async (req: AuthRequest, res: Response) => {
    try {
        const {
            status,
            limit = 50,
            skip = 0,
            startDate,
            endDate
        } = req.query;
        
        const options = {
            status: status as string,
            limit: parseInt(limit as string),
            skip: parseInt(skip as string),
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined
        };
        
        const { requests, total } = await DataDeletionService.getDeletionRequests(options);
        
        res.json({
            success: true,
            data: {
                requests,
                pagination: {
                    total,
                    limit: options.limit,
                    skip: options.skip,
                    hasMore: total > options.skip + options.limit
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get deletion requests'
        });
    }
});

/**
 * PUT /api/privacy/admin/deletion-requests/:id/process
 * Process a deletion request (admin only)
 */
router.put('/admin/deletion-requests/:id/process', [
    authenticateJWT,
    authorizeRoles('admin'),
    param('id').isMongoId().withMessage('Invalid request ID'),
    body('action')
        .isIn(['approve', 'reject'])
        .withMessage('Action must be approve or reject'),
    body('adminNotes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Admin notes must be less than 1000 characters'),
    body('scheduledFor')
        .optional()
        .isISO8601()
        .withMessage('Invalid scheduled date'),
    validateRequest
], async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { action, adminNotes, scheduledFor } = req.body;
        
        const request = await DataDeletionService.processDeletionRequest(
            id,
            action,
            req.user!.id,
            adminNotes,
            scheduledFor ? new Date(scheduledFor) : undefined
        );
        
        res.json({
            success: true,
            message: `Deletion request ${action}d successfully`,
            data: request
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to process deletion request'
        });
    }
});

/**
 * GET /api/privacy/admin/audit-logs
 * Get all audit logs (admin only)
 */
router.get('/admin/audit-logs', [
    authenticateJWT,
    authorizeRoles('admin'),
    query('userId').optional().isMongoId().withMessage('Invalid user ID'),
    query('action')
        .optional()
        .isIn(['view', 'create', 'update', 'delete', 'login', 'logout', 'export_data', 'deletion_request'])
        .withMessage('Invalid action filter'),
    query('performedBy').optional().isMongoId().withMessage('Invalid performedBy ID'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('skip')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Skip must be non-negative'),
    validateRequest
], async (req: AuthRequest, res: Response) => {
    try {
        const {
            userId,
            action,
            performedBy,
            limit = 50,
            skip = 0,
            startDate,
            endDate
        } = req.query;
        
        const options = {
            userId: userId as string,
            action: action as string,
            performedBy: performedBy as string,
            limit: parseInt(limit as string),
            skip: parseInt(skip as string),
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined
        };
        
        const { logs, total } = await AuditService.getAllAuditLogs(options);
        
        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    total,
                    limit: options.limit,
                    skip: options.skip,
                    hasMore: total > options.skip + options.limit
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get audit logs'
        });
    }
});

export default router;
