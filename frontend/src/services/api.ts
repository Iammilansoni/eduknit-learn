import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - tokens are handled via HTTP-only cookies
api.interceptors.request.use(
  (config) => {
    // Tokens are automatically sent via HTTP-only cookies
    // No need to manually add Authorization header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // List of public pages that don't require authentication
      const publicPages = [
        '/login',
        '/register', 
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/verification',
        '/verify'
      ];
      
      const isPublicPage = publicPages.some(page => window.location.pathname === page);
      
      // Only try to refresh if we're not on a public page or calling auth endpoints
      if (!isPublicPage && 
          !originalRequest.url?.includes('/auth/login') && 
          !originalRequest.url?.includes('/auth/refresh') &&
          !originalRequest.url?.includes('/auth/reset-password') &&
          !originalRequest.url?.includes('/auth/verify-email')) {
        try {
          // Try to refresh the token via HTTP-only cookies
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            withCredentials: true,
          });
          if ((refreshResponse.data as ApiResponse).success) {
            // Retry the original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, clear user data and redirect to login only if not on public page
          localStorage.removeItem('user');
          if (!isPublicPage) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
  error?: {
    code: string;
    message: string;
    details?: unknown[];
  };
  timestamp?: string;
  path?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user' | 'student' | 'visitor';
  profilePicture?: string;
  enrollmentStatus: 'active' | 'inactive' | 'suspended';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'user' | 'student' | 'visitor';
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

// Auth API
export const authAPI = {
  // Register new user
  register: async (data: RegisterData): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Validate reset token
  validateResetToken: async (token: string): Promise<ApiResponse<{ email: string }>> => {
    const response = await api.get(`/auth/reset-password?token=${token}`);
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Resend verification email
  resendVerificationEmail: async (email: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },
};

// User API
export const userAPI = {
  // Get all users (Admin only)
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> => {
    const response = await api.get('/user', { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/user/${id}`);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, data: UserUpdateData): Promise<ApiResponse<User>> => {
    const response = await api.put(`/user/${id}`, data);
    return response.data;
  },

  // Delete user (Admin only)
  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/user/${id}`);
    return response.data;
  },

  // Create user (Admin only)
  createUser: async (userData: {
    username: string;
    email: string;
    password: string;
    role?: 'admin' | 'user' | 'student' | 'visitor';
    firstName?: string;
    lastName?: string;
    enrollmentStatus?: 'active' | 'inactive' | 'suspended';
  }): Promise<ApiResponse<User>> => {
    const response = await api.post('/user', userData);
    return response.data;
  },

  // Update enrollment status (Admin only)
  updateEnrollmentStatus: async (id: string, status: 'active' | 'inactive' | 'suspended'): Promise<ApiResponse<User>> => {
    const response = await api.patch(`/user/${id}/enrollment-status`, { enrollmentStatus: status });
    return response.data;
  },

  // Get user statistics (Admin only)
  getUserStats: async (): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    byRole: Array<{ _id: string; count: number }>;
    recentRegistrations: number;
  }>> => {
    const response = await api.get('/user/stats');
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.post('/user/change-password', { currentPassword, newPassword });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },
};

// Student API
export const studentAPI = {
  // Get student dashboard data
  getDashboard: async (): Promise<ApiResponse<{
    student: User;
    stats: {
      totalCourses: number;
      completedCourses: number;
      inProgressCourses: number;
      averageGrade: number;
    };
    recentActivity: any[];
    upcomingDeadlines: any[];
    notifications: any[];
  }>> => {
    const response = await api.get('/student/dashboard');
    return response.data;
  },

  // Get student profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/student/profile');
    return response.data;
  },

  // Update student profile
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    dateOfBirth?: string;
  }): Promise<ApiResponse<User>> => {
    const response = await api.put('/student/profile', data);
    return response.data;
  },
};

// Error handling utility
export const handleApiError = (error: AxiosError): string => {
  const data = error.response?.data as Partial<ApiResponse> | undefined;
  if (data?.message) {
    return data.message;
  }
  if (data?.errors) {
    return data.errors.map((e) => e.message).join(', ');
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;