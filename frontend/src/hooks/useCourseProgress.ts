import { useState, useEffect, useCallback } from 'react';
import { progressApi, handleApiError } from '@/services/api';
import { useAuth } from '@/contexts/AuthContextUtils';
import { useQueryClient } from '@tanstack/react-query';

// Types for API responses
export interface Course {
  courseId: string;
  title: string;
  progress: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED';
  category: string;
  enrollmentDate?: string;
}

export interface DashboardMetrics {
  enrolledCoursesCount: number;
  completedCoursesCount: number;
  overallProgress: number;
  totalStudyTimeHours: number;
  currentStreak: number;
  longestStreak: number;
  totalQuizzes: number;
  averageQuizScore: number;
}

export interface UpcomingDeadline {
  courseTitle: string;
  expectedDate: string;
  daysLeft: number;
}

export interface RecentActivity {
  completedAt: string;
  timeSpent?: number;
  courseTitle?: string;
  lessonTitle?: string;
}

export interface DashboardData {
  courses: Course[];
  metrics: DashboardMetrics;
  upcomingDeadlines: UpcomingDeadline[];
  recentActivity: RecentActivity[];
}

export interface SmartProgressData {
  courseId: string;
  courseName: string;
  totalLessons: number;
  lessonsCompleted: number;
  daysElapsed: number;
  totalCourseDays: number;
  actualProgress: number;
  expectedProgress: number;
  deviation: number;
  label: 'Ahead' | 'On Track' | 'Behind';
  enrollmentDate: string;
  lastActivity: string;
}

export interface LessonCompletionData {
  studentId: string;
  programmeId: string;
  moduleId: string;
  lessonId: string;
  timeSpent?: number;
}

export interface QuizSubmissionData {
  studentId: string;
  programmeId: string;
  moduleId: string;
  lessonId: string;
  quizId: string;
  score: number;
  maxScore: number;
  timeSpent: number;
  answers: Array<{
    questionId: string;
    answer: string | number | string[];
  }>;
  passingScore: number;
}

// Hook for dashboard data
export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Call the backend API for dashboard data
      const response = await progressApi.getDashboardData(user.id);
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id, fetchDashboardData]);

  const refetch = () => {
    if (user?.id) {
      fetchDashboardData();
    }
  };

  return {
    dashboardData,
    loading,
    error,
    refetch
  };
};

// Hook for smart progress tracking
export const useSmartProgress = (courseId: string) => {
  const [progressData, setProgressData] = useState<SmartProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSmartProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!courseId) {
        throw new Error('Course ID is required');
      }

      // Call the backend API for smart progress
      const response = await progressApi.getSmartProgress(courseId);
      setProgressData(response.data);
    } catch (err) {
      console.error('Failed to fetch smart progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch smart progress');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchSmartProgress();
    }
  }, [courseId, fetchSmartProgress]);

  const refetch = () => {
    if (courseId) {
      fetchSmartProgress();
    }
  };

  return {
    progressData,
    loading,
    error,
    refetch
  };
};

// Hook for course progress
export const useCourseProgress = (studentId: string, programmeId: string) => {
  const [courseProgress, setCourseProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!studentId || !programmeId) {
        throw new Error('Student ID and Programme ID are required');
      }

      // Call the backend API for course progress
      const response = await progressApi.getCourseProgress(studentId, programmeId);
      setCourseProgress(response.data);
    } catch (err) {
      console.error('Failed to fetch course progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch course progress');
    } finally {
      setLoading(false);
    }
  }, [studentId, programmeId]);

  useEffect(() => {
    if (studentId && programmeId) {
      fetchCourseProgress();
    }
  }, [studentId, programmeId, fetchCourseProgress]);

  const refetch = () => {
    if (studentId && programmeId) {
      fetchCourseProgress();
    }
  };

  return {
    courseProgress,
    loading,
    error,
    refetch
  };
};

// Hook for lesson completion
export const useLessonCompletion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markLessonComplete = async (data: LessonCompletionData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the backend API to mark lesson as complete
      const response = await progressApi.markLessonComplete(data);
      return response.data;
    } catch (err) {
      console.error('Failed to mark lesson as complete:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark lesson as complete');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    markLessonComplete,
    loading,
    error
  };
};

// Hook for quiz submission
export const useQuizSubmission = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitQuiz = async (data: QuizSubmissionData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the backend API to submit quiz results
      const response = await progressApi.submitQuiz(data);
      return response.data;
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitQuiz,
    loading,
    error
  };
};

// Hook for enrollment management
export const useEnrollment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const enrollInCourse = useCallback(async (programmeId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Enrolling in course with programmeId:', programmeId);
      console.log('API base URL:', '/api (using Vite proxy)');
      console.log('Full URL will be:', '/api/student/enroll (proxied to backend)');
      
      const result = await progressApi.enrollInProgram(programmeId);
      console.log('Enrollment successful:', result);
      
      // Invalidate and refetch all related queries to update the UI immediately
      await queryClient.invalidateQueries({ queryKey: ['student-enrollments'] });
      await queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['student-analytics'] });
      await queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      await queryClient.invalidateQueries({ queryKey: ['enrolled-programs'] });
      await queryClient.invalidateQueries({ queryKey: ['progress-dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['student-profile-photo'] });
      
      // Force refetch critical data
      await queryClient.refetchQueries({ queryKey: ['student-enrollments'] });
      await queryClient.refetchQueries({ queryKey: ['student-dashboard'] });
      
      return result;
    } catch (err) {
      console.error('Failed to enroll in course:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        status: (err as any)?.response?.status,
        statusText: (err as any)?.response?.statusText,
        url: (err as any)?.config?.url,
        method: (err as any)?.config?.method,
        data: (err as any)?.config?.data
      });
      
      const errorMessage = handleApiError(err as any);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, queryClient]);

  return {
    enrollInCourse,
    loading,
    error
  };
};

// Hook for updating enrollment status
export const useUpdateEnrollmentStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateStatus = useCallback(async (enrollmentId: string, status: 'ACTIVE' | 'COMPLETED' | 'PAUSED') => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Updating enrollment status:', { enrollmentId, status });
      
      const result = await progressApi.updateEnrollmentStatus(enrollmentId, status);
      console.log('Status update successful:', result);
      
      // Invalidate and refetch all related queries to update the UI immediately
      await queryClient.invalidateQueries({ queryKey: ['student-enrollments'] });
      await queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['student-analytics'] });
      await queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      await queryClient.invalidateQueries({ queryKey: ['enrolled-programs'] });
      await queryClient.invalidateQueries({ queryKey: ['progress-dashboard'] });
      
      // Force refetch critical data
      await queryClient.refetchQueries({ queryKey: ['student-enrollments'] });
      await queryClient.refetchQueries({ queryKey: ['student-dashboard'] });
      
      return result;
    } catch (err) {
      console.error('Failed to update enrollment status:', err);
      
      const errorMessage = handleApiError(err as any);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, queryClient]);

  return {
    updateStatus,
    loading,
    error
  };
};

