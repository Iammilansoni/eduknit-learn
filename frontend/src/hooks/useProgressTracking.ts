import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { progressApi } from '@/services/progressApi';

interface ProgressHookReturn {
  markLessonCompleted: (lessonId: string, timeSpent?: number, watchTimeVideo?: number, notes?: string) => Promise<void>;
  updateLessonProgress: (lessonId: string, progressPercentage: number, timeSpent?: number, watchTimeVideo?: number, notes?: string) => Promise<void>;
  recordQuizResult: (lessonId: string, quizData: QuizResultData) => Promise<void>;
  loading: boolean;
  error: string | null;
}

interface QuizResultData {
  quizId?: string;
  score: number;
  maxScore: number;
  passingScore: number;
  timeSpent?: number;
  answers?: Array<{
    questionId: string;
    answer: string | number | boolean | string[];
    isCorrect: boolean;
    pointsAwarded: number;
  }>;
  feedback?: string;
}

export const useProgressTracking = (): ProgressHookReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markLessonCompleted = useCallback(async (
    lessonId: string, 
    timeSpent?: number, 
    watchTimeVideo?: number, 
    notes?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await progressApi.markLessonAsCompleted(lessonId, {
        timeSpent: timeSpent || 0,
        watchTimeVideo: watchTimeVideo || 0,
        notes: notes || ''
      });

      toast({
        title: "Lesson Completed!",
        description: `Lesson has been marked as completed.`,
      });

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLessonProgress = useCallback(async (
    lessonId: string, 
    progressPercentage: number, 
    timeSpent?: number, 
    watchTimeVideo?: number, 
    notes?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await progressApi.updateLessonProgressNew(lessonId, {
        progressPercentage,
        timeSpent: timeSpent || 0,
        watchTimeVideo: watchTimeVideo || 0,
        notes: notes || ''
      });

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const recordQuizResult = useCallback(async (lessonId: string, quizData: QuizResultData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await progressApi.recordQuizResultNew(lessonId, quizData);
      
      const isPassed = (quizData.score / quizData.maxScore) * 100 >= quizData.passingScore;
      toast({
        title: isPassed ? "Quiz Passed!" : "Quiz Completed",
        description: isPassed 
          ? `Great job! You scored ${Math.round((quizData.score / quizData.maxScore) * 100)}%`
          : `You scored ${Math.round((quizData.score / quizData.maxScore) * 100)}%. Keep practicing!`,
        variant: isPassed ? "default" : "destructive"
      });

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    markLessonCompleted,
    updateLessonProgress,
    recordQuizResult,
    loading,
    error
  };
};

export default useProgressTracking;
