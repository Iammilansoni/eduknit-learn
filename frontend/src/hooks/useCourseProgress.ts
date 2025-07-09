import { useState, useEffect, useCallback } from 'react';
import { progressApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContextUtils';

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

  const enrollInCourse = async (programmeId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the backend API to enroll in course
      const response = await progressApi.enrollInProgram(programmeId);
      return response.data;
    } catch (err) {
      console.error('Failed to enroll in course:', err);
      setError(err instanceof Error ? err.message : 'Failed to enroll in course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    enrollInCourse,
    loading,
    error
  };
};