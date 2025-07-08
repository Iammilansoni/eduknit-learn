import cron from 'node-cron';
import User from '../models/User';
import DataDeletionService from './dataDeletionService';
import AuditService from './auditService';
import logger from '../config/logger';

/**
 * Scheduled Jobs Service
 * Handles automated tasks like account deletions, cleanups, etc.
 */
export class ScheduledJobsService {
    private static isInitialized = false;

    /**
     * Initialize all scheduled jobs
     */
    static initialize(): void {
        if (this.isInitialized) {
            logger.warn('Scheduled jobs already initialized');
            return;
        }

        logger.info('Initializing scheduled jobs...');

        // Run every day at 2 AM to process expired account deletions
        cron.schedule('0 2 * * *', async () => {
            await this.processExpiredAccountDeletions();
        }, {
            timezone: "UTC"
        });

        // Run every week to clean up old audit logs (optional)
        cron.schedule('0 3 * * 0', async () => {
            await this.cleanupOldAuditLogs();
        }, {
            timezone: "UTC"
        });

        this.isInitialized = true;
        logger.info('Scheduled jobs initialized successfully');
    }

    /**
     * Process users whose deletion grace period has expired
     */
    static async processExpiredAccountDeletions(): Promise<void> {
        try {
            logger.info('Starting expired account deletions processing...');

            // Find users whose deletion is scheduled for today or earlier
            const expiredUsers = await User.find({
                deletionRequested: true,
                deletionScheduledFor: { $lte: new Date() },
                isDeleted: { $ne: true }
            });

            logger.info(`Found ${expiredUsers.length} users with expired deletion requests`);

            for (const user of expiredUsers) {
                try {
                    logger.info(`Processing account deletion for user: ${user.id}`);

                    // Perform hard deletion
                    await DataDeletionService.performHardDeletion(user.id, 'Automated deletion after grace period');

                    // Log the automated deletion
                    await AuditService.logEvent({
                        userId: user.id,
                        action: 'delete',
                        resource: 'user_account',
                        performedBy: 'system',
                        performedByRole: 'system',
                        details: {
                            reason: 'Automated deletion after 30-day grace period',
                            metadata: {
                                deletionType: 'automated',
                                originalRequestDate: user.deletionRequestedAt,
                                gracePeriodExpired: true
                            }
                        },
                        success: true
                    });

                    logger.info(`Successfully deleted user account: ${user.id}`);
                } catch (error) {
                    logger.error(`Failed to delete user account ${user.id}:`, error);

                    // Log the failed deletion
                    await AuditService.logEvent({
                        userId: user.id,
                        action: 'delete',
                        resource: 'user_account',
                        performedBy: 'system',
                        performedByRole: 'system',
                        details: {
                            reason: 'Automated deletion after 30-day grace period',
                            metadata: {
                                deletionType: 'automated',
                                originalRequestDate: user.deletionRequestedAt,
                                gracePeriodExpired: true
                            }
                        },
                        success: false,
                        errorMessage: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }

            logger.info('Completed expired account deletions processing');
        } catch (error) {
            logger.error('Error in processExpiredAccountDeletions:', error);
        }
    }

    /**
     * Clean up audit logs older than specified retention period
     * This is optional and can be configured based on requirements
     */
    static async cleanupOldAuditLogs(): Promise<void> {
        try {
            logger.info('Starting audit logs cleanup...');

            // Keep audit logs for 2 years by default
            const retentionPeriod = new Date();
            retentionPeriod.setFullYear(retentionPeriod.getFullYear() - 2);

            const result = await AuditService.cleanupOldLogs(retentionPeriod);
            
            logger.info(`Cleaned up ${result.deletedCount} old audit log entries`);
        } catch (error) {
            logger.error('Error in cleanupOldAuditLogs:', error);
        }
    }

    /**
     * Stop all scheduled jobs (useful for testing or shutdown)
     */
    static stopAll(): void {
        cron.getTasks().forEach((task: any) => {
            task.stop();
        });
        this.isInitialized = false;
        logger.info('All scheduled jobs stopped');
    }

    /**
     * Get status of all scheduled jobs
     */
    static getJobsStatus(): Array<{ name: string; running: boolean; nextDate: string | null }> {
        const tasks = cron.getTasks();
        const jobsStatus: Array<{ name: string; running: boolean; nextDate: string | null }> = [];

        let taskIndex = 0;
        tasks.forEach((task: any, _: any) => {
            const jobNames = ['Account Deletions', 'Audit Logs Cleanup'];
            jobsStatus.push({
                name: jobNames[taskIndex] || `Job ${taskIndex}`,
                running: task.status === 'running',
                nextDate: task.getStatus()
            });
            taskIndex++;
        });

        return jobsStatus;
    }
}

export default ScheduledJobsService;
