import { useState, useEffect } from 'react';
import { studentApi, type StudentEnrollment } from '../services/studentApi';
import { useAuth } from '../contexts/AuthContextUtils';

export const useStudentEnrollments = () => {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await studentApi.getEnrollments();
        // Extract enrollments array from the response
        const enrollmentsData = response.data?.enrollments || [];
        setEnrollments(enrollmentsData);
      } catch (err) {
        console.error('Failed to fetch enrollments:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch enrollments');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user?.id]);

  const refetch = async () => {
    if (user?.id) {
      try {
        setError(null);
        const response = await studentApi.getEnrollments();
        // Extract enrollments array from the response
        const enrollmentsData = response.data?.enrollments || [];
        setEnrollments(enrollmentsData);
      } catch (err) {
        console.error('Failed to refetch enrollments:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch enrollments');
      }
    }
  };

  return {
    enrollments,
    loading,
    error,
    refetch,
  };
};

export default useStudentEnrollments; 