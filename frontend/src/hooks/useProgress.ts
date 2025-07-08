import { useState, useEffect } from 'react';
import { progressApi, type LearningStatistics, type CourseProgress } from '../services/progressApi';
import { useAuth } from '../contexts/AuthContextUtils';

export const useProgress = (programmeId?: string) => {
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [statistics, setStatistics] = useState<LearningStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch learning statistics
        const statsData = await progressApi.getLearningStatistics(user.id);
        setStatistics(statsData);

        // If a specific programme is requested, fetch its progress
        if (programmeId) {
          const courseProgressData = await progressApi.getCourseProgress(user.id, programmeId);
          setCourseProgress(courseProgressData);
        }
      } catch (err) {
        console.error('Failed to fetch progress data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user?.id, programmeId]);

  const updateLessonProgress = async (lessonId: string, progressPercentage: number, timeSpent: number, notes?: string) => {
    if (!user?.id) return;

    try {
      await progressApi.updateLessonProgress({
        studentId: user.id,
        lessonId,
        progressPercentage,
        timeSpent,
        notes,
      });

      // Refetch progress data after update
      if (programmeId) {
        const updatedCourseProgress = await progressApi.getCourseProgress(user.id, programmeId);
        setCourseProgress(updatedCourseProgress);
      }

      const updatedStats = await progressApi.getLearningStatistics(user.id);
      setStatistics(updatedStats);
    } catch (err) {
      console.error('Failed to update lesson progress:', err);
      throw err;
    }
  };

  const markLessonCompleted = async (lessonId: string, timeSpent: number, notes?: string) => {
    if (!user?.id) return;

    try {
      await progressApi.markLessonCompleted({
        studentId: user.id,
        lessonId,
        timeSpent,
        notes,
      });

      // Refetch progress data after completion
      if (programmeId) {
        const updatedCourseProgress = await progressApi.getCourseProgress(user.id, programmeId);
        setCourseProgress(updatedCourseProgress);
      }

      const updatedStats = await progressApi.getLearningStatistics(user.id);
      setStatistics(updatedStats);
    } catch (err) {
      console.error('Failed to mark lesson as completed:', err);
      throw err;
    }
  };

  const submitQuizResults = async (
    lessonId: string,
    score: number,
    totalQuestions: number,
    correctAnswers: number,
    timeSpent: number,
    answers: { questionId: string; selectedAnswer: string; isCorrect: boolean }[]
  ) => {
    if (!user?.id) return;

    try {
      const result = await progressApi.recordQuizResults({
        studentId: user.id,
        lessonId,
        score,
        totalQuestions,
        correctAnswers,
        timeSpent,
        answers,
      });

      // Refetch progress data after quiz submission
      if (programmeId) {
        const updatedCourseProgress = await progressApi.getCourseProgress(user.id, programmeId);
        setCourseProgress(updatedCourseProgress);
      }

      const updatedStats = await progressApi.getLearningStatistics(user.id);
      setStatistics(updatedStats);

      return result;
    } catch (err) {
      console.error('Failed to submit quiz results:', err);
      throw err;
    }
  };

  const refetch = async () => {
    if (user?.id) {
      try {
        setError(null);
        
        const statsData = await progressApi.getLearningStatistics(user.id);
        setStatistics(statsData);

        if (programmeId) {
          const courseProgressData = await progressApi.getCourseProgress(user.id, programmeId);
          setCourseProgress(courseProgressData);
        }
      } catch (err) {
        console.error('Failed to refetch progress data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch progress data');
      }
    }
  };

  return {
    courseProgress,
    statistics,
    loading,
    error,
    updateLessonProgress,
    markLessonCompleted,
    submitQuizResults,
    refetch,
  };
};

export default useProgress;
