import DataDeletionRequest, { IDataDeletionRequest } from '../models/DataDeletionRequest';
import User, { IUser } from '../models/User';
import StudentProfile from '../models/StudentProfile';
import Enrollment from '../models/Enrollment';
import AuditService from './auditService';
import { Request } from 'express';
import fs from 'fs';
import path from 'path';

export class DataDeletionService {
    /**
     * Create a data deletion request
     */
    static async createDeletionRequest(
        userId: string,
        requestedBy: string,
        reason: string,
        requestType: IDataDeletionRequest['requestType'] = 'account_deletion',
        req?: Request
    ): Promise<IDataDeletionRequest> {
        // Check if there's already a pending request
        const existingRequest = await DataDeletionRequest.findOne({
            userId,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingRequest) {
            throw new Error('There is already a pending deletion request for this user');
        }

        const deletionRequest = new DataDeletionRequest({
            userId,
            requestedBy,
            reason,
            requestType,
            status: 'pending'
        });

        await deletionRequest.save();

        // Log the deletion request
        await AuditService.logDeletionRequest(
            userId,
            requestedBy,
            requestedBy === userId ? 'student' : 'admin',
            reason,
            req
        );

        return deletionRequest;
    }

    /**
     * Get deletion requests (admin only)
     */
    static async getDeletionRequests(
        options: {
            status?: string;
            limit?: number;
            skip?: number;
            startDate?: Date;
            endDate?: Date;
        } = {}
    ): Promise<{ requests: IDataDeletionRequest[]; total: number }> {
        const {
            status,
            limit = 50,
            skip = 0,
            startDate,
            endDate
        } = options;

        const query: any = {};

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = startDate;
            if (endDate) query.createdAt.$lte = endDate;
        }

        const [requests, total] = await Promise.all([
            DataDeletionRequest.find(query)
                .populate('userId', 'username email firstName lastName')
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .lean(),
            DataDeletionRequest.countDocuments(query)
        ]);

        return { requests, total };
    }

    /**
     * Get user's deletion requests
     */
    static async getUserDeletionRequests(userId: string): Promise<IDataDeletionRequest[]> {
        return await DataDeletionRequest.find({ userId })
            .sort({ createdAt: -1 })
            .lean();
    }

    /**
     * Process deletion request (admin only)
     */
    static async processDeletionRequest(
        requestId: string,
        action: 'approve' | 'reject',
        processedBy: string,
        adminNotes?: string,
        scheduledFor?: Date
    ): Promise<IDataDeletionRequest> {
        const request = await DataDeletionRequest.findById(requestId);
        
        if (!request) {
            throw new Error('Deletion request not found');
        }

        if (request.status !== 'pending') {
            throw new Error('Only pending requests can be processed');
        }

        request.status = action === 'approve' ? 'approved' : 'rejected';
        request.processedBy = processedBy;
        request.processedAt = new Date();
        request.adminNotes = adminNotes;

        if (action === 'approve' && scheduledFor) {
            request.scheduledFor = scheduledFor;
            
            // Update user record
            await User.findByIdAndUpdate(request.userId, {
                deletionRequested: true,
                deletionRequestedAt: new Date(),
                deletionScheduledFor: scheduledFor
            });
        }

        await request.save();

        // Log the processing action
        await AuditService.logEvent({
            userId: request.userId,
            action: action === 'approve' ? 'update' : 'update',
            resource: 'deletion_request',
            resourceId: requestId,
            performedBy: processedBy,
            performedByRole: 'admin',
            details: {
                previousValues: { status: 'pending' },
                newValues: { 
                    status: request.status,
                    adminNotes,
                    scheduledFor: action === 'approve' ? scheduledFor : undefined
                }
            }
        });

        return request;
    }

    /**
     * Export user data
     */
    static async exportUserData(userId: string): Promise<{
        filename: string;
        data: any;
    }> {
        const user = await User.findById(userId).lean();
        const profile = await StudentProfile.findOne({ userId }).lean();
        const enrollments = await Enrollment.find({ studentId: userId })
            .populate('programmeId')
            .lean();

        const userData = {
            personal: {
                username: user?.username,
                email: user?.email,
                firstName: user?.firstName,
                lastName: user?.lastName,
                dateOfBirth: user?.dateOfBirth,
                phoneNumber: user?.phoneNumber,
                address: user?.address,
                enrollmentDate: user?.enrollmentDate,
                profileVisibility: user?.profileVisibility,
                dataRetentionConsent: user?.dataRetentionConsent,
                marketingConsent: user?.marketingConsent
            },
            profile: profile ? {
                contactInfo: profile.contactInfo,
                address: profile.address,
                academicInfo: profile.academicInfo,
                professionalInfo: profile.professionalInfo,
                learningPreferences: profile.learningPreferences,
                privacy: profile.privacy
            } : null,
            enrollments: enrollments.map(enrollment => ({
                programme: enrollment.programmeId,
                enrollmentDate: enrollment.enrollmentDate,
                status: enrollment.status,
                progress: enrollment.progress
            })),
            exportedAt: new Date().toISOString()
        };

        const filename = `user_data_${userId}_${Date.now()}.json`;
        
        return {
            filename,
            data: userData
        };
    }

    /**
     * Complete account deletion
     */
    static async completeAccountDeletion(
        userId: string,
        deletedBy: string,
        reason?: string
    ): Promise<void> {
        // Start transaction
        const session = await User.startSession();
        session.startTransaction();

        try {
            // Soft delete user (mark as deleted but keep for audit)
            await User.findByIdAndUpdate(userId, {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy,
                // Anonymize sensitive data
                email: `deleted_${userId}@deleted.local`,
                username: `deleted_${userId}`,
                firstName: undefined,
                lastName: undefined,
                phoneNumber: undefined,
                address: undefined,
                profilePicture: undefined,
                dateOfBirth: undefined
            }, { session });

            // Delete related data
            await StudentProfile.findOneAndDelete({ userId }, { session });
            
            // Mark enrollments as deleted
            await Enrollment.updateMany(
                { studentId: userId },
                { 
                    status: 'deleted',
                    deletedAt: new Date(),
                    deletedBy 
                },
                { session }
            );

            // Update deletion request status
            await DataDeletionRequest.updateMany(
                { userId, status: 'approved' },
                { 
                    status: 'completed',
                    completedAt: new Date()
                },
                { session }
            );

            // Log the deletion
            await AuditService.logEvent({
                userId,
                action: 'delete',
                resource: 'user_account',
                performedBy: deletedBy,
                performedByRole: 'admin',
                details: {
                    reason,
                    metadata: {
                        deletionType: 'complete_account_deletion'
                    }
                }
            });

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Cancel deletion request
     */
    static async cancelDeletionRequest(
        requestId: string,
        cancelledBy: string,
        reason?: string
    ): Promise<IDataDeletionRequest> {
        const request = await DataDeletionRequest.findById(requestId);
        
        if (!request) {
            throw new Error('Deletion request not found');
        }

        if (!['pending', 'approved'].includes(request.status)) {
            throw new Error('Only pending or approved requests can be cancelled');
        }

        request.status = 'cancelled';
        request.processedBy = cancelledBy;
        request.processedAt = new Date();
        request.adminNotes = reason || 'Request cancelled';

        await request.save();

        // Update user record to remove deletion flags
        await User.findByIdAndUpdate(request.userId, {
            deletionRequested: false,
            deletionRequestedAt: undefined,
            deletionScheduledFor: undefined
        });

        // Log the cancellation
        await AuditService.logEvent({
            userId: request.userId,
            action: 'update',
            resource: 'deletion_request',
            resourceId: requestId,
            performedBy: cancelledBy,
            performedByRole: 'admin',
            details: {
                previousValues: { status: request.status },
                newValues: { status: 'cancelled' },
                reason
            }
        });

        return request;
    }

    /**
     * Perform hard deletion of user account and all related data
     * This is a destructive operation that permanently removes all user data
     */
    static async performHardDeletion(userId: string, reason: string): Promise<void> {
        try {
            // Start with the user record to verify it exists
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // 1. Delete profile photos from filesystem
            try {
                const studentProfile = await StudentProfile.findOne({ userId });
                if (studentProfile?.profileImage) {
                    const uploadsDir = path.join(process.cwd(), '..', 'frontend', 'public', 'uploads');
                    const imagePath = path.join(uploadsDir, path.basename(studentProfile.profileImage));
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                }
            } catch (fsError) {
                console.warn('Failed to delete profile image file:', fsError);
                // Continue with deletion even if file deletion fails
            }

            // 2. Delete student profile
            await StudentProfile.deleteMany({ userId });

            // 3. Delete enrollments
            await Enrollment.deleteMany({ studentId: userId });

            // 4. Delete data deletion requests
            await DataDeletionRequest.deleteMany({ userId });

            // 5. Delete the user record (this should be last)
            await User.findByIdAndDelete(userId);

            console.log(`Successfully performed hard deletion for user: ${userId}`);
        } catch (error) {
            console.error(`Failed to perform hard deletion for user ${userId}:`, error);
            throw error;
        }
    }
}

export default DataDeletionService;
