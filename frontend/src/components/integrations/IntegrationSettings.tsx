import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  MessageSquare, 
  ExternalLink, 
  Check, 
  X, 
  TestTube,
  Loader2,
  AlertCircle,
  Bell,
  BellOff,
  Trash2
} from 'lucide-react';
import { integrationApi, type Integration, type CreateIntegrationData } from '../../services/integrationApi';

const IntegrationSettings: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingPlatforms, setTestingPlatforms] = useState<Set<string>>(new Set());
  const [savingPlatforms, setSavingPlatforms] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        setLoading(true);
        const data = await integrationApi.getUserIntegrations();
        setIntegrations(data);
      } catch (error) {
        console.error('Failed to load integrations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load integrations',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadIntegrations();
  }, [toast]);

  const handleSaveIntegration = async (data: CreateIntegrationData) => {
    try {
      setSavingPlatforms(prev => new Set(prev).add(data.platform));
      const savedIntegration = await integrationApi.createOrUpdateIntegration(data);
      
      setIntegrations(prev => {
        const filtered = prev.filter(i => i.platform !== data.platform);
        return [...filtered, savedIntegration];
      });
      
      toast({
        title: 'Success',
        description: `${data.platform} integration saved successfully`
      });
    } catch (error) {
      console.error('Failed to save integration:', error);
      toast({
        title: 'Error',
        description: `Failed to save ${data.platform} integration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setSavingPlatforms(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.platform);
        return newSet;
      });
    }
  };

  const handleTestIntegration = async (platform: string) => {
    try {
      setTestingPlatforms(prev => new Set(prev).add(platform));
      const result = await integrationApi.testIntegration(platform);
      
      if (result.connected) {
        toast({
          title: 'Success',
          description: `${platform} connection test successful`
        });
      } else {
        toast({
          title: 'Error',
          description: `${platform} connection test failed`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to test integration:', error);
      toast({
        title: 'Error',
        description: `${platform} test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setTestingPlatforms(prev => {
        const newSet = new Set(prev);
        newSet.delete(platform);
        return newSet;
      });
    }
  };

  const handleDeleteIntegration = async (platform: string) => {
    if (!confirm(`Are you sure you want to delete the ${platform} integration?`)) {
      return;
    }

    try {
      await integrationApi.deleteIntegration(platform);
      setIntegrations(prev => prev.filter(i => i.platform !== platform));
      toast({
        title: 'Success',
        description: `${platform} integration deleted`
      });
    } catch (error) {
      console.error('Failed to delete integration:', error);
      toast({
        title: 'Error',
        description: `Failed to delete ${platform} integration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  };

  const handleSendTestNotification = async (platform: string) => {
    try {
      await integrationApi.sendTestNotification({ 
        platform: platform as 'discord' | 'slack' | 'teams' | 'zoom', 
        type: 'announcement' 
      });
      toast({
        title: 'Success',
        description: `Test notification sent to ${platform}`
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast({
        title: 'Error',
        description: `Failed to send test notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  };

  const getIntegration = (platform: string) => {
    return integrations.find(i => i.platform === platform);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'discord':
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      default:
        return <Settings className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'discord':
        return 'indigo';
      case 'slack':
        return 'green';
      case 'teams':
        return 'blue';
      case 'zoom':
        return 'blue';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading integrations...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">External Integrations</h1>
        <p className="text-gray-600">
          Connect your learning platform with external services to enhance your experience.
        </p>
      </div>

      <div className="space-y-6">
        {/* Discord Integration */}
        <DiscordIntegrationCard
          integration={getIntegration('discord')}
          onSave={handleSaveIntegration}
          onTest={handleTestIntegration}
          onDelete={handleDeleteIntegration}
          onSendTestNotification={handleSendTestNotification}
          isSaving={savingPlatforms.has('discord')}
          isTesting={testingPlatforms.has('discord')}
        />

        {/* Future integrations can be added here */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">More Integrations</h3>
                <p className="text-sm text-gray-600">Slack, Teams, and Zoom coming soon</p>
              </div>
            </div>
            <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DiscordIntegrationCardProps {
  integration?: Integration;
  onSave: (data: CreateIntegrationData) => Promise<void>;
  onTest: (platform: string) => Promise<void>;
  onDelete: (platform: string) => Promise<void>;
  onSendTestNotification: (platform: string) => Promise<void>;
  isSaving: boolean;
  isTesting: boolean;
}

const DiscordIntegrationCard: React.FC<DiscordIntegrationCardProps> = ({
  integration,
  onSave,
  onTest,
  onDelete,
  onSendTestNotification,
  isSaving,
  isTesting
}) => {
  const [enabled, setEnabled] = useState(integration?.enabled || false);
  const [webhookUrl, setWebhookUrl] = useState(integration?.config.webhookUrl || '');
  const [preferences, setPreferences] = useState({
    notifications: integration?.preferences.notifications ?? true,
    announcements: integration?.preferences.announcements ?? true,
    progressUpdates: integration?.preferences.progressUpdates ?? false,
    achievementSharing: integration?.preferences.achievementSharing ?? false
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSave = () => {
    onSave({
      platform: 'discord',
      enabled,
      config: { webhookUrl: webhookUrl.trim() },
      preferences
    });
  };

  const handleTogglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isConfigured = webhookUrl.trim() !== '';
  const status = integration?.metadata.syncStatus;
  const staticInviteLink = integrationApi.getDiscordInviteLink();

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-indigo-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Discord</h3>
              <p className="text-sm text-gray-600">
                Get notifications and updates in your Discord server
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {status && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                status === 'active' ? 'bg-green-100 text-green-800' :
                status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {status}
              </span>
            )}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Configuration Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discord Webhook URL
          </label>
          <div className="flex space-x-3">
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={() => handleSave()}
              disabled={isSaving || !webhookUrl.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span className="ml-2">{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Create a webhook in your Discord server settings to receive notifications
          </p>
        </div>

        {/* Notification Preferences */}
        {isConfigured && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Notification Preferences</h4>
            <div className="space-y-3">
              {Object.entries(preferences).map(([key, value]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleTogglePreference(key as keyof typeof preferences)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-3">
            {isConfigured && (
              <>
                <button
                  onClick={() => onTest('discord')}
                  disabled={isTesting}
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  {isTesting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                  <span className="ml-2">{isTesting ? 'Testing...' : 'Test Connection'}</span>
                </button>
                <button
                  onClick={() => onSendTestNotification('discord')}
                  className="flex items-center px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                >
                  <Bell className="w-4 h-4" />
                  <span className="ml-2">Send Test</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Static invite link fallback */}
            <a
              href={staticInviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="ml-2">Join Community</span>
            </a>

            {integration && (
              <button
                onClick={() => onDelete('discord')}
                className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span className="ml-2">Remove</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {integration?.metadata.errorMessage && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="ml-2 text-sm text-red-700">{integration.metadata.errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationSettings;
