import { useState, useEffect, useCallback, useRef } from 'react';
import { progressApi } from '@/services/progressApi';
import { useAuth } from '@/contexts/AuthContextUtils';
import { useQueryClient } from '@tanstack/react-query';

// Helper function to handle API errors
const handleApiError = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  if (error?.response?.status === 404) {
    return 'Resource not found';
  }
  if (error?.response?.status === 401) {
    return 'Authentication required';
  }
  if (error?.response?.status === 403) {
    return 'Access denied';
  }
  if (error?.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  return 'An unexpected error occurred';
};

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

export interface RealTimeProgressUpdate {
  courseId: string;
  progress: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED';
  lastActivity: string;
  timeSpent?: number;
}

export interface WebSocketMessage {
  type: 'PROGRESS_UPDATE' | 'COURSE_COMPLETION' | 'LESSON_COMPLETION' | 'QUIZ_SUBMISSION';
  data: any;
  timestamp: string;
  userId: string;
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

// Hook for real-time dashboard data with WebSocket integration
export const useRealTimeDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

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

  const connectWebSocket = useCallback(() => {
    if (!user?.id) return;

    try {
      // Use environment variable for WebSocket URL or fallback to localhost
      const wsUrl = process.env.VITE_WS_URL || 'ws://localhost:8080';
      const ws = new WebSocket(`${wsUrl}/ws/progress/${user.id}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected for real-time progress updates');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Send authentication message
        ws.send(JSON.stringify({
          type: 'AUTH',
          userId: user.id,
          timestamp: new Date().toISOString()
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Only process messages for the current user
          if (message.userId !== user.id) return;

          switch (message.type) {
            case 'PROGRESS_UPDATE':
              const progressUpdate = message.data as RealTimeProgressUpdate;
              setDashboardData(prev => {
                if (!prev) return prev;
                
                const updatedCourses = prev.courses.map(course => {
                  if (course.courseId === progressUpdate.courseId) {
                    return {
                      ...course,
                      progress: progressUpdate.progress,
                      status: progressUpdate.status
                    };
                  }
                  return course;
                });
                
                return {
                  ...prev,
                  courses: updatedCourses
                };
              });
              break;
              
            case 'COURSE_COMPLETION':
              // Handle course completion
              setDashboardData(prev => {
                if (!prev) return prev;
                
                const courseId = message.data.courseId;
                const updatedCourses = prev.courses.map(course => {
                  if (course.courseId === courseId) {
                    return {
                      ...course,
                      progress: 100,
                      status: 'COMPLETED' as const
                    };
                  }
                  return course;
                });
                
                return {
                  ...prev,
                  courses: updatedCourses,
                  metrics: {
                    ...prev.metrics,
                    completedCoursesCount: prev.metrics.completedCoursesCount + 1
                  }
                };
              });
              break;
              
            case 'LESSON_COMPLETION':
            case 'QUIZ_SUBMISSION':
              // Refresh dashboard data for lesson/quiz updates
              fetchDashboardData();
              break;
              
            default:
              console.log('Unknown WebSocket message type:', message.type);
          }
        } catch (err) {
          console.error('Failed to process WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect if not exceeded max attempts
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, reconnectDelay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Real-time updates may not work.');
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to establish real-time connection');
    }
  }, [user?.id, fetchDashboardData]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [user?.id, fetchDashboardData, connectWebSocket, disconnectWebSocket]);

  const refetch = useCallback(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id, fetchDashboardData]);

  const forceReconnect = useCallback(() => {
    disconnectWebSocket();
    if (user?.id) {
      setTimeout(() => {
        connectWebSocket();
      }, 1000);
    }
  }, [user?.id, connectWebSocket, disconnectWebSocket]);

  return {
    dashboardData,
    loading,
    error,
    isConnected,
    refetch,
    forceReconnect
  };
};

// Hook for real-time course progress tracking
export const useRealTimeCourseProgress = (courseId: string) => {
  const [courseProgress, setCourseProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const fetchCourseProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id || !courseId) {
        throw new Error('User ID and Course ID are required');
      }

      // Call the backend API for course progress
      const response = await progressApi.getCourseProgress(user.id, courseId);
      setCourseProgress(response.data);
    } catch (err) {
      console.error('Failed to fetch course progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch course progress');
    } finally {
      setLoading(false);
    }
  }, [user?.id, courseId]);

  const connectWebSocket = useCallback(() => {
    if (!user?.id || !courseId) return;

    try {
      // Use environment variable for WebSocket URL or fallback to localhost
      const wsUrl = process.env.VITE_WS_URL || 'ws://localhost:8080';
      const ws = new WebSocket(`${wsUrl}/ws/course/${courseId}/progress/${user.id}`);
      
      ws.onopen = () => {
        console.log(`WebSocket connected for course ${courseId} progress updates`);
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Send authentication message
        ws.send(JSON.stringify({
          type: 'AUTH',
          userId: user.id,
          courseId: courseId,
          timestamp: new Date().toISOString()
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Only process messages for the current user and course
          if (message.userId !== user.id) return;

          switch (message.type) {
            case 'PROGRESS_UPDATE':
              const progressUpdate = message.data as RealTimeProgressUpdate;
              if (progressUpdate.courseId === courseId) {
                setCourseProgress(prev => ({
                  ...prev,
                  progress: progressUpdate.progress,
                  status: progressUpdate.status,
                  lastActivity: progressUpdate.lastActivity,
                  timeSpent: progressUpdate.timeSpent || prev?.timeSpent
                }));
              }
              break;
              
            case 'LESSON_COMPLETION':
            case 'QUIZ_SUBMISSION':
              // Refresh course progress for lesson/quiz updates
              if (message.data.courseId === courseId) {
                fetchCourseProgress();
              }
              break;
              
            default:
              console.log('Unknown WebSocket message type:', message.type);
          }
        } catch (err) {
          console.error('Failed to process WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect if not exceeded max attempts
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, reconnectDelay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Real-time updates may not work.');
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to establish real-time connection');
    }
  }, [user?.id, courseId, fetchCourseProgress]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (user?.id && courseId) {
      fetchCourseProgress();
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [user?.id, courseId, fetchCourseProgress, connectWebSocket, disconnectWebSocket]);

  const refetch = useCallback(() => {
    if (user?.id && courseId) {
      fetchCourseProgress();
    }
  }, [user?.id, courseId, fetchCourseProgress]);

  const forceReconnect = useCallback(() => {
    disconnectWebSocket();
    if (user?.id && courseId) {
      setTimeout(() => {
        connectWebSocket();
      }, 1000);
    }
  }, [user?.id, courseId, connectWebSocket, disconnectWebSocket]);

  return {
    courseProgress,
    loading,
    error,
    isConnected,
    refetch,
    forceReconnect
  };
};

// Hook for real-time progress notifications
export const useRealTimeProgressNotifications = () => {
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connectWebSocket = useCallback(() => {
    if (!user?.id) return;

    try {
      // Use environment variable for WebSocket URL or fallback to localhost
      const wsUrl = process.env.VITE_WS_URL || 'ws://localhost:8080';
      const ws = new WebSocket(`${wsUrl}/ws/notifications/${user.id}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected for real-time notifications');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Send authentication message
        ws.send(JSON.stringify({
          type: 'AUTH',
          userId: user.id,
          timestamp: new Date().toISOString()
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Only process messages for the current user
          if (message.userId !== user.id) return;

          setNotifications(prev => [message, ...prev.slice(0, 9)]); // Keep last 10 notifications
        } catch (err) {
          console.error('Failed to process WebSocket notification:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect if not exceeded max attempts
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, reconnectDelay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
    }
  }, [user?.id]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markNotificationAsRead = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    if (user?.id) {
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [user?.id, connectWebSocket, disconnectWebSocket]);

  const forceReconnect = useCallback(() => {
    disconnectWebSocket();
    if (user?.id) {
      setTimeout(() => {
        connectWebSocket();
      }, 1000);
    }
  }, [user?.id, connectWebSocket, disconnectWebSocket]);

  return {
    notifications,
    isConnected,
    clearNotifications,
    markNotificationAsRead,
    forceReconnect
  };
};

