import api from './api';
import type { ApiResponse, User } from './api';
import type { AxiosError } from 'axios';

// User management types
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  usersByRole: {
    role: string;
    count: number;
  }[];
  usersByStatus: {
    status: string;
    count: number;
  }[];
  recentSignups: {
    date: string;
    count: number;
  }[];
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user' | 'student' | 'visitor';
  enrollmentStatus?: 'active' | 'inactive' | 'suspended';
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'user' | 'student' | 'visitor';
  enrollmentStatus?: 'active' | 'inactive' | 'suspended';
  isEmailVerified?: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserFilters {
  role?: string;
  enrollmentStatus?: string;
  isEmailVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// User API functions
export const userApi = {
  // Get all users with filtering and pagination
  async getAllUsers(filters?: UserFilters): Promise<UsersListResponse> {
    try {
      const response = await api.get<ApiResponse<UsersListResponse>>('/users', { params: filters });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch users');
    }
  },

  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(`/users/${userId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch user');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch user');
    }
  },

  // Update user
  async updateUser(userId: string, userData: UpdateUserData): Promise<User> {
    try {
      const response = await api.put<ApiResponse<User>>(`/users/${userId}`, userData);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update user');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to update user');
    }
  },

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse>(`/users/${userId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete user');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to delete user');
    }
  },

  // Update enrollment status
  async updateEnrollmentStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<User> {
    try {
      const response = await api.patch<ApiResponse<User>>(`/users/${userId}/enrollment-status`, { enrollmentStatus: status });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update enrollment status');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to update enrollment status');
    }
  },

  // Get user statistics
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await api.get<ApiResponse<UserStats>>('/users/stats');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch user stats');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch user stats');
    }
  },

  // Change password (admin function)
  async changeUserPassword(userId: string, passwordData: ChangePasswordData): Promise<void> {
    try {
      const response = await api.post<ApiResponse>(`/users/${userId}/change-password`, passwordData);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to change password');
    }
  },

  // Create new user (admin function)
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const response = await api.post<ApiResponse<User>>('/users', userData);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create user');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to create user');
    }
  },
};

export default userApi;
