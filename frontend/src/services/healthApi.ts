import api from './api';
import type { ApiResponse } from './api';
import type { AxiosError } from 'axios';

// Health check types
export interface HealthStatus {
  status: string;
  timestamp: string;
  environment: string;
  version: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
}

export interface DetailedHealthStatus extends HealthStatus {
  services: {
    database: string;
    email: string;
  };
  checks: {
    database: boolean;
    email: boolean;
  };
}

// Health API functions
export const healthApi = {
  // Basic health check
  async getHealth(): Promise<HealthStatus> {
    try {
      const response = await api.get<ApiResponse<HealthStatus>>('/health');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Health check failed');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Health check failed');
    }
  },

  // Detailed health check
  async getDetailedHealth(): Promise<DetailedHealthStatus> {
    try {
      const response = await api.get<ApiResponse<DetailedHealthStatus>>('/health/detailed');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Detailed health check failed');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Detailed health check failed');
    }
  },
};

export default healthApi;
