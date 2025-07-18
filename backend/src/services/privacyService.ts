import User, { IUser } from '../models/User';
import StudentProfile from '../models/StudentProfile';
import AuditService from './auditService';
import { Request } from 'express';

export class PrivacyService {
    /**
     * Update profile visibility settings
     */
    static async updateProfileVisibility(
        userId: string,
        visibility: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY',
        updatedBy: string,
        req?: Request
    ): Promise<IUser> {
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        const previousVisibility = user.profileVisibility;
        user.profileVisibility = visibility;
        await user.save();

        // Log the visibility change
        await AuditService.logProfileUpdate(
            userId,
            updatedBy,
            updatedBy === userId ? 'student' : 'admin',
            { profileVisibility: previousVisibility },
            { profileVisibility: visibility },
            req
        );

        return user;
    }

    /**
     * Update all privacy settings at once
     */
    static async updatePrivacySettings(
        userId: string,
        settings: {
            profileVisibility?: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
            allowMessaging?: boolean;
            allowConnectionRequests?: boolean;
            dataProcessingConsent?: boolean;
            marketingConsent?: boolean;
            showProgress?: boolean;
            showAchievements?: boolean;
        },
        updatedBy: string,
        req?: Request
    ): Promise<IUser> {
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        const previousSettings = {
            profileVisibility: user.profileVisibility,
            allowMessaging: user.allowMessaging,
            allowConnectionRequests: user.allowConnectionRequests,
            dataProcessingConsent: user.dataProcessingConsent,
            marketingConsent: user.marketingConsent,
            showProgress: user.showProgress,
            showAchievements: user.showAchievements
        };

        // Update settings if provided
        if (settings.profileVisibility !== undefined) {
            user.profileVisibility = settings.profileVisibility;
        }
        if (settings.allowMessaging !== undefined) {
            user.allowMessaging = settings.allowMessaging;
        }
        if (settings.allowConnectionRequests !== undefined) {
            user.allowConnectionRequests = settings.allowConnectionRequests;
        }
        if (settings.dataProcessingConsent !== undefined) {
            user.dataProcessingConsent = settings.dataProcessingConsent;
        }
        if (settings.marketingConsent !== undefined) {
            user.marketingConsent = settings.marketingConsent;
        }
        if (settings.showProgress !== undefined) {
            user.showProgress = settings.showProgress;
        }
        if (settings.showAchievements !== undefined) {
            user.showAchievements = settings.showAchievements;
        }

        await user.save();

        // Log the privacy settings changes
        await AuditService.logProfileUpdate(
            userId,
            updatedBy,
            updatedBy === userId ? 'student' : 'admin',
            previousSettings,
            settings,
            req
        );

        return user;
    }

    /**
     * Update consent settings
     */
    static async updateConsentSettings(
        userId: string,
        settings: {
            dataProcessingConsent?: boolean;
            marketingConsent?: boolean;
        },
        updatedBy: string,
        req?: Request
    ): Promise<IUser> {
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        const previousSettings = {
            dataProcessingConsent: user.dataProcessingConsent,
            marketingConsent: user.marketingConsent
        };

        if (settings.dataProcessingConsent !== undefined) {
            user.dataProcessingConsent = settings.dataProcessingConsent;
        }
        if (settings.marketingConsent !== undefined) {
            user.marketingConsent = settings.marketingConsent;
        }

        await user.save();

        // Log the consent changes
        await AuditService.logProfileUpdate(
            userId,
            updatedBy,
            updatedBy === userId ? 'student' : 'admin',
            previousSettings,
            settings,
            req
        );

        return user;
    }

    /**
     * Check if user profile can be viewed by another user
     */
    static async canViewProfile(
        targetUserId: string,
        viewerUserId: string,
        viewerRole: 'admin' | 'user' | 'student' | 'visitor'
    ): Promise<{
        canView: boolean;
        reason?: string;
        limitedFields?: string[];
    }> {
        // Admins can view all profiles
        if (viewerRole === 'admin') {
            return { canView: true };
        }

        // Users can always view their own profile
        if (targetUserId === viewerUserId) {
            return { canView: true };
        }

        const targetUser = await User.findById(targetUserId);
        
        if (!targetUser) {
            return { canView: false, reason: 'User not found' };
        }

        // Check if target user account is deleted
        if (targetUser.isDeleted) {
            return { canView: false, reason: 'User account no longer exists' };
        }

        switch (targetUser.profileVisibility) {
            case 'PUBLIC':
                return { canView: true };
                
            case 'PRIVATE':
                return { 
                    canView: false, 
                    reason: 'This profile is set to private' 
                };
                
            case 'CONNECTIONS_ONLY':
                // For CONNECTIONS_ONLY, we'd need to implement a contacts/friends system
                // For now, we'll treat it as private for non-contacts
                return { 
                    canView: false, 
                    reason: 'This profile is only visible to connections' 
                };
                
            default:
                return { canView: true };
        }
    }

    /**
     * Get sanitized profile data based on privacy settings
     */
    static async getSanitizedProfileData(
        targetUserId: string,
        viewerUserId: string,
        viewerRole: 'admin' | 'user' | 'student' | 'visitor'
    ): Promise<{
        user: Partial<IUser> | null;
        profile: any | null;
        accessLevel: 'full' | 'limited' | 'none';
    }> {
        const viewPermission = await this.canViewProfile(targetUserId, viewerUserId, viewerRole);
        
        if (!viewPermission.canView) {
            return {
                user: null,
                profile: null,
                accessLevel: 'none'
            };
        }

        const user = await User.findById(targetUserId);
        const profile = await StudentProfile.findOne({ userId: targetUserId });

        if (!user) {
            return {
                user: null,
                profile: null,
                accessLevel: 'none'
            };
        }

        // Log profile view (map visitor role to user for audit logging)
        const auditRole: 'admin' | 'user' | 'student' | 'system' = 
            viewerRole === 'visitor' ? 'user' : viewerRole as 'admin' | 'user' | 'student' | 'system';
        
        await AuditService.logProfileView(
            targetUserId,
            viewerUserId,
            auditRole,
        );

        let sanitizedUser: Partial<IUser>;
        let sanitizedProfile: any = null;

        if (viewerRole === 'admin' || targetUserId === viewerUserId) {
            // Full access for admins and self-viewing
            sanitizedUser = user.toJSON();
            sanitizedProfile = profile?.toJSON();
            return {
                user: sanitizedUser,
                profile: sanitizedProfile,
                accessLevel: 'full'
            };
        } else {
            // Limited access for others viewing public profiles
            sanitizedUser = {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicture: user.profilePicture,
                role: user.role,
                enrollmentStatus: user.enrollmentStatus,
                enrollmentDate: user.enrollmentDate
            };

            if (profile) {
                sanitizedProfile = {
                    // Only include non-sensitive profile information
                    academicInfo: profile.academicInfo ? {
                        educationLevel: profile.academicInfo.educationLevel,
                        fieldOfStudy: profile.academicInfo.fieldOfStudy
                    } : null
                };
            }

            return {
                user: sanitizedUser,
                profile: sanitizedProfile,
                accessLevel: 'limited'
            };
        }
    }

    /**
     * Get privacy settings for a user
     */
    static async getPrivacySettings(userId: string): Promise<{
        profileVisibility: string;
        allowMessaging: boolean;
        allowConnectionRequests: boolean;
        dataProcessingConsent: boolean;
        marketingConsent: boolean;
        showProgress: boolean;
        showAchievements: boolean;
    }> {
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        return {
            profileVisibility: user.profileVisibility,
            allowMessaging: user.allowMessaging,
            allowConnectionRequests: user.allowConnectionRequests,
            dataProcessingConsent: user.dataProcessingConsent,
            marketingConsent: user.marketingConsent,
            showProgress: user.showProgress,
            showAchievements: user.showAchievements
        };
    }
}

export default PrivacyService;
