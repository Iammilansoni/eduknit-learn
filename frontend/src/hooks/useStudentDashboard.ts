import { useState, useEffect, useCallback } from 'react';
import { studentApi, type StudentDashboard } from '../services/studentApi';
import { progressApi, type ProgressDashboard } from '../services/progressApi';
import { useAuth } from '../contexts/AuthContextUtils';

export const useStudentDashboard = () => {
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [progressDashboard, setProgressDashboard] = useState<ProgressDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch both student dashboard and progress dashboard data
      const [studentDashboardData, progressDashboardData] = await Promise.all([
        studentApi.getDashboard(),
        progressApi.getProgressDashboard(user.id)
      ]);

      setDashboard(studentDashboardData);
      setProgressDashboard(progressDashboardData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up periodic refresh for real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const refetch = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboard,
    progressDashboard,
    loading,
    error,
    refetch,
  };
};

export default useStudentDashboard;
