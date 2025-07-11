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
  async getAllUsers(filters?: UserFilters): Promise<{ success: boolean; data: { users: User[]; pagination: any } }> {
    try {
      const response = await api.get<ApiResponse<{ users: User[]; pagination: any }>>('/user', { params: filters });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
      return {
        success: response.data.success,
        data: response.data.data!
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch users');
    }
  },

  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(`/user/${userId}`);
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
  async updateUser(userId: string, userData: UpdateUserData): Promise<{ success: boolean; message: string; user: User }> {
    try {
      const response = await api.put<ApiResponse<{ message: string; user: User }>>(`/user/${userId}`, userData);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update user');
      }
      return {
        success: response.data.success,
        message: response.data.data!.message,
        user: response.data.data!.user
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to update user');
    }
  },

  // Delete user
  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(`/user/${userId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete user');
      }
      return {
        success: response.data.success,
        message: response.data.data!.message
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to delete user');
    }
  },

  // Update enrollment status
  async updateEnrollmentStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<{ success: boolean; message: string; user: User }> {
    try {
      const response = await api.patch<ApiResponse<{ message: string; user: User }>>(`/user/${userId}/enrollment-status`, { enrollmentStatus: status });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update enrollment status');
      }
      return {
        success: response.data.success,
        message: response.data.data!.message,
        user: response.data.data!.user
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to update enrollment status');
    }
  },

  // Get user statistics
  async getUserStats(): Promise<{ success: boolean; stats: UserStats }> {
    try {
      const response = await api.get<ApiResponse<{ stats: UserStats }>>('/user/stats');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch user stats');
      }
      return {
        success: response.data.success,
        stats: response.data.stats!
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch user stats');
    }
  },

  // Change password (admin function)
  async changeUserPassword(userId: string, passwordData: ChangePasswordData): Promise<void> {
    try {
      const response = await api.post<ApiResponse>(`/user/${userId}/change-password`, passwordData);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to change password');
    }
  },

  // Create new user (admin function)
  async createUser(userData: CreateUserData): Promise<{ success: boolean; message: string; user: User }> {
    try {
      const response = await api.post<ApiResponse<{ message: string; user: User }>>('/user', userData);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create user');
      }
      return {
        success: response.data.success,
        message: response.data.data!.message,
        user: response.data.data!.user
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to create user');
    }
  },

  // Get user courses
  async getUserCourses(): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>('/user/courses');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch user courses');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch user courses');
    }
  },

  // Get user learning stats
  async getUserLearningStats(): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>('/user/learning-stats');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch user learning stats');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch user learning stats');
    }
  },
};

export default userApi;
