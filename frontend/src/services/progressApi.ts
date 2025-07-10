import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for Progress API responses
export interface ProgressData {
  studentId: string;
  programmeId: string;
  moduleId?: string;
  lessonId?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercentage: number;
  timeSpent: number;
  lastAccessedAt: string;
  completedAt?: string;
  bookmarked: boolean;
  notes: string;
  attempts: number;
}

export interface CourseProgress {
  programmeId: string;
  programmeTitle: string;
  overallProgress: number;
  modulesCompleted: number;
  totalModules: number;
  lessonsCompleted: number;
  totalLessons: number;
  timeSpent: number;
  lastAccessedAt: string;
  enrollmentDate: string;
  modules: ModuleProgress[];
}

export interface ModuleProgress {
  moduleId: string;
  title: string;
  description: string;
  orderIndex: number;
  progress: {
    completedLessons: number;
    totalLessons: number;
    progressPercentage: number;
    isCompleted: boolean;
    isStarted: boolean;
  };
  estimatedDuration: number;
  dueDate?: string;
  lessons: LessonProgress[];
}

export interface LessonProgress {
  lessonId: string;
  title: string;
  type: string;
  orderIndex: number;
  progress: {
    status: string;
    progressPercentage: number;
    timeSpent: number;
    lastAccessedAt?: string;
    completedAt?: string;
    bookmarked: boolean;
    notes: string;
    attempts: number;
  };
}

export interface NextModuleResponse {
  hasNextModule: boolean;
  nextModule?: {
    moduleId: string;
    title: string;
    description: string;
    orderIndex: number;
    estimatedDuration: number;
    dueDate?: string;
    learningObjectives: string[];
    prerequisitesMet: boolean;
    prerequisites: string[];
    totalLessons: number;
    programmeInfo: {
      programmeId: string;
      title: string;
    };
  };
  currentModuleId?: string;
  progressSummary: {
    totalModules: number;
    completedModules: number;
    overallProgress: number;
  };
}

export interface LearningStatistics {
  totalStudyTime: number; // in minutes
  lessonsCompleted: number;
  coursesEnrolled: number;
  coursesCompleted: number;
  averageCompletionRate: number;
  currentStreak: number;
  longestStreak: number;
  recentActivity: {
    lastActiveDate: string;
    activeDaysThisWeek: number;
    activeDaysThisMonth: number;
  };
  weeklyProgress: {
    week: string;
    studyTime: number;
    lessonsCompleted: number;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    unlockedAt: string;
    category: string;
  }[];
  upcomingDeadlines: {
    moduleId: string;
    moduleTitle: string;
    programmeTitle: string;
    dueDate: string;
    daysRemaining: number;
  }[];
}

export interface QuizResult {
  resultId: string;
  lessonId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
  answers: {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }[];
}

export interface ProgressDashboard {
  student: {
    studentId: string;
    name: string;
    email: string;
  };
  overview: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalStudyTime: number;
    lessonsCompleted: number;
    overallProgress: number;
  };
  recentActivity: {
    lessonId: string;
    lessonTitle: string;
    moduleTitle: string;
    programmeTitle: string;
    lastAccessedAt: string;
    progressPercentage: number;
  }[];
  courses: CourseProgress[];
}

// Progress API functions
export const progressApi = {
  // Get comprehensive progress for a student
  async getStudentProgress(studentId: string, programmeId?: string): Promise<ProgressDashboard> {
    const params = programmeId ? { programmeId } : {};
    const response = await api.get(`/progress/student/${studentId}`, { params });
    return response.data.data;
  },

  // Get detailed progress for a specific course
  async getCourseProgress(studentId: string, programmeId: string): Promise<CourseProgress> {
    const response = await api.get(`/progress/course/${studentId}/${programmeId}`);
    return response.data.data;
  },

  // Get next module recommendation
  async getNextModule(studentId: string, programmeId: string): Promise<NextModuleResponse> {
    const response = await api.get(`/progress/next-module/${studentId}/${programmeId}`);
    return response.data.data;
  },

  // Get learning statistics and analytics
  async getLearningStatistics(studentId: string): Promise<LearningStatistics> {
    const response = await api.get(`/progress/statistics/${studentId}`);
    return response.data.data;
  },

  // Mark a lesson as completed
  async markLessonCompleted(data: {
    studentId: string;
    lessonId: string;
    timeSpent: number;
    notes?: string;
  }): Promise<ProgressData> {
    const response = await api.post('/progress/lesson/complete', data);
    return response.data.data;
  },

  // Update lesson progress
  async updateLessonProgress(data: {
    studentId: string;
    lessonId: string;
    progressPercentage: number;
    timeSpent: number;
    notes?: string;
    bookmarked?: boolean;
  }): Promise<ProgressData> {
    const response = await api.put('/progress/lesson/update', data);
    return response.data.data;
  },

  // Record quiz results
  async recordQuizResults(data: {
    studentId: string;
    lessonId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    answers: {
      questionId: string;
      selectedAnswer: string;
      isCorrect: boolean;
    }[];
  }): Promise<QuizResult> {
    const response = await api.post('/progress/quiz/submit', data);
    return response.data.data;
  },

  // Get quiz results for a lesson
  async getQuizResults(studentId: string, lessonId: string): Promise<QuizResult[]> {
    const response = await api.get(`/progress/quiz/${studentId}/${lessonId}`);
    return response.data.data;
  },

  // Get progress dashboard
  async getProgressDashboard(studentId: string): Promise<ProgressDashboard> {
    const response = await api.get(`/progress/dashboard/${studentId}`);
    return response.data.data;
  },

  // Get course analytics
  async getCourseAnalytics(studentId: string, programmeId: string): Promise<{
    timeDistribution: { moduleTitle: string; timeSpent: number }[];
    progressTrend: { date: string; progressPercentage: number }[];
    engagementMetrics: {
      averageSessionTime: number;
      totalSessions: number;
      bookmarkedLessons: number;
      notesCount: number;
    };
  }> {
    const response = await api.get(`/progress/analytics/${studentId}/${programmeId}`);
    return response.data.data;
  },

  // Update enrollment status
  async updateEnrollmentStatus(enrollmentId: string, status: 'ACTIVE' | 'COMPLETED' | 'PAUSED'): Promise<any> {
    try {
      const response = await api.put<ApiResponse<any>>(`/student/enrollment/${enrollmentId}/status`, { status });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update enrollment status');
      }
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to update enrollment status');
    }
  },


};

export default progressApi;
