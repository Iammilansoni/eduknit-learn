import api from './api';
import { AxiosError } from 'axios';

// Types for course enrollment
export interface UserCourse {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progressPercent: number;
  completedLessons: string[];
  studyTime: number;
  lastAccessed: string;
  status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'DROPPED';
  achievements: {
    badgeId: string;
    earnedAt: string;
    points: number;
  }[];
  analytics: {
    streakDays: number;
    lastStreakDate: string;
    totalPoints: number;
    averageScore: number;
    timeToComplete?: number;
  };
  // Populated course data
  course?: {
    id: string;
    title: string;
    description: string;
    category: string;
    instructor: string;
    duration: number;
    level: string;
    imageUrl?: string;
  };
}

export interface EnrollmentRequest {
  courseId: string;
}

export interface ProgressUpdateRequest {
  courseId: string;
  lessonId?: string;
  timeSpent?: number;
  progressPercent?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Course Enrollment API
export const courseEnrollmentApi = {
  // Enroll in a course
  async enrollInCourse(courseId: string): Promise<UserCourse> {
    try {
      const response = await api.post<ApiResponse<UserCourse>>('/course/enroll', { courseId });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to enroll in course');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to enroll in course');
    }
  },

  // Get all enrolled courses
  async getMyCourses(): Promise<UserCourse[]> {
    try {
      const response = await api.get<ApiResponse<UserCourse[]>>('/course/my-courses');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch enrolled courses');
      }
      return response.data.data || [];
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch enrolled courses');
    }
  },

  // Get detailed info for an enrolled course
  async getEnrolledCourse(courseId: string): Promise<UserCourse> {
    try {
      const response = await api.get<ApiResponse<UserCourse>>(`/course/my-course/${courseId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch course details');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch course details');
    }
  },

  // Update course progress
  async updateProgress(data: ProgressUpdateRequest): Promise<UserCourse> {
    try {
      const response = await api.post<ApiResponse<UserCourse>>('/course/progress', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update progress');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to update progress');
    }
  },

  // Check enrollment status for a course
  async checkEnrollmentStatus(courseId: string): Promise<{ isEnrolled: boolean; userCourse?: UserCourse }> {
    try {
      const courses = await this.getMyCourses();
      const userCourse = courses.find(course => course.courseId === courseId);
      return {
        isEnrolled: !!userCourse,
        userCourse
      };
    } catch (error) {
      // If we can't fetch courses, assume not enrolled
      return { isEnrolled: false };
    }
  }
};
