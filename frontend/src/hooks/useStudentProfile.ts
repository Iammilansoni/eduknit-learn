import { useState, useEffect } from 'react';
import { studentApi, type StudentProfile } from '../services/studentApi';
import { useAuth } from '../contexts/AuthContextUtils';

export const useStudentProfile = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await studentApi.getProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const refetch = async () => {
    if (user?.id) {
      try {
        setError(null);
        const data = await studentApi.getProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to refetch profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      }
    }
  };

  return {
    profile,
    loading,
    error,
    refetch,
  };
};

export default useStudentProfile; 