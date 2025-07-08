import AuditLog, { IAuditLog } from '../models/AuditLog';
import { Request } from 'express';

export class AuditService {
    /**
     * Log an audit event
     */
    static async logEvent(params: {
        userId: string;
        action: IAuditLog['action'];
        resource: string;
        resourceId?: string;
        performedBy: string;
        performedByRole: IAuditLog['performedByRole'];
        req?: Request;
        details?: IAuditLog['details'];
        success?: boolean;
        errorMessage?: string;
    }): Promise<void> {
        try {
            const auditLog = new AuditLog({
                userId: params.userId,
                action: params.action,
                resource: params.resource,
                resourceId: params.resourceId,
                performedBy: params.performedBy,
                performedByRole: params.performedByRole,
                ipAddress: params.req?.ip || params.req?.connection?.remoteAddress,
                userAgent: params.req?.get('User-Agent'),
                details: params.details,
                success: params.success !== false,
                errorMessage: params.errorMessage,
                timestamp: new Date()
            });

            await auditLog.save();
        } catch (error) {
            // Log audit logging errors to console but don't throw
            // to avoid disrupting the main application flow
            console.error('Failed to log audit event:', error);
        }
    }

    /**
     * Get audit logs for a specific user
     */
    static async getUserAuditLogs(
        userId: string,
        options: {
            limit?: number;
            skip?: number;
            action?: string;
            startDate?: Date;
            endDate?: Date;
        } = {}
    ): Promise<{ logs: IAuditLog[]; total: number }> {
        const {
            limit = 50,
            skip = 0,
            action,
            startDate,
            endDate
        } = options;

        const query: any = { userId };

        if (action) {
            query.action = action;
        }

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = startDate;
            if (endDate) query.timestamp.$lte = endDate;
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ timestamp: -1 })
                .limit(limit)
                .skip(skip)
                .lean(),
            AuditLog.countDocuments(query)
        ]);

        return { logs, total };
    }

    /**
     * Get all audit logs (admin only)
     */
    static async getAllAuditLogs(
        options: {
            limit?: number;
            skip?: number;
            userId?: string;
            action?: string;
            performedBy?: string;
            startDate?: Date;
            endDate?: Date;
        } = {}
    ): Promise<{ logs: IAuditLog[]; total: number }> {
        const {
            limit = 50,
            skip = 0,
            userId,
            action,
            performedBy,
            startDate,
            endDate
        } = options;

        const query: any = {};

        if (userId) query.userId = userId;
        if (action) query.action = action;
        if (performedBy) query.performedBy = performedBy;

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = startDate;
            if (endDate) query.timestamp.$lte = endDate;
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ timestamp: -1 })
                .limit(limit)
                .skip(skip)
                .lean(),
            AuditLog.countDocuments(query)
        ]);

        return { logs, total };
    }

    /**
     * Log profile view event
     */
    static async logProfileView(
        viewedUserId: string,
        viewerUserId: string,
        viewerRole: IAuditLog['performedByRole'],
        req?: Request
    ): Promise<void> {
        await this.logEvent({
            userId: viewedUserId,
            action: 'view',
            resource: 'profile',
            performedBy: viewerUserId,
            performedByRole: viewerRole,
            req,
            details: {
                metadata: {
                    viewType: 'profile_page'
                }
            }
        });
    }

    /**
     * Log profile update event
     */
    static async logProfileUpdate(
        userId: string,
        updatedBy: string,
        updatedByRole: IAuditLog['performedByRole'],
        previousValues: any,
        newValues: any,
        req?: Request
    ): Promise<void> {
        await this.logEvent({
            userId,
            action: 'update',
            resource: 'profile',
            performedBy: updatedBy,
            performedByRole: updatedByRole,
            req,
            details: {
                previousValues,
                newValues
            }
        });
    }

    /**
     * Log login event
     */
    static async logLogin(
        userId: string,
        userRole: IAuditLog['performedByRole'],
        req?: Request,
        success: boolean = true,
        errorMessage?: string
    ): Promise<void> {
        await this.logEvent({
            userId,
            action: 'login',
            resource: 'authentication',
            performedBy: userId,
            performedByRole: userRole,
            req,
            success,
            errorMessage
        });
    }

    /**
     * Log data deletion request
     */
    static async logDeletionRequest(
        userId: string,
        requestedBy: string,
        requestedByRole: IAuditLog['performedByRole'],
        reason: string,
        req?: Request
    ): Promise<void> {
        await this.logEvent({
            userId,
            action: 'deletion_request',
            resource: 'user_data',
            performedBy: requestedBy,
            performedByRole: requestedByRole,
            req,
            details: {
                reason,
                metadata: {
                    requestType: 'account_deletion'
                }
            }
        });
    }

    /**
     * Clean up old audit logs
     */
    static async cleanupOldLogs(beforeDate: Date): Promise<{ deletedCount: number }> {
        try {
            const result = await AuditLog.deleteMany({
                timestamp: { $lt: beforeDate }
            });

            return { deletedCount: result.deletedCount || 0 };
        } catch (error) {
            console.error('Failed to cleanup old audit logs:', error);
            throw error;
        }
    }
}

export default AuditService;
