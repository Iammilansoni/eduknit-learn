import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings,
  Bell,
  Moon,
  Sun,
  Globe,
  Palette,
  Shield,
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Users,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUpdateStudentProfile } from '@/hooks/use-student-profile';
import api, { ApiResponse } from '@/services/api';
import { AxiosError } from 'axios';

interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
  allowMessaging: boolean;
  allowConnectionRequests: boolean;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  showProgress: boolean;
  showAchievements: boolean;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  frequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'NEVER';
  courseUpdates: boolean;
  assignmentReminders: boolean;
  liveSessionReminders: boolean;
  achievementNotifications: boolean;
  marketingEmails: boolean;
}

interface DeletionRequest {
  id: string;
  reason: string;
  requestType: 'account_deletion' | 'data_export' | 'data_deletion';
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
  processedAt?: string;
  adminNotes?: string;
}

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  timestamp: string;
  success: boolean;
  details?: Record<string, unknown>;
}

interface DeletionStatus {
  isScheduled: boolean;
  scheduledFor?: string;
  requestedAt?: string;
  remainingDays?: number;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    theme: 'system',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false,
      frequency: 'DAILY' as const,
      courseUpdates: true,
      assignmentReminders: true,
      liveSessionReminders: true,
      achievementNotifications: true,
      marketingEmails: false
    },
    privacy: {
      profileVisibility: 'PUBLIC' as const,
      allowMessaging: true,
      allowConnectionRequests: true,
      dataProcessingConsent: true,
      marketingConsent: false,
      showProgress: true,
      showAchievements: true
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false
    }
  });

  // Privacy-specific state
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [deletionReason, setDeletionReason] = useState('');
  const [deletionPassword, setDeletionPassword] = useState('');
  const [deletionConfirmText, setDeletionConfirmText] = useState('');
  const [showDeletionForm, setShowDeletionForm] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus | null>(null);

  const { toast } = useToast();
  const updateProfile = useUpdateStudentProfile();

  const isAxios401 = (error: unknown): boolean => {
    return (
      typeof error === 'object' &&
      error !== null &&
      'isAxiosError' in error &&
      (error as AxiosError).isAxiosError === true &&
      (error as AxiosError).response?.status === 401
    );
  };

  // Load initial settings
  useEffect(() => {
    fetchPrivacySettings();
    fetchDeletionRequests();
    fetchAuditLogs();
    fetchDeletionStatus();
  }, []);

  // API functions
  const fetchPrivacySettings = async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse<PrivacySettings>>('/privacy/settings');
      
      if (response.data.success && response.data.data) {
        setSettings(prev => ({
          ...prev,
          privacy: {
            ...prev.privacy,
            ...response.data.data
          }
        }));
      }
    } catch (error: unknown) {
      if (!isAxios401(error)) {
        console.error('Failed to fetch privacy settings:', error);
      }
    }
  };

  const fetchDeletionRequests = async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse<DeletionRequest[]>>('/privacy/deletion-requests');
      
      if (response.data.success && response.data.data) {
        setDeletionRequests(response.data.data);
      }
    } catch (error: unknown) {
      if (!isAxios401(error)) {
        console.error('Failed to fetch deletion requests:', error);
      }
    }
  };

  const fetchAuditLogs = async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse<{ logs: AuditLog[] }>>('/privacy/audit-logs', {
        params: { limit: 20 }
      });
      
      if (response.data.success && response.data.data) {
        setAuditLogs(response.data.data.logs);
      }
    } catch (error: unknown) {
      if (!isAxios401(error)) {
        console.error('Failed to fetch audit logs:', error);
      }
    }
  };

  const fetchDeletionStatus = async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse<DeletionStatus>>('/privacy/deletion-status');
      
      if (response.data.success && response.data.data) {
        setDeletionStatus(response.data.data);
      }
    } catch (error: unknown) {
      if (!isAxios401(error)) {
        console.error('Failed to fetch deletion status:', error);
      }
    }
  };

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save privacy settings
      await updateProfile.mutateAsync({
        privacy: settings.privacy,
        learningPreferences: {
          notificationPreferences: {
            email: settings.notifications.email,
            sms: settings.notifications.sms,
            push: settings.notifications.push,
            frequency: settings.notifications.frequency
          }
        }
      });

      // Save notification settings to backend
      await api.put('/privacy/settings', {
        profileVisibility: settings.privacy.profileVisibility,
        allowMessaging: settings.privacy.allowMessaging,
        allowConnectionRequests: settings.privacy.allowConnectionRequests,
        dataProcessingConsent: settings.privacy.dataProcessingConsent,
        marketingConsent: settings.privacy.marketingConsent,
        showProgress: settings.privacy.showProgress,
        showAchievements: settings.privacy.showAchievements
      });

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDataExport = async () => {
    setLoading(true);
    try {
      const response = await api.get<Blob>('/privacy/export-data', {
        responseType: 'blob'
      });

      if (response.status === 200) {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Data Export",
          description: "Your data has been exported successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const requestAccountDeletion = async () => {
    // Prevent request if required fields are missing
    if (!deletionPassword || deletionConfirmText !== 'DELETE MY ACCOUNT') {
      toast({
        title: "Error",
        description: "Please enter your password and type 'DELETE MY ACCOUNT' to confirm.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const response = await api.post<ApiResponse<null>>('/privacy/delete-account', {
        reason: deletionReason,
        password: deletionPassword,
        confirmText: deletionConfirmText
      });

      if (response.data.success) {
        toast({
          title: "Account Deletion Requested",
          description: "Your account deletion request has been submitted. You will be notified once it's processed."
        });
        setShowDeletionForm(false);
        setDeletionPassword('');
        setDeletionConfirmText('');
        setDeletionReason('');
        fetchDeletionRequests();
        fetchDeletionStatus();
      } else {
        throw new Error(response.data.message || 'Failed to request deletion');
      }
    } catch (error) {
      let description = "Failed to request deletion";
      if (isAxios401(error)) {
        description = "Session expired. Please log in again.";
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as AxiosError).response?.data &&
        typeof (error as AxiosError).response?.data === 'object' &&
        (error as { response: { data: { message?: string } } }).response.data.message
      ) {
        description = (error as { response: { data: { message?: string } } }).response.data.message as string;
      } else if (error instanceof Error) {
        description = error.message;
      }
      toast({
        title: "Error",
        description,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelAccountDeletion = async () => {
    setLoading(true);
    try {
      const response = await api.post<ApiResponse<{ cancelled: boolean }>>('/privacy/cancel-deletion');

      if (response.data.success) {
        toast({
          title: "Deletion Cancelled",
          description: "Your account deletion request has been cancelled.",
        });

        fetchDeletionStatus();
      }
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel deletion request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC': return <Eye className="h-4 w-4" />;
      case 'PRIVATE': return <EyeOff className="h-4 w-4" />;
      case 'CONNECTIONS_ONLY': return <Users className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: FileText }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage your account preferences, privacy settings, and data
            </p>
          </div>
          <Button onClick={handleSaveSettings} disabled={saving} className="flex items-center gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize how the platform looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Theme</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose your preferred color scheme
                    </p>
                  </div>
                  <Select value={settings.theme} onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="light" value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem key="dark" value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem key="system" value="system">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Language</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Select your preferred language
                    </p>
                  </div>
                  <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="en" value="en">English</SelectItem>
                      <SelectItem key="es" value="es">Español</SelectItem>
                      <SelectItem key="fr" value="fr">Français</SelectItem>
                      <SelectItem key="de" value="de">Deutsch</SelectItem>
                      <SelectItem key="hi" value="hi">हिंदी</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Accessibility Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Accessibility
                </CardTitle>
                <CardDescription>
                  Customize the platform for better accessibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">High Contrast Mode</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch 
                    checked={settings.accessibility.highContrast}
                    onCheckedChange={(checked) => handleSettingChange('accessibility', 'highContrast', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Large Text</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Increase text size for better readability
                    </p>
                  </div>
                  <Switch 
                    checked={settings.accessibility.largeText}
                    onCheckedChange={(checked) => handleSettingChange('accessibility', 'largeText', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Reduced Motion</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Reduce animations and transitions
                    </p>
                  </div>
                  <Switch 
                    checked={settings.accessibility.reducedMotion}
                    onCheckedChange={(checked) => handleSettingChange('accessibility', 'reducedMotion', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Notification Channels</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>Email Notifications</span>
                      </div>
                      <Switch 
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span>Push Notifications</span>
                      </div>
                      <Switch 
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span>SMS Notifications</span>
                      </div>
                      <Switch 
                        checked={settings.notifications.sms}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'sms', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Notification Types</h4>
                    
                    <div className="flex items-center justify-between">
                      <span>Course Updates</span>
                      <Switch 
                        checked={settings.notifications.courseUpdates}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'courseUpdates', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Assignment Reminders</span>
                      <Switch 
                        checked={settings.notifications.assignmentReminders}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'assignmentReminders', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Live Session Reminders</span>
                      <Switch 
                        checked={settings.notifications.liveSessionReminders}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'liveSessionReminders', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Achievement Notifications</span>
                      <Switch 
                        checked={settings.notifications.achievementNotifications}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'achievementNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Marketing Emails</span>
                      <Switch 
                        checked={settings.notifications.marketingEmails}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'marketingEmails', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notification Frequency</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      How often you receive notifications
                    </p>
                  </div>
                  <Select 
                    value={settings.notifications.frequency} 
                    onValueChange={(value) => handleSettingChange('notifications', 'frequency', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="IMMEDIATE" value="IMMEDIATE">Immediate</SelectItem>
                      <SelectItem key="DAILY" value="DAILY">Daily Digest</SelectItem>
                      <SelectItem key="WEEKLY" value="WEEKLY">Weekly Digest</SelectItem>
                      <SelectItem key="NEVER" value="NEVER">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

                      {/* Privacy & Security Settings */}
            <TabsContent value="privacy" className="space-y-6">
              <div className="space-y-8">
                {/* Profile Visibility Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {getVisibilityIcon(settings.privacy.profileVisibility)}
                      <span className="ml-2">Profile Visibility</span>
                    </CardTitle>
                    <CardDescription>
                      Control who can see your profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        { value: 'PUBLIC', label: 'Public', description: 'Anyone can view your profile', icon: <Eye className="h-4 w-4" /> },
                        { value: 'CONNECTIONS_ONLY', label: 'Connections Only', description: 'Only your connections can view your profile', icon: <Users className="h-4 w-4" /> },
                        { value: 'PRIVATE', label: 'Private', description: 'Only you can view your profile', icon: <EyeOff className="h-4 w-4" /> }
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            settings.privacy.profileVisibility === option.value 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleSettingChange('privacy', 'profileVisibility', option.value)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {option.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{option.label}</h4>
                                {settings.privacy.profileVisibility === option.value && (
                                  <CheckCircle className="h-5 w-5 text-blue-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Visibility Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Activity Visibility
                    </CardTitle>
                    <CardDescription>
                      Control what others can see about your activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Show Progress to Others</span>
                      <Switch 
                        checked={settings.privacy.showProgress}
                        onCheckedChange={(checked) => handleSettingChange('privacy', 'showProgress', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Show Achievements to Others</span>
                      <Switch 
                        checked={settings.privacy.showAchievements}
                        onCheckedChange={(checked) => handleSettingChange('privacy', 'showAchievements', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Allow Direct Messages</span>
                      <Switch 
                        checked={settings.privacy.allowMessaging}
                        onCheckedChange={(checked) => handleSettingChange('privacy', 'allowMessaging', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Allow Connection Requests</span>
                      <Switch 
                        checked={settings.privacy.allowConnectionRequests}
                        onCheckedChange={(checked) => handleSettingChange('privacy', 'allowConnectionRequests', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Data Processing Consent */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Data Processing
                    </CardTitle>
                    <CardDescription>
                      Control how your data is processed and used
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Data Processing Consent</span>
                      <Switch 
                        checked={settings.privacy.dataProcessingConsent}
                        onCheckedChange={(checked) => handleSettingChange('privacy', 'dataProcessingConsent', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Marketing Consent</span>
                      <Switch 
                        checked={settings.privacy.marketingConsent}
                        onCheckedChange={(checked) => handleSettingChange('privacy', 'marketingConsent', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

            {/* Account Deletion Status */}
            {deletionStatus?.isScheduled && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your account is scheduled for deletion on {deletionStatus.scheduledFor}. 
                  You have {deletionStatus.remainingDays} days remaining to cancel this request.
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2"
                    onClick={cancelAccountDeletion}
                    disabled={loading}
                  >
                    Cancel Deletion
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Deletion Requests */}
            {deletionRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Deletion Requests</CardTitle>
                  <CardDescription>
                    Track the status of your data and account deletion requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deletionRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{request.requestType.replace('_', ' ').toUpperCase()}</span>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-gray-600">{request.reason}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Requested: {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Audit Logs */}
            {auditLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Activity Log
                  </CardTitle>
                  <CardDescription>
                    Recent activities and access to your account and data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {auditLogs.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No activity logs found</p>
                  ) : (
                    <div className="space-y-3">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${log.success ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div>
                              <p className="text-sm font-medium capitalize">
                                {log.action.replace('_', ' ')} {log.resource}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(log.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {log.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data" className="space-y-6">
            <div className="space-y-8">
              {/* Data Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Export Your Data
                  </CardTitle>
                  <CardDescription>
                    Download a copy of all your personal data stored in our system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleDataExport} disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Exporting...' : 'Download My Data'}
                  </Button>
                </CardContent>
              </Card>

              {/* Account Deletion */}
              <Card className="border-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <Trash2 className="h-5 w-5 mr-2" />
                    Delete Your Account
                  </CardTitle>
                  <CardDescription>
                    Permanently delete your account and all associated data. This action is irreversible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {deletionStatus?.isScheduled ? (
                    <div className="space-y-4">
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Your account deletion is scheduled for <strong>{deletionStatus.scheduledFor}</strong>.
                          You have <strong>{deletionStatus.remainingDays} days</strong> remaining to cancel this request.
                        </AlertDescription>
                      </Alert>
                      <Button variant="outline" onClick={cancelAccountDeletion} disabled={loading}>
                        Cancel Deletion Request
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Button variant="destructive" onClick={() => setShowDeletionForm(!showDeletionForm)}>
                        Request Account Deletion
                      </Button>
                      {showDeletionForm && (
                        <div className="mt-4 space-y-4 p-4 border rounded-md">
                          <p className="text-sm text-gray-600">
                            For security, please provide the reason for deletion and confirm your password.
                          </p>
                          <Textarea 
                            placeholder="Reason for deletion (optional)"
                            value={deletionReason}
                            onChange={(e) => setDeletionReason(e.target.value)}
                          />
                          <input 
                            type="password"
                            placeholder="Enter your password"
                            className="w-full p-2 border rounded-md"
                            value={deletionPassword}
                            onChange={(e) => setDeletionPassword(e.target.value)}
                          />
                          <input 
                            type="text"
                            placeholder='Type "DELETE MY ACCOUNT" to confirm'
                            className="w-full p-2 border rounded-md"
                            value={deletionConfirmText}
                            onChange={(e) => setDeletionConfirmText(e.target.value)}
                          />
                          <Button 
                            variant="destructive"
                            onClick={requestAccountDeletion}
                            disabled={loading || deletionConfirmText !== 'DELETE MY ACCOUNT' || !deletionPassword}
                          >
                            Confirm Deletion
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>


          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage; 