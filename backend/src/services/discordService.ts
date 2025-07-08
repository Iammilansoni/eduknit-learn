import Integration from '../models/Integration';
import { IIntegration } from '../models/Integration';
import logger from '../config/logger';

export interface DiscordWebhookPayload {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    footer?: {
      text: string;
    };
    timestamp?: string;
  }>;
}

export interface DiscordServerInfo {
  id: string;
  name: string;
  icon?: string;
  memberCount?: number;
}

class DiscordService {
  private readonly baseUrl = 'https://discord.com/api/v10';
  private readonly webhookRateLimit = new Map<string, number>();

  /**
   * Send a message to Discord via webhook
   */
  async sendWebhookMessage(webhookUrl: string, payload: DiscordWebhookPayload): Promise<boolean> {
    try {
      // Rate limiting check (basic implementation)
      const now = Date.now();
      const lastRequest = this.webhookRateLimit.get(webhookUrl) || 0;
      const timeDiff = now - lastRequest;
      
      if (timeDiff < 1000) {
        logger.warn('Discord webhook rate limit hit, skipping message');
        return false;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.webhookRateLimit.set(webhookUrl, now);
      logger.info('Discord webhook message sent successfully');
      return true;
    } catch (error) {
      logger.error('Failed to send Discord webhook message:', error);
      return false;
    }
  }

  /**
   * Send course enrollment notification
   */
  async notifyEnrollment(userId: string, courseName: string): Promise<void> {
    try {
      const integration = await Integration.findOne({ 
        userId, 
        platform: 'discord', 
        enabled: true 
      });

      if (!integration || !integration.config.webhookUrl) {
        return;
      }

      if (!integration.preferences.notifications) {
        return;
      }

      const payload: DiscordWebhookPayload = {
        embeds: [{
          title: '🎓 New Course Enrollment',
          description: `Successfully enrolled in **${courseName}**!`,
          color: 0x3B82F6, // Blue color
          fields: [
            {
              name: '📚 Course',
              value: courseName,
              inline: true
            },
            {
              name: '📅 Date',
              value: new Date().toLocaleDateString(),
              inline: true
            }
          ],
          footer: {
            text: 'EduKnit Learning Platform'
          },
          timestamp: new Date().toISOString()
        }]
      };

      const success = await this.sendWebhookMessage(integration.config.webhookUrl, payload);
      await integration.updateSyncStatus(success ? 'success' : 'failed');
    } catch (error) {
      logger.error('Error sending Discord enrollment notification:', error);
    }
  }

  /**
   * Send achievement notification
   */
  async notifyAchievement(userId: string, achievementName: string, points: number): Promise<void> {
    try {
      const integration = await Integration.findOne({ 
        userId, 
        platform: 'discord', 
        enabled: true 
      });

      if (!integration || !integration.config.webhookUrl) {
        return;
      }

      if (!integration.preferences.achievementSharing) {
        return;
      }

      const payload: DiscordWebhookPayload = {
        embeds: [{
          title: '🏆 Achievement Unlocked!',
          description: `Earned the **${achievementName}** achievement!`,
          color: 0xF59E0B, // Amber color
          fields: [
            {
              name: '🎖️ Achievement',
              value: achievementName,
              inline: true
            },
            {
              name: '⭐ Points',
              value: `+${points}`,
              inline: true
            }
          ],
          footer: {
            text: 'EduKnit Learning Platform'
          },
          timestamp: new Date().toISOString()
        }]
      };

      const success = await this.sendWebhookMessage(integration.config.webhookUrl, payload);
      await integration.updateSyncStatus(success ? 'success' : 'failed');
    } catch (error) {
      logger.error('Error sending Discord achievement notification:', error);
    }
  }

  /**
   * Send progress update notification
   */
  async notifyProgress(userId: string, courseName: string, progress: number): Promise<void> {
    try {
      const integration = await Integration.findOne({ 
        userId, 
        platform: 'discord', 
        enabled: true 
      });

      if (!integration || !integration.config.webhookUrl) {
        return;
      }

      if (!integration.preferences.progressUpdates) {
        return;
      }

      // Only send notifications for milestone progress (25%, 50%, 75%, 100%)
      const milestones = [25, 50, 75, 100];
      if (!milestones.includes(Math.round(progress))) {
        return;
      }

      const emoji = progress === 100 ? '🎉' : '📈';
      const message = progress === 100 ? 'Course Completed!' : 'Progress Update';

      const payload: DiscordWebhookPayload = {
        embeds: [{
          title: `${emoji} ${message}`,
          description: `Made progress in **${courseName}**`,
          color: progress === 100 ? 0x10B981 : 0x8B5CF6, // Green for completion, purple for progress
          fields: [
            {
              name: '📚 Course',
              value: courseName,
              inline: true
            },
            {
              name: '📊 Progress',
              value: `${Math.round(progress)}%`,
              inline: true
            }
          ],
          footer: {
            text: 'EduKnit Learning Platform'
          },
          timestamp: new Date().toISOString()
        }]
      };

      const success = await this.sendWebhookMessage(integration.config.webhookUrl, payload);
      await integration.updateSyncStatus(success ? 'success' : 'failed');
    } catch (error) {
      logger.error('Error sending Discord progress notification:', error);
    }
  }

  /**
   * Validate Discord webhook URL
   */
  async validateWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const testPayload: DiscordWebhookPayload = {
        embeds: [{
          title: '✅ Integration Test',
          description: 'EduKnit Discord integration is working!',
          color: 0x10B981,
          footer: {
            text: 'EduKnit Learning Platform'
          }
        }]
      };

      return await this.sendWebhookMessage(webhookUrl, testPayload);
    } catch (error) {
      logger.error('Discord webhook validation failed:', error);
      return false;
    }
  }

  /**
   * Get Discord server info (requires bot token - for future implementation)
   */
  async getServerInfo(serverId: string, botToken?: string): Promise<DiscordServerInfo | null> {
    if (!botToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/guilds/${serverId}`, {
        headers: {
          'Authorization': `Bot ${botToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        name: data.name,
        icon: data.icon,
        memberCount: data.approximate_member_count,
      };
    } catch (error) {
      logger.error('Failed to get Discord server info:', error);
      return null;
    }
  }

  /**
   * Send announcement to Discord
   */
  async sendAnnouncement(userId: string, title: string, message: string): Promise<void> {
    try {
      const integration = await Integration.findOne({ 
        userId, 
        platform: 'discord', 
        enabled: true 
      });

      if (!integration || !integration.config.webhookUrl) {
        return;
      }

      if (!integration.preferences.announcements) {
        return;
      }

      const payload: DiscordWebhookPayload = {
        embeds: [{
          title: `📢 ${title}`,
          description: message,
          color: 0xEF4444, // Red color for announcements
          footer: {
            text: 'EduKnit Learning Platform'
          },
          timestamp: new Date().toISOString()
        }]
      };

      const success = await this.sendWebhookMessage(integration.config.webhookUrl, payload);
      await integration.updateSyncStatus(success ? 'success' : 'failed');
    } catch (error) {
      logger.error('Error sending Discord announcement:', error);
    }
  }

  /**
   * Test integration connection
   */
  async testConnection(userId: string): Promise<boolean> {
    try {
      const integration = await Integration.findOne({ 
        userId, 
        platform: 'discord', 
        enabled: true 
      });

      if (!integration || !integration.config.webhookUrl) {
        return false;
      }

      return await this.validateWebhook(integration.config.webhookUrl);
    } catch (error) {
      logger.error('Error testing Discord connection:', error);
      return false;
    }
  }
}

export default new DiscordService();
