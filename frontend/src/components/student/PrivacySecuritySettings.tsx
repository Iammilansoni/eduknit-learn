import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Users, 
  Download, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api, { ApiResponse } from '@/services/api';
import { AxiosError } from 'axios';

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts_only';
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

const PrivacySecuritySettings: React.FC = () => {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
  });
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [deletionPassword, setDeletionPassword] = useState('');
  const [deletionConfirmText, setDeletionConfirmText] = useState('');
  const [showDeletionForm, setShowDeletionForm] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'privacy' | 'audit'>('privacy');
  
  const { toast } = useToast();

  const isAxios401 = (error: unknown): boolean => {
    return (
      typeof error === 'object' &&
      error !== null &&
      'isAxiosError' in error &&
      (error as AxiosError).isAxiosError === true &&
      (error as AxiosError).response?.status === 401
    );
  };

  // --- API functions ---
  const fetchPrivacySettings = async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse<PrivacySettings>>('/privacy/settings');
      
      if (response.data.success && response.data.data) {
        setSettings(response.data.data);
      }
    } catch (error: unknown) {
      if (isAxios401(error)) {
        console.warn('Unauthorized: User session may have expired');
        toast({
          title: "Session Expired",
          description: "Please log in again to access privacy settings.",
          variant: "destructive"
        });
      } else {
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
      if (isAxios401(error)) {
        return; // Already handled in fetchPrivacySettings
      }
      console.error('Failed to fetch deletion requests:', error);
    }
  };

  const fetchAuditLogs = async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse<{ logs: AuditLog[] }>>('/privacy/audit-logs', {
        params: {
          limit: 20
        }
      });
      
      if (response.data.success && response.data.data) {
        setAuditLogs(response.data.data.logs);
      }
    } catch (error: unknown) {
      if (isAxios401(error)) {
        return; // Already handled in fetchPrivacySettings
      }
      console.error('Failed to fetch audit logs:', error);
    }
  };

  const fetchDeletionStatus = async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse<DeletionStatus>>('/privacy/deletion-status');
      
      if (response.data.success && response.data.data) {
        setDeletionStatus(response.data.data);
      }
    } catch (error: unknown) {
      if (isAxios401(error)) {
        return; // Already handled in fetchPrivacySettings
      }
      console.error('Failed to fetch deletion status:', error);
    }
  };

  useEffect(() => {
    fetchPrivacySettings();
    fetchDeletionRequests();
    fetchAuditLogs();
    fetchDeletionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProfileVisibility = async (visibility: PrivacySettings['profileVisibility']): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.put<ApiResponse<{ profileVisibility: string }>>('/privacy/visibility', {
        visibility
      });

      if (response.data.success) {
        setSettings(prev => ({ ...prev, profileVisibility: visibility }));
        toast({
          title: "Success",
          description: "Profile visibility updated successfully"
        });
      } else {
        throw new Error(response.data.message || 'Failed to update visibility');
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Failed to update profile visibility",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const requestDataExport = async (): Promise<void> => {
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
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Success",
          description: "Data export downloaded successfully"
        });
      } else {
        throw new Error('Failed to export data');
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelAccountDeletion = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.post<ApiResponse<null>>('/privacy/cancel-deletion', {
        reason: 'User cancelled deletion request'
      });

      if (response.data.success) {
        toast({
          title: "Deletion Cancelled",
          description: "Your account deletion has been cancelled successfully."
        });
        fetchDeletionRequests();
        fetchDeletionStatus();
      } else {
        throw new Error(response.data.message || 'Failed to cancel deletion');
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel deletion",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Ensure your API base URL is set correctly in '@/services/api'.
  // For local dev, use Vite proxy or set VITE_API_URL to your backend (not the Vite dev server).

  const requestDataDeletion = async (): Promise<void> => {
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
    } catch (error: unknown) {
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

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Eye className="h-4 w-4" />;
      case 'private': return <EyeOff className="h-4 w-4" />;
      case 'contacts_only': return <Users className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, color: 'bg-yellow-500' },
      approved: { variant: 'default' as const, color: 'bg-blue-500' },
      rejected: { variant: 'destructive' as const, color: 'bg-red-500' },
      completed: { variant: 'default' as const, color: 'bg-green-500' },
      cancelled: { variant: 'outline' as const, color: 'bg-gray-500' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'privacy' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('privacy')}
        >
          <Shield className="h-4 w-4 mr-2 inline-block" />
          Privacy & Data
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'audit' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('audit')}
        >
          <FileText className="h-4 w-4 mr-2 inline-block" />
          Audit Log
        </button>
      </div>

      {activeTab === 'privacy' && (
        <div className="space-y-8">
          {/* Profile Visibility Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getVisibilityIcon(settings.profileVisibility)}
                <span className="ml-2">Profile Visibility</span>
              </CardTitle>
              <CardDescription>
                Control who can see your profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { value: 'public', label: 'Public', description: 'Anyone can view your profile', icon: <Eye className="h-4 w-4" /> },
                  { value: 'contacts_only', label: 'Contacts Only', description: 'Only your contacts can view your profile', icon: <Users className="h-4 w-4" /> },
                  { value: 'private', label: 'Private', description: 'Only you can view your profile', icon: <EyeOff className="h-4 w-4" /> }
                ].map((option) => (
                  <div
                    key={option.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      settings.profileVisibility === option.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateProfileVisibility(option.value as PrivacySettings['profileVisibility'])}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{option.label}</h4>
                          {settings.profileVisibility === option.value && (
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
              <Button onClick={requestDataExport} disabled={loading}>
                <Download className="h-4 w-4 mr-2" />
                Download My Data
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
                        onClick={requestDataDeletion}
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
      )}

      {activeTab === 'audit' && (
        <div>
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
        </div>
      )}
    </div>
  );
};

export default PrivacySecuritySettings;
