// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface Integration {
  _id: string;
  userId: string;
  platform: 'discord' | 'slack' | 'teams' | 'zoom';
  enabled: boolean;
  config: {
    webhookUrl?: string;
    serverId?: string;
    channelId?: string;
    botToken?: string;
    inviteUrl?: string;
    [key: string]: string | number | boolean | undefined;
  };
  preferences: {
    notifications: boolean;
    announcements: boolean;
    progressUpdates: boolean;
    achievementSharing: boolean;
  };
  metadata: {
    syncStatus: 'pending' | 'active' | 'error';
    lastSync?: Date;
    errorMessage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIntegrationData {
  platform: 'discord' | 'slack' | 'teams' | 'zoom';
  enabled?: boolean;
  config?: {
    webhookUrl?: string;
    serverId?: string;
    channelId?: string;
    botToken?: string;
    inviteUrl?: string;
    [key: string]: string | number | boolean | undefined;
  };
  preferences?: {
    notifications?: boolean;
    announcements?: boolean;
    progressUpdates?: boolean;
    achievementSharing?: boolean;
  };
}

export interface TestNotificationData {
  platform: 'discord' | 'slack' | 'teams' | 'zoom';
  type?: 'enrollment' | 'achievement' | 'progress' | 'announcement';
}

// Legacy Discord types for backward compatibility
export interface DiscordUpdate {
  id: string;
  type: 'announcement' | 'event' | 'discussion' | 'achievement';
  title: string;
  content: string;
  author: {
    username: string;
    avatar?: string;
  };
  timestamp: string;
  channel: string;
  url?: string;
}

export interface DiscordServerInfo {
  name: string;
  memberCount: number;
  onlineCount: number;
  inviteUrl: string;
  iconUrl?: string;
  description?: string;
  channels: {
    id: string;
    name: string;
    type: 'text' | 'voice' | 'category';
    memberCount?: number;
  }[];
}

class IntegrationApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  /**
   * Get user integrations
   */
  async getUserIntegrations(): Promise<Integration[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/integrations`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch integrations: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching integrations:', error);
      throw error;
    }
  }

  /**
   * Create or update integration
   */
  async createOrUpdateIntegration(data: CreateIntegrationData): Promise<Integration> {
    try {
      const response = await fetch(`${API_BASE_URL}/integrations`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to save integration: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error saving integration:', error);
      throw error;
    }
  }

  /**
   * Test integration connection
   */
  async testIntegration(platform: string): Promise<{ connected: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/integrations/${platform}/test`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to test integration: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error testing integration:', error);
      throw error;
    }
  }

  /**
   * Delete integration
   */
  async deleteIntegration(platform: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/integrations/${platform}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete integration: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting integration:', error);
      throw error;
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(data: TestNotificationData): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/integrations/notify`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to send test notification: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  /**
   * Get static Discord invite link (fallback)
   */
  getDiscordInviteLink(): string {
    // This would be configured in environment variables
    return import.meta.env.VITE_DISCORD_INVITE_URL || 'https://discord.gg/eduknit-community';
  }
}

export const integrationApi = new IntegrationApiService();
export default integrationApi;
