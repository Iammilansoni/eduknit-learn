import api from './api';
import type { ApiResponse } from './api';
import type { AxiosError } from 'axios';

// Student-related types
export interface StudentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
  academicInfo?: {
    previousEducation?: string;
    currentLevel?: string;
    specializations?: string[];
    goals?: string[];
  };
  preferences?: {
    learningStyle?: string;
    timezone?: string;
    language?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
  };
  profilePicture?: string;
  isProfileComplete: boolean;
  completionPercentage: number;
  enrollmentStatus: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface StudentDashboard {
  student: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
    enrollmentStatus: string;
    isProfileComplete: boolean;
    completionPercentage: number;
  };
  stats: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalStudyTime: number;
    lessonsCompleted: number;
    overallProgress: number;
    currentStreak: number;
    longestStreak: number;
  };
  recentActivity: {
    lessonId: string;
    lessonTitle: string;
    moduleTitle: string;
    programmeTitle: string;
    lastAccessedAt: string;
    progressPercentage: number;
  }[];
  upcomingDeadlines: {
    moduleId: string;
    moduleTitle: string;
    programmeTitle: string;
    dueDate: string;
    daysRemaining: number;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    unlockedAt: string;
    category: string;
  }[];
}

export interface Enrollment {
  id: string;
  studentId: string;
  programmeId: string;
  programme: {
    id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    imageUrl?: string;
    totalModules: number;
    totalLessons: number;
    estimatedDuration: number;
  };
  enrollmentDate: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: {
    completedModules: number;
    totalModules: number;
    completedLessons: number;
    totalLessons: number;
    overallProgress: number;
    timeSpent: number;
    lastAccessedAt?: string;
  };
  certificateIssued?: boolean;
  certificateUrl?: string;
}

export interface StudentAnalytics {
  studyTime: {
    daily: { date: string; minutes: number }[];
    weekly: { week: string; minutes: number }[];
    monthly: { month: string; minutes: number }[];
  };
  progress: {
    trend: { date: string; percentage: number }[];
    byCategory: { category: string; percentage: number }[];
    byLevel: { level: string; percentage: number }[];
  };
  engagement: {
    streaks: {
      current: number;
      longest: number;
      history: { date: string; active: boolean }[];
    };
    sessions: {
      totalSessions: number;
      averageSessionTime: number;
      sessionsThisWeek: number;
      sessionsThisMonth: number;
    };
  };
  achievements: {
    total: number;
    recent: {
      id: string;
      title: string;
      unlockedAt: string;
    }[];
    categories: { category: string; count: number }[];
  };
}

export interface LearningActivity {
  lessonId: string;
  timeSpent: number;
  progressPercentage: number;
  completed: boolean;
  notes?: string;
  bookmarked?: boolean;
}

export interface EnrolledProgram {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  imageUrl?: string;
  progress: {
    completedModules: number;
    totalModules: number;
    completedLessons: number;
    totalLessons: number;
    overallProgress: number;
    timeSpent: number;
    lastAccessedAt?: string;
  };
  enrollmentDate: string;
  status: string;
}

// Student API functions
export const studentApi = {
  // Get student dashboard
  async getDashboard(studentId?: string): Promise<StudentDashboard> {
    try {
      const url = studentId ? `/student/dashboard/${studentId}` : '/student/dashboard';
      const response = await api.get<ApiResponse<StudentDashboard>>(url);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch dashboard');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch dashboard');
    }
  },

  // Get student profile
  async getProfile(studentId?: string): Promise<StudentProfile> {
    try {
      const url = studentId ? `/student/profile/${studentId}` : '/student/profile';
      const response = await api.get<ApiResponse<StudentProfile>>(url);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch profile');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch profile');
    }
  },

  // Update student profile
  async updateProfile(profileData: Partial<StudentProfile>): Promise<StudentProfile> {
    try {
      const response = await api.put<ApiResponse<StudentProfile>>('/student/profile', profileData);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to update profile');
    }
  },

  // Upload profile photo
  async uploadProfilePhoto(file: File): Promise<{ profilePicture: string }> {
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const response = await api.post<ApiResponse<{ profilePicture: string }>>('/student/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to upload photo');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to upload photo');
    }
  },

  // Delete profile photo
  async deleteProfilePhoto(): Promise<void> {
    try {
      const response = await api.delete<ApiResponse>('/student/profile/photo');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete photo');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to delete photo');
    }
  },

  // Get student enrollments
  async getEnrollments(): Promise<Enrollment[]> {
    try {
      const response = await api.get<ApiResponse<Enrollment[]>>('/student/enrollments');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch enrollments');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch enrollments');
    }
  },

  // Get enrollment details
  async getEnrollmentDetails(enrollmentId: string): Promise<Enrollment> {
    try {
      const response = await api.get<ApiResponse<Enrollment>>(`/student/enrollment/${enrollmentId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch enrollment details');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch enrollment details');
    }
  },

  // Update learning activity
  async updateLearningActivity(activityData: LearningActivity): Promise<void> {
    try {
      const response = await api.post<ApiResponse>('/student/activity', activityData);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update learning activity');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to update learning activity');
    }
  },

  // Get student analytics
  async getAnalytics(): Promise<StudentAnalytics> {
    try {
      const response = await api.get<ApiResponse<StudentAnalytics>>('/student/analytics');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch analytics');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch analytics');
    }
  },

  // Get profile photo URL
  async getProfilePhotoUrl(): Promise<{ profilePictureUrl: string }> {
    try {
      const response = await api.get<ApiResponse<{ profilePictureUrl: string }>>('/student/profile/photo-url');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get profile photo URL');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to get profile photo URL');
    }
  },

  // Get enrolled programs
  async getEnrolledPrograms(): Promise<EnrolledProgram[]> {
    try {
      const response = await api.get<ApiResponse<EnrolledProgram[]>>('/student/programs');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch enrolled programs');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch enrolled programs');
    }
  },

  // Enroll in program
  async enrollInProgram(programId: string): Promise<Enrollment> {
    try {
      const response = await api.post<ApiResponse<Enrollment>>('/student/enroll', { programId });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to enroll in program');
      }
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to enroll in program');
    }
  },
};

export default studentApi;
