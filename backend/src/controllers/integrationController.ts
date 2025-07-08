import { Response } from 'express';
import { AuthenticatedRequest } from '../utils/jwt';
import Integration from '../models/Integration';
import discordService from '../services/discordService';
import { success, error } from '../utils/response';

// Get user integrations
export const getUserIntegrations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      error(res, 'User not authenticated', 401, 'UNAUTHORIZED');
      return;
    }

    const integrations = await Integration.find({ userId }).sort({ platform: 1 });
    success(res, integrations, 'Integrations retrieved successfully');
  } catch (err) {
    console.error('Error fetching integrations:', err);
    error(res, 'Failed to fetch integrations', 500, 'INTERNAL_SERVER_ERROR');
  }
};

// Create or update integration
export const createOrUpdateIntegration = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      error(res, 'User not authenticated', 401, 'UNAUTHORIZED');
      return;
    }

    const { platform, enabled, config, preferences } = req.body;

    // Validate required fields
    if (!platform || !['discord', 'slack', 'teams', 'zoom'].includes(platform)) {
      error(res, 'Valid platform is required', 400, 'VALIDATION_ERROR');
      return;
    }

    // For Discord, validate webhook URL if provided
    if (platform === 'discord' && config?.webhookUrl) {
      const isValid = await discordService.validateWebhook(config.webhookUrl);
      if (!isValid) {
        error(res, 'Invalid Discord webhook URL', 400, 'VALIDATION_ERROR');
        return;
      }
    }

    // Find existing integration or create new one
    let integration = await Integration.findOne({ userId, platform });

    if (integration) {
      // Update existing integration
      integration.enabled = enabled !== undefined ? enabled : integration.enabled;
      if (config) {
        integration.config = { ...integration.config, ...config };
      }
      if (preferences) {
        integration.preferences = { ...integration.preferences, ...preferences };
      }
      integration.metadata.syncStatus = 'pending';
      await integration.save();
    } else {
      // Create new integration
      integration = new Integration({
        userId,
        platform,
        enabled: enabled || false,
        config: config || {},
        preferences: preferences || {
          notifications: true,
          announcements: true,
          progressUpdates: false,
          achievementSharing: false
        }
      });
      await integration.save();
    }

    success(res, integration, 'Integration saved successfully');
  } catch (err) {
    console.error('Error saving integration:', err);
    error(res, 'Failed to save integration', 500, 'INTERNAL_SERVER_ERROR');
  }
};

// Test integration connection
export const testIntegration = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      error(res, 'User not authenticated', 401, 'UNAUTHORIZED');
      return;
    }

    const { platform } = req.params;

    if (platform === 'discord') {
      const result = await discordService.testConnection(userId.toString());
      if (result) {
        success(res, { connected: true }, 'Discord integration test successful');
      } else {
        error(res, 'Discord integration test failed', 400, 'TEST_FAILED');
      }
    } else {
      error(res, 'Platform not supported for testing', 400, 'VALIDATION_ERROR');
    }
  } catch (err) {
    console.error('Error testing integration:', err);
    error(res, 'Failed to test integration', 500, 'INTERNAL_SERVER_ERROR');
  }
};

// Delete integration
export const deleteIntegration = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      error(res, 'User not authenticated', 401, 'UNAUTHORIZED');
      return;
    }

    const { platform } = req.params;

    const integration = await Integration.findOneAndDelete({ userId, platform });

    if (!integration) {
      error(res, 'Integration not found', 404, 'NOT_FOUND');
      return;
    }

    success(res, null, 'Integration deleted successfully');
  } catch (err) {
    console.error('Error deleting integration:', err);
    error(res, 'Failed to delete integration', 500, 'INTERNAL_SERVER_ERROR');
  }
};

// Send test notification
export const sendTestNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      error(res, 'User not authenticated', 401, 'UNAUTHORIZED');
      return;
    }

    const { platform, type } = req.body;

    if (platform === 'discord') {
      switch (type) {
        case 'enrollment':
          await discordService.notifyEnrollment(userId.toString(), 'Test Course - Integration Demo');
          break;
        case 'achievement':
          await discordService.notifyAchievement(userId.toString(), 'Integration Master', 100);
          break;
        case 'progress':
          await discordService.notifyProgress(userId.toString(), 'Test Course - Integration Demo', 50);
          break;
        case 'announcement':
          await discordService.sendAnnouncement(userId.toString(), 'Test Announcement', 'This is a test announcement from EduKnit!');
          break;
        default:
          error(res, 'Invalid notification type', 400, 'VALIDATION_ERROR');
          return;
      }
      success(res, null, 'Test notification sent successfully');
    } else {
      error(res, 'Platform not supported', 400, 'VALIDATION_ERROR');
    }
  } catch (err) {
    console.error('Error sending test notification:', err);
    error(res, 'Failed to send test notification', 500, 'INTERNAL_SERVER_ERROR');
  }
};

// Get integration statistics
export const getIntegrationStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      error(res, 'User not authenticated', 401, 'UNAUTHORIZED');
      return;
    }

    const integrations = await Integration.find({ userId });
    
    const stats = {
      totalIntegrations: integrations.length,
      enabledIntegrations: integrations.filter(i => i.enabled).length,
      platformBreakdown: integrations.reduce((acc, integration) => {
        acc[integration.platform] = {
          enabled: integration.enabled,
          lastSync: integration.metadata.lastSync,
          syncStatus: integration.metadata.syncStatus
        };
        return acc;
      }, {} as Record<string, any>),
      lastActivityDate: integrations
        .filter(i => i.metadata.lastSync)
        .sort((a, b) => (b.metadata.lastSync?.getTime() || 0) - (a.metadata.lastSync?.getTime() || 0))[0]?.metadata.lastSync || null
    };

    success(res, stats, 'Integration statistics retrieved successfully');
  } catch (err) {
    console.error('Error fetching integration stats:', err);
    error(res, 'Failed to fetch integration statistics', 500, 'INTERNAL_SERVER_ERROR');
  }
};
// Utility function to format time ago (helper for potential dashboard widgets)
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

function getAvailableChannels() {
  return [
    { id: 'announcements', name: 'Announcements', description: 'Important updates and news' },
    { id: 'study-groups', name: 'Study Groups', description: 'Collaborative learning sessions' },
    { id: 'achievements', name: 'Achievements', description: 'Student accomplishments' },
    { id: 'events', name: 'Events', description: 'Upcoming workshops and sessions' },
    { id: 'general', name: 'General', description: 'General discussion' },
    { id: 'help', name: 'Help', description: 'Get help with your studies' }
  ];
}

function getColorForType(type: string): number {
  const colors = {
    announcement: 0x3498db, // Blue
    event: 0xe74c3c,        // Red
    achievement: 0xf1c40f,  // Yellow
    discussion: 0x9b59b6,   // Purple
    notification: 0x2ecc71  // Green
  };
  return colors[type as keyof typeof colors] || colors.notification;
}
