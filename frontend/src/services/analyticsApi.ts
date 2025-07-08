import api from './api';
import { AxiosError } from 'axios';

// Types for analytics
export interface AnalyticsOverview {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  averageProgress: number;
  totalStudyTime: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalAchievements: number;
  level: number;
  nextLevelProgress: number;
  recentAchievements: {
    badgeId: string;
    earnedAt: string;
    points: number;
  }[];
}

export interface ProgressHistoryEntry {
  date: string;
  progress: number;
  studyTime: number;
  coursesCompleted: number;
}

export interface CategoryPerformance {
  category: string;
  totalCourses: number;
  completedCourses: number;
  averageProgress: number;
  totalStudyTime: number;
  averageScore: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakHistory: {
    date: string;
    active: boolean;
  }[];
  milestones: {
    type: 'streak' | 'completion' | 'points' | 'study_time';
    value: number;
    achievedAt: string;
    description: string;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Analytics API
export const analyticsApi = {
  // Get analytics overview
  async getOverview(): Promise<AnalyticsOverview> {
    try {
      const response = await api.get<ApiResponse<AnalyticsOverview>>('/analytics/overview');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch analytics overview');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch analytics overview');
    }
  },

  // Get progress history for charts
  async getProgressHistory(days?: number): Promise<ProgressHistoryEntry[]> {
    try {
      const params = days ? { days } : {};
      const response = await api.get<ApiResponse<ProgressHistoryEntry[]>>('/analytics/progress-history', { params });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch progress history');
      }
      return response.data.data || [];
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch progress history');
    }
  },

  // Get category performance data
  async getCategoryPerformance(): Promise<CategoryPerformance[]> {
    try {
      const response = await api.get<ApiResponse<CategoryPerformance[]>>('/analytics/category-performance');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch category performance');
      }
      return response.data.data || [];
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch category performance');
    }
  },

  // Get streaks and achievements
  async getStreaksAndAchievements(): Promise<StreakData> {
    try {
      const response = await api.get<ApiResponse<StreakData>>('/analytics/streaks');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch streaks and achievements');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch streaks and achievements');
    }
  }
};
