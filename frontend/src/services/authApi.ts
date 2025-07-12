import api from './api';
import type { ApiResponse, User } from './api';
import type { AxiosError } from 'axios';

// Auth-related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthUser extends User {
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'student' | 'visitor';
  isEmailVerified: boolean;
  enrollmentStatus: 'active' | 'inactive' | 'suspended';
}

export interface LoginResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'student' | 'visitor';
  isEmailVerified: boolean;
  enrollmentStatus: 'active' | 'inactive' | 'suspended';
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
}

// Auth API functions
export const authApi = {
  // Register a new user
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await api.post<ApiResponse<RegisterResponse>>('/auth/register', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      
      // Handle specific error cases
      if (axiosError.response?.status === 409) {
        const errorMessage = axiosError.response?.data?.message || 'User already exists';
        throw new Error(errorMessage);
      }
      
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Registration failed');
    }
  },

  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Login failed');
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      const response = await api.post<ApiResponse>('/auth/logout');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Logout failed');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Logout failed');
    }
  },

  // Refresh access token
  async refreshToken(): Promise<void> {
    try {
      const response = await api.post<ApiResponse>('/auth/refresh');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Token refresh failed');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Token refresh failed');
    }
  },

  // Get current authenticated user
  async getCurrentUser(): Promise<AuthUser> {
    try {
      const response = await api.get<ApiResponse<AuthUser>>('/auth/me');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get current user');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to get current user');
    }
  },

  // Forgot password
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    try {
      const response = await api.post<ApiResponse>('/auth/forgot-password', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send reset email');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to send reset email');
    }
  },

  // Validate reset token
  async validateResetToken(token: string): Promise<void> {
    try {
      const response = await api.post<ApiResponse>('/auth/validate-reset-token', { token });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Invalid reset token');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Invalid reset token');
    }
  },

  // Reset password
  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      const response = await api.post<ApiResponse>('/auth/reset-password', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Password reset failed');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Password reset failed');
    }
  },

  // Resend email verification
  async resendEmailVerification(email: string): Promise<void> {
    try {
      const response = await api.post<ApiResponse>('/auth/resend-verification', { email });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to resend verification email');
    }
  },

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await api.get<ApiResponse>('/auth/verify-email', { 
        params: { token } 
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Email verification failed');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Email verification failed');
    }
  },

  // Change password (for authenticated users)
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      const response = await api.post<ApiResponse>('/auth/change-password', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Password change failed');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Password change failed');
    }
  },
};

export default authApi;
