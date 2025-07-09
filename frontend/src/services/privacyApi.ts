import api from './api';
import type { ApiResponse } from './api';
import type { AxiosError } from 'axios';

// Privacy-related types
export interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
  showProgressToOthers: boolean;
  showOnlineStatus: boolean;
  allowMessagesFromStrangers: boolean;
  dataProcessingConsent: boolean;
  marketingEmailsConsent: boolean;
  analyticsConsent: boolean;
  thirdPartyDataSharingConsent: boolean;
  lastUpdated: string;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  requestType: 'full_deletion' | 'partial_deletion' | 'anonymization';
  reason?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  scheduledDeletionDate?: string;
  cancellationDeadline?: string;
  dataCategories?: string[];
  retentionReason?: string;
  processorNotes?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface UserDataExport {
  user: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt: string;
  };
  profile?: Record<string, unknown>;
  enrollments: unknown[];
  progress: unknown[];
  activities: unknown[];
  privacySettings: PrivacySettings;
  auditLogs: AuditLog[];
  exportedAt: string;
}

export interface UpdateVisibilityData {
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
  showProgressToOthers: boolean;
  showOnlineStatus: boolean;
  allowMessagesFromStrangers: boolean;
}

export interface UpdateConsentData {
  dataProcessingConsent: boolean;
  marketingEmailsConsent: boolean;
  analyticsConsent: boolean;
  thirdPartyDataSharingConsent: boolean;
}

export interface CreateDeletionRequestData {
  requestType: 'full_deletion' | 'partial_deletion' | 'anonymization';
  reason?: string;
  dataCategories?: string[];
  password: string;
}

export interface ProcessDeletionRequestData {
  action: 'approve' | 'reject';
  processorNotes?: string;
  retentionReason?: string;
}

// Privacy API functions
export const privacyApi = {
  // Get privacy settings
  async getPrivacySettings(): Promise<PrivacySettings> {
    try {
      const response = await api.get<ApiResponse<PrivacySettings>>('/privacy/settings');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch privacy settings');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch privacy settings');
    }
  },

  // Update visibility settings
  async updateVisibilitySettings(data: UpdateVisibilityData): Promise<PrivacySettings> {
    try {
      const response = await api.put<ApiResponse<PrivacySettings>>('/privacy/visibility', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update visibility settings');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to update visibility settings');
    }
  },

  // Update consent settings
  async updateConsentSettings(data: UpdateConsentData): Promise<PrivacySettings> {
    try {
      const response = await api.put<ApiResponse<PrivacySettings>>('/privacy/consent', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update consent settings');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to update consent settings');
    }
  },

  // Request account deletion
  async requestAccountDeletion(data: CreateDeletionRequestData): Promise<DataDeletionRequest> {
    try {
      const response = await api.post<ApiResponse<DataDeletionRequest>>('/privacy/delete-account', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to request account deletion');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to request account deletion');
    }
  },

  // Cancel account deletion
  async cancelAccountDeletion(password: string): Promise<void> {
    try {
      const response = await api.post<ApiResponse>('/privacy/cancel-deletion', { password });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to cancel account deletion');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to cancel account deletion');
    }
  },

  // Get deletion status
  async getDeletionStatus(): Promise<DataDeletionRequest | null> {
    try {
      const response = await api.get<ApiResponse<DataDeletionRequest | null>>('/privacy/deletion-status');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch deletion status');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch deletion status');
    }
  },

  // Create data deletion request
  async createDeletionRequest(data: CreateDeletionRequestData): Promise<DataDeletionRequest> {
    try {
      const response = await api.post<ApiResponse<DataDeletionRequest>>('/privacy/deletion-request', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create deletion request');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to create deletion request');
    }
  },

  // Get deletion requests (admin)
  async getDeletionRequests(): Promise<DataDeletionRequest[]> {
    try {
      const response = await api.get<ApiResponse<DataDeletionRequest[]>>('/privacy/deletion-requests');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch deletion requests');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch deletion requests');
    }
  },

  // Export user data
  async exportUserData(): Promise<UserDataExport> {
    try {
      const response = await api.get<ApiResponse<UserDataExport>>('/privacy/export-data');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to export user data');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to export user data');
    }
  },

  // Get audit logs
  async getAuditLogs(page?: number, limit?: number): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const params = page || limit ? { page, limit } : {};
      const response = await api.get<ApiResponse<{
        logs: AuditLog[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>>('/privacy/audit-logs', { params });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch audit logs');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch audit logs');
    }
  },

  // Admin: Get all deletion requests
  async getAdminDeletionRequests(status?: string): Promise<DataDeletionRequest[]> {
    try {
      const params = status ? { status } : {};
      const response = await api.get<ApiResponse<DataDeletionRequest[]>>('/privacy/admin/deletion-requests', { params });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch deletion requests');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch deletion requests');
    }
  },

  // Admin: Process deletion request
  async processDeletionRequest(requestId: string, data: ProcessDeletionRequestData): Promise<DataDeletionRequest> {
    try {
      const response = await api.put<ApiResponse<DataDeletionRequest>>(`/privacy/admin/deletion-requests/${requestId}/process`, data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to process deletion request');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to process deletion request');
    }
  },

  // Admin: Get audit logs
  async getAdminAuditLogs(filters?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const response = await api.get<ApiResponse<{
        logs: AuditLog[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>>('/privacy/admin/audit-logs', { params: filters });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch admin audit logs');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch admin audit logs');
    }
  },
};

export default privacyApi;
