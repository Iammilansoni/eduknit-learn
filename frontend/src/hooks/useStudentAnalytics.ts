import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../services/api/analyticsApi';
import { toast } from 'react-toastify';

interface AnalyticsData {
  totalEnrollments: number;
  activeCourses: number;
  completedCourses: number;
  totalTimeSpent: number;
  averageTimePerCourse: number;
  averageProgress: number;
  progressOverTime: Array<{
    date: string;
    progress: number;
    timeSpent: number;
  }>;
  quizStats: {
    totalQuizzes: number;
    averageScore: number;
    passRate: number;
    bestStreak: number;
  };
  gamification: {
    totalPoints: number;
    badges: Array<{
      id: string;
      name: string;
      description: string;
      earned: boolean;
      earnedDate?: string;
    }>;
    level: number;
    currentStreak: number;
    longestStreak: number;
  };
  smartProgress: {
    actualProgress: number;
    expectedProgress: number;
    status: 'ahead' | 'on-track' | 'behind';
    daysRemaining: number;
  };
  profileCompleteness: {
    percentage: number;
    missingFields: string[];
  };
  learningStreaks: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
  };
}

interface UseStudentAnalyticsOptions {
  refreshInterval?: number; // in milliseconds
  autoRefresh?: boolean;
  onError?: (error: Error) => void;
}

interface UseStudentAnalyticsReturn {
  data: AnalyticsData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export const useStudentAnalytics = (
  options: UseStudentAnalyticsOptions = {}
): UseStudentAnalyticsReturn => {
  const {
    refreshInterval = 30000, // 30 seconds default
    autoRefresh = true,
    onError
  } = options;

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null);
const analyticsData = await analyticsApi.getStudentAnalytics();
      setData(analyticsData);
      setLastUpdated(new Date());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch analytics');
      setError(error);
      
      if (onError) {
        onError(error);
      } else {
        toast.error('Failed to load analytics data');
      }
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchAnalytics();
  }, [fetchAnalytics]);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchAnalytics, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAnalytics]);

  // Visibility change handler - refetch when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && autoRefresh) {
        fetchAnalytics();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoRefresh, fetchAnalytics]);

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated
  };
};

// Additional hook for real-time analytics updates using WebSocket
export const useRealTimeAnalytics = (
  userId: string,
  options: UseStudentAnalyticsOptions = {}
): UseStudentAnalyticsReturn => {
  const analyticsHook = useStudentAnalytics({
    ...options,
    autoRefresh: false // Disable polling since we use WebSocket
  });

  useEffect(() => {
    if (!userId) return;

    // WebSocket connection for real-time updates
    const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/analytics/${userId}`);

    ws.onopen = () => {
      console.log('Analytics WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const updatedData = JSON.parse(event.data);
        analyticsHook.data && setData(updatedData);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('Analytics WebSocket error:', error);
      toast.error('Real-time analytics connection failed');
    };

    ws.onclose = () => {
      console.log('Analytics WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, [userId]);

  return analyticsHook;
};

// Hook for specific analytics metrics
export const useAnalyticsMetrics = () => {
  const { data, loading, error } = useStudentAnalytics();

  const metrics = {
    // Course metrics
    courseCompletion: data ? (data.completedCourses / data.totalEnrollments) * 100 : 0,
    activeCoursesRatio: data ? (data.activeCourses / data.totalEnrollments) * 100 : 0,
    
    // Time metrics
    dailyAverageTime: data ? data.averageTimePerCourse / 30 : 0, // Assuming 30 days per course
    weeklyTimeSpent: data ? data.totalTimeSpent / 52 : 0, // Assuming yearly data
    
    // Performance metrics
    overallPerformance: data ? (data.quizStats.averageScore + data.averageProgress) / 2 : 0,
    learningEfficiency: data ? data.totalTimeSpent > 0 ? (data.averageProgress / data.totalTimeSpent) * 100 : 0 : 0,
    
    // Progress metrics
    progressVelocity: data?.smartProgress ? 
      data.smartProgress.actualProgress - data.smartProgress.expectedProgress : 0,
    
    // Engagement metrics
    streakConsistency: data ? 
      data.learningStreaks.currentStreak / data.learningStreaks.longestStreak : 0,
    profileHealth: data ? data.profileCompleteness.percentage : 0
  };

  return {
    metrics,
    loading,
    error,
    rawData: data
  };
};
