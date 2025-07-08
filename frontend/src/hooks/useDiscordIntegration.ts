import { useState, useEffect } from 'react';
import { integrationApi, type DiscordUpdate, type DiscordServerInfo } from '../services/integrationApi';

export const useDiscordIntegration = (limit?: number) => {
  const [updates, setUpdates] = useState<DiscordUpdate[]>([]);
  const [serverInfo, setServerInfo] = useState<DiscordServerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiscordData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch Discord updates and server info
        const [updatesData, serverInfoData] = await Promise.all([
          integrationApi.getDiscordUpdates(limit),
          integrationApi.getDiscordServerInfo()
        ]);

        setUpdates(updatesData);
        setServerInfo(serverInfoData);
      } catch (err) {
        console.error('Failed to fetch Discord data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch Discord data');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscordData();
  }, [limit]);

  const sendNotification = async (notificationData: {
    type: 'course_completion' | 'achievement_unlock' | 'milestone_reached' | 'custom';
    title: string;
    message: string;
    studentName?: string;
    courseName?: string;
    achievementName?: string;
    metadata?: Record<string, unknown>;
  }) => {
    try {
      const result = await integrationApi.sendDiscordNotification(notificationData);
      return result;
    } catch (err) {
      console.error('Failed to send Discord notification:', err);
      throw err;
    }
  };

  const refetch = async () => {
    try {
      setError(null);
      
      const [updatesData, serverInfoData] = await Promise.all([
        integrationApi.getDiscordUpdates(limit),
        integrationApi.getDiscordServerInfo()
      ]);

      setUpdates(updatesData);
      setServerInfo(serverInfoData);
    } catch (err) {
      console.error('Failed to refetch Discord data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Discord data');
    }
  };

  return {
    updates,
    serverInfo,
    loading,
    error,
    sendNotification,
    refetch,
  };
};

export default useDiscordIntegration;
