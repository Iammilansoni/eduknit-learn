import { useState, useEffect } from 'react';
import { courseContentApi, type Course, type CourseDetails } from '../services/courseContentApi';
import { studentApi, type EnrolledProgram } from '../services/studentApi';
import { useAuth } from '../contexts/AuthContextUtils';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledPrograms, setEnrolledPrograms] = useState<EnrolledProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all courses
        const coursesResponse = await courseContentApi.getAllCourses();
        setCourses(coursesResponse.data);

        // If user is authenticated, fetch enrolled programs
        if (user?.id) {
          try {
            const enrolledProgramsData = await studentApi.getEnrolledPrograms();
            setEnrolledPrograms(enrolledProgramsData);
          } catch (enrolledError) {
            console.warn('Failed to fetch enrolled programs:', enrolledError);
            // Don't set error for this, just continue without enrolled programs
          }
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user?.id]);

  const refetch = async () => {
    try {
      setError(null);
      const coursesResponse = await courseContentApi.getAllCourses();
      setCourses(coursesResponse.data);

      if (user?.id) {
        try {
          const enrolledProgramsData = await studentApi.getEnrolledPrograms();
          setEnrolledPrograms(enrolledProgramsData);
        } catch (enrolledError) {
          console.warn('Failed to fetch enrolled programs:', enrolledError);
        }
      }
    } catch (err) {
      console.error('Failed to refetch courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
    }
  };

  return {
    courses,
    enrolledPrograms,
    loading,
    error,
    refetch,
  };
};

export const useCourseDetails = (courseId: string) => {
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const details = await courseContentApi.getCourseDetails(courseId);
        setCourseDetails(details);
      } catch (err) {
        console.error('Failed to fetch course details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const refetch = async () => {
    if (courseId) {
      try {
        setError(null);
        const details = await courseContentApi.getCourseDetails(courseId);
        setCourseDetails(details);
      } catch (err) {
        console.error('Failed to refetch course details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch course details');
      }
    }
  };

  return {
    courseDetails,
    loading,
    error,
    refetch,
  };
};

export default useCourses;
