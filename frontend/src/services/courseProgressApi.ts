import api from './api';
import type { ApiResponse } from './api';
import type { AxiosError } from 'axios';

// Types for Course Progress API
export interface CourseProgressMetrics {
  completionPercentage: number;
  completedLessons: number;
  totalLessons: number;
  totalTimeSpent: number;
  averageTimePerLesson: number;
  averageQuizScore: number;
  learningVelocity: number;
  momentum: number;
  lastActivityDate?: string;
  isOnTrack: boolean;
}

export interface ModuleProgress {
  moduleId: string;
  title: string;
  description: string;
  orderIndex: number;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface EstimatedCompletion {
  isCompleted: boolean;
  daysRemaining: number;
  estimatedCompletionDate: string | null;
}

export interface RecentActivity {
  type: 'lesson_completion' | 'quiz_completion';
  title: string;
  date: string;
  timeSpent?: number;
  score?: number;
  points: number;
}

export interface CourseProgressData {
  enrollmentId: string;
  courseId: string;
  course: {
    title: string;
    description: string;
    category: string;
    level: string;
    instructor: string;
    thumbnail?: string;
    totalModules: number;
    totalLessons: number;
    estimatedDuration: number;
  };
  enrollment: {
    status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
    enrollmentDate: string;
    lastActivityDate?: string;
  };
  progress: CourseProgressMetrics;
  moduleProgress: ModuleProgress[];
  estimatedCompletion: EstimatedCompletion;
  recentActivity: RecentActivity[];
}

export interface CourseSummary {
  totalCourses: number;
  activeCourses: number;
  completedCourses: number;
  pausedCourses: number;
  averageProgress: number;
  totalHoursSpent: number;
  onTrackCourses: number;
  coursesWithMomentum: number;
  averageQuizScore: number;
  completionRate: number;
}

export interface StudentCoursesProgressResponse {
  studentId: string;
  lastUpdated: string;
  summary: CourseSummary;
  courses: CourseProgressData[];
  totalCourses: number;
}

export interface CourseAnalytics {
  courseId: string;
  courseName: string;
  dailyActivity: Array<{
    date: string;
    lessonsCompleted: number;
    quizzesTaken: number;
    timeSpent: number;
  }>;
  moduleProgress: ModuleProgress[];
  totalStats: {
    totalLessons: number;
    completedLessons: number;
    totalQuizzes: number;
    averageQuizScore: number;
    totalTimeSpent: number;
    enrollmentDate: string;
    lastActivity?: string;
  };
}

export interface ProgressUpdateRequest {
  courseId: string;
  lessonId: string;
  moduleId?: string;
  timeSpent?: number;
  completed?: boolean;
}

export interface ProgressUpdateResponse {
  courseId: string;
  progress: CourseProgressMetrics;
  lastUpdated: string;
}

// Course Progress API functions
export const courseProgressApi = {
  /**
   * Get comprehensive course progress data for student dashboard courses page
   */
  async getStudentCoursesProgress(params?: {
    status?: string;
    category?: string;
    search?: string;
    sortBy?: 'lastActivity' | 'progress' | 'title' | 'enrollmentDate';
    sortOrder?: 'asc' | 'desc';
  }): Promise<StudentCoursesProgressResponse> {
    try {
      const response = await api.get<ApiResponse<StudentCoursesProgressResponse>>(
        '/course-progress/courses',
        { params }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch courses progress');
      }
      
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(
        axiosError.response?.data?.message || 
        axiosError.message || 
        'Failed to fetch courses progress'
      );
    }
  },

  /**
   * Update course progress in real-time
   */
  async updateCourseProgress(data: ProgressUpdateRequest): Promise<ProgressUpdateResponse> {
    try {
      const response = await api.post<ApiResponse<ProgressUpdateResponse>>(
        '/course-progress/update',
        data
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update course progress');
      }
      
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(
        axiosError.response?.data?.message || 
        axiosError.message || 
        'Failed to update course progress'
      );
    }
  },

  /**
   * Get detailed analytics for a specific course
   */
  async getCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
    try {
      const response = await api.get<ApiResponse<CourseAnalytics>>(
        `/course-progress/analytics/${courseId}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch course analytics');
      }
      
      return response.data.data!;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(
        axiosError.response?.data?.message || 
        axiosError.message || 
        'Failed to fetch course analytics'
      );
    }
  },

  /**
   * Mark lesson as completed and update progress
   */
  async markLessonCompleted(data: {
    courseId: string;
    lessonId: string;
    moduleId?: string;
    timeSpent: number;
  }): Promise<ProgressUpdateResponse> {
    return this.updateCourseProgress({
      ...data,
      completed: true
    });
  },

  /**
   * Update lesson progress (partial completion)
   */
  async updateLessonProgress(data: {
    courseId: string;
    lessonId: string;
    moduleId?: string;
    timeSpent: number;
  }): Promise<ProgressUpdateResponse> {
    return this.updateCourseProgress({
      ...data,
      completed: false
    });
  }
};

export default courseProgressApi;
