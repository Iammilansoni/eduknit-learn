import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';

// API base URL - Use relative path to go through Vite proxy
const API_BASE_URL = '/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - tokens are handled via HTTP-only cookies
api.interceptors.request.use(
  (config) => {
    // Tokens are automatically sent via HTTP-only cookies
    // No need to manually add Authorization header
    console.log('API Request Interceptor:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      withCredentials: config.withCredentials,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('API Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response Interceptor Success:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    console.log('API Response Interceptor Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message
    });
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // List of public pages that don't require authentication
      const publicPages = [
        '/login',
        '/register', 
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/verification',
        '/verify'
      ];
      
      const isPublicPage = publicPages.some(page => window.location.pathname === page);
      
      // Only try to refresh if we're not on a public page or calling auth endpoints
      if (!isPublicPage && 
          !originalRequest.url?.includes('/auth/login') && 
          !originalRequest.url?.includes('/auth/refresh') &&
          !originalRequest.url?.includes('/auth/reset-password') &&
          !originalRequest.url?.includes('/auth/verify-email')) {
        try {
          // Try to refresh the token via HTTP-only cookies
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            withCredentials: true,
          });
          if ((refreshResponse.data as ApiResponse).success) {
            // Retry the original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, but don't immediately redirect to login
          // Let the component handle the error gracefully
          console.log('Token refresh failed, but continuing without redirect');
          return Promise.reject(error);
        }
      }
    }
    
    // Handle 403 errors (forbidden) - don't redirect, just return the error
    if (error.response?.status === 403) {
      console.log('Access forbidden, but not redirecting');
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
  error?: {
    code: string;
    message: string;
    details?: unknown[];
  };
  timestamp?: string;
  path?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user' | 'student' | 'visitor';
  profilePicture?: string;
  enrollmentStatus: 'active' | 'inactive' | 'suspended';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'user' | 'student' | 'visitor';
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

// Type definitions to replace all any types
export interface StudentProfile {
  contactInfo?: {
    phoneNumber?: string;
    alternateEmail?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    timezone?: string;
  };
  academicInfo?: {
    educationLevel?: 'HIGH_SCHOOL' | 'UNDERGRADUATE' | 'GRADUATE' | 'POSTGRADUATE' | 'OTHER';
    institution?: string;
    fieldOfStudy?: string;
    graduationYear?: number;
    currentlyStudying?: boolean;
  };
  professionalInfo?: {
    currentPosition?: string;
    company?: string;
    industry?: string;
    experience?: 'STUDENT' | '0-1' | '1-3' | '3-5' | '5-10' | '10+';
    skills?: string[];
    interests?: string[];
  };
  learningPreferences?: {
    preferredLearningStyle?: 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | 'READING_WRITING';
    goals?: string[];
    availabilityHours?: number;
    preferredTimeSlots?: string[];
    notificationPreferences?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      frequency?: 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'NEVER';
    };
  };
  privacy?: {
    profileVisibility?: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
    allowMessaging?: boolean;
    allowConnectionRequests?: boolean;
    dataProcessingConsent?: boolean;
    marketingConsent?: boolean;
  };
  gamification?: {
    totalPoints?: number;
    level?: number;
    badges?: Badge[];
    achievements?: Achievement[];
    streaks?: {
      currentLoginStreak?: number;
      longestLoginStreak?: number;
      currentLearningStreak?: number;
      longestLearningStreak?: number;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  earnedAt: string;
  category?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  unlockedAt: string;
  type: 'MILESTONE' | 'STREAK' | 'COMPLETION' | 'PERFORMANCE';
}

export interface Enrollment {
  id: string;
  programmeId: string;
  studentId: string;
  status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED';
  enrollmentDate: string;
  completionDate?: string;
  progress: {
    percentage: number;
    completedModules: string[];
    currentModule?: string;
    timeSpent: number;
  };
  programme: {
    id: string;
    title: string;
    description: string;
    duration: number;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    category: string;
  };
  certificates?: Certificate[];
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuedDate: string;
  certificateUrl: string;
  credentialId: string;
}

export interface Activity {
  id: string;
  type: 'LESSON_COMPLETED' | 'MODULE_COMPLETED' | 'QUIZ_TAKEN' | 'ASSIGNMENT_SUBMITTED';
  title: string;
  description: string;
  timestamp: string;
  programmeId?: string;
  moduleId?: string;
  points?: number;
}

export interface Notification {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Deadline {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  type: 'ASSIGNMENT' | 'QUIZ' | 'PROJECT' | 'EXAM';
  programmeId: string;
  moduleId?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Progress {
  enrollmentId: string;
  moduleId: string;
  percentage: number;
  timeSpent: number;
  lastAccessedAt: string;
  completedLessons: string[];
  currentLesson?: string;
}

export interface Streak {
  type: 'LOGIN' | 'LEARNING' | 'COMPLETION';
  current: number;
  longest: number;
  lastUpdated: string;
}

export interface ProgressOverTime {
  date: string;
  progress: number;
  timeSpent: number;
  activitiesCompleted: number;
}

export interface CategoryProgress {
  category: string;
  progress: number;
  totalCourses: number;
  completedCourses: number;
  timeSpent: number;
}



// User API
export const userAPI = {
  // Get all users (Admin only)
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> => {
    const response = await api.get('/user', { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/user/${id}`);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, data: UserUpdateData): Promise<ApiResponse<User>> => {
    const response = await api.put(`/user/${id}`, data);
    return response.data;
  },

  // Delete user (Admin only)
  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/user/${id}`);
    return response.data;
  },

  // Create user (Admin only)
  createUser: async (userData: {
    username: string;
    email: string;
    password: string;
    role?: 'admin' | 'user' | 'student' | 'visitor';
    firstName?: string;
    lastName?: string;
    enrollmentStatus?: 'active' | 'inactive' | 'suspended';
  }): Promise<ApiResponse<User>> => {
    const response = await api.post('/user', userData);
    return response.data;
  },

  // Update enrollment status (Admin only)
  updateEnrollmentStatus: async (id: string, status: 'active' | 'inactive' | 'suspended'): Promise<ApiResponse<User>> => {
    const response = await api.patch(`/user/${id}/enrollment-status`, { enrollmentStatus: status });
    return response.data;
  },

  // Get user statistics (Admin only)
  getUserStats: async (): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    byRole: Array<{ _id: string; count: number }>;
    recentRegistrations: number;
  }>> => {
    const response = await api.get('/user/stats');
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.post('/user/change-password', { currentPassword, newPassword });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  // Get user's enrolled courses
  getUserCourses: () =>
    api.get<ApiResponse<UserCoursesResponse>>('/user/courses').then(res => res.data),
  
  // Get user's learning statistics
  getUserLearningStats: () =>
    api.get<ApiResponse<UserLearningStatsResponse>>('/user/learning-stats').then(res => res.data),
};



// Progress API endpoints
export const progressApi = {
  // Get dashboard data for a student
  getDashboardData: async (studentId: string): Promise<ApiResponse<{
    courses: Array<{
      courseId: string;
      title: string;
      progress: number;
      status: 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED';
      category: string;
      enrollmentDate?: string;
    }>;
    metrics: {
      enrolledCoursesCount: number;
      completedCoursesCount: number;
      overallProgress: number;
      totalStudyTimeHours: number;
      currentStreak: number;
      longestStreak: number;
      totalQuizzes: number;
      averageQuizScore: number;
    };
    upcomingDeadlines: Array<{
      courseTitle: string;
      expectedDate: string;
      daysLeft: number;
    }>;
    recentActivity: Array<{
      completedAt: string;
      timeSpent?: number;
      courseTitle?: string;
      lessonTitle?: string;
    }>;
  }>> => {
    const response = await api.get(`/progress/dashboard/${studentId}`);
    return response.data;
  },

  // Get smart progress for a course
  getSmartProgress: async (courseId: string): Promise<ApiResponse<{
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
  }>> => {
    const response = await api.get(`/progress/smart/${courseId}`);
    return response.data;
  },

  // Get course progress details
  getCourseProgress: async (studentId: string, programmeId: string): Promise<ApiResponse<CourseProgressResponse>> => {
    const response = await api.get(`/progress/course/${studentId}/${programmeId}`);
    return response.data;
  },

  // Mark lesson as complete
  markLessonComplete: async (data: {
    studentId: string;
    programmeId: string;
    moduleId: string;
    lessonId: string;
    timeSpent?: number;
  }): Promise<ApiResponse<LessonCompletionResponse>> => {
    const response = await api.post('/progress/lesson/complete', data);
    return response.data;
  },

  // Submit quiz results
  submitQuiz: async (data: {
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
  }): Promise<ApiResponse<QuizSubmissionResponse>> => {
    const response = await api.post('/progress/quiz/submit', data);
    return response.data;
  },

  // Enroll in a program
  enrollInProgram: async (programmeId: string): Promise<ApiResponse<EnrollmentResponse>> => {
    console.log('API service: Making enrollment request');
    console.log('Request URL:', '/student/enroll');
    console.log('Request data:', { programmeId });
    console.log('Full URL:', `${api.defaults.baseURL}/student/enroll`);
    
    const response = await api.post('/student/enroll', { programmeId });
    console.log('API service: Enrollment response received:', response);
    return response.data;
  },

  // Get detailed course progress with new structure
  getCourseProgressDetails: (courseId: string) =>
    api.get(`/progress/course-details/${courseId}`),

  // Mark lesson as completed (new API)
  markLessonAsCompleted: (lessonId: string, data: {
    timeSpent?: number;
    watchTimeVideo?: number;
    notes?: string;
  }) =>
    api.post(`/progress/lesson/${lessonId}/complete`, data),

  // Update lesson progress (new API)
  updateLessonProgressNew: (lessonId: string, data: {
    progressPercentage: number;
    timeSpent?: number;
    watchTimeVideo?: number;
    notes?: string;
  }) =>
    api.put(`/progress/lesson/${lessonId}/progress`, data),

  // Record quiz results (new API)
  recordQuizResultNew: (lessonId: string, data: {
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
  }) =>
    api.post(`/progress/lesson/${lessonId}/quiz`, data),
};

// Error handling utility
export const handleApiError = (error: AxiosError): string => {
  const data = error.response?.data as Partial<ApiResponse> | undefined;
  
  // Check for error message in the nested error object (backend format)
  if (data?.error?.message) {
    return data.error.message;
  }
  
  // Check for direct message property
  if (data?.message) {
    return data.message;
  }
  
  // Check for validation errors array
  if (data?.errors) {
    return data.errors.map((e) => e.message).join(', ');
  }
  
  // Fallback to axios error message
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Progress API Response Interfaces
export interface CourseProgressResponse {
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
  modules: ModuleProgressResponse[];
}

export interface ModuleProgressResponse {
  moduleId: string;
  title: string;
  description: string;
  orderIndex: number;
  progress: {
    completedLessons: number;
    totalLessons: number;
    percentage: number;
    timeSpent: number;
  };
  lessons: LessonProgressResponse[];
}

export interface LessonProgressResponse {
  lessonId: string;
  title: string;
  description: string;
  orderIndex: number;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'INTERACTIVE';
  duration: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercentage: number;
  timeSpent: number;
  lastAccessedAt?: string;
  completedAt?: string;
}

export interface SmartProgressResponse {
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

export interface DashboardResponse {
  courses: CourseOverview[];
  metrics: DashboardMetrics;
  upcomingDeadlines: UpcomingDeadline[];
  recentActivity: RecentActivity[];
}

export interface CourseOverview {
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

export interface LessonCompletionResponse {
  success: boolean;
  message: string;
  progress: {
    lessonId: string;
    completed: boolean;
    timeSpent: number;
    completedAt: string;
  };
}

export interface QuizSubmissionResponse {
  success: boolean;
  message: string;
  result: {
    quizId: string;
    score: number;
    maxScore: number;
    passed: boolean;
    timeSpent: number;
    submittedAt: string;
  };
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  enrollment: {
    id: string;
    programmeId: string;
    studentId: string;
    status: string;
    enrollmentDate: string;
  };
}

// Course API Response Interfaces
export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number;
  durationDays?: number;
  instructor?: string;
  thumbnail?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleResponse {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  programmeId: string;
  lessons: LessonResponse[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LessonResponse {
  id: string;
  title: string;
  description: string;
  content?: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'INTERACTIVE';
  duration: number;
  orderIndex: number;
  moduleId: string;
  videoUrl?: string;
  resources?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressUpdateResponse {
  success: boolean;
  message: string;
  progress: {
    lessonId: string;
    progressPercentage: number;
    timeSpent: number;
    updatedAt: string;
  };
}

// Course Content API
export const courseContentAPI = {
  // Get all courses
  getAllCourses: () => api.get<ApiResponse<CourseResponse[]>>('/courses').then(res => res.data),
  
  // Get course details
  getCourseDetails: (courseId: string) => api.get<ApiResponse<CourseResponse>>(`/courses/${courseId}`).then(res => res.data),
  
  // Get modules for a course
  getModulesForCourse: (courseId: string) => api.get<ApiResponse<ModuleResponse[]>>(`/courses/${courseId}/modules`).then(res => res.data),
  
  // Get lessons for a module
  getLessonsForModule: (courseId: string, moduleId: string) => 
    api.get<ApiResponse<LessonResponse[]>>(`/courses/${courseId}/modules/${moduleId}/lessons`).then(res => res.data),
  
  // Get lesson details
  getLessonDetails: (lessonId: string) => api.get<ApiResponse<LessonResponse>>(`/lessons/${lessonId}`).then(res => res.data),
  
  // Get lesson content with quiz
  getLessonContent: (lessonId: string, studentId?: string) => 
    api.get<ApiResponse<any>>(`/lessons/${lessonId}/content`, {
      params: { studentId }
    }).then(res => res.data),
  
  // Submit quiz
  submitQuiz: (lessonId: string, data: { studentId: string; answers: any[]; timeSpent: number }) =>
    api.post<ApiResponse<any>>(`/lessons/${lessonId}/quiz`, data).then(res => res.data),
  
  // Get next module
  getNextModule: (programmeId: string, studentId?: string) =>
    api.get<ApiResponse<any>>(`/courses/${programmeId}/next-module`, {
      params: { studentId }
    }).then(res => res.data),
  
  // Get course progress
  getCourseProgress: (courseId: string, studentId?: string) =>
    api.get<ApiResponse<CourseProgressResponse>>(`/progress/course/${studentId}/${courseId}`).then(res => res.data),
};

// Progress API
export const progressAPI = {
  // Get student progress
  getStudentProgress: (studentId: string, programmeId?: string) =>
    api.get<ApiResponse<any>>(`/progress/student/${studentId}`, {
      params: { programmeId }
    }).then(res => res.data),
  
  // Get course progress
  getCourseProgress: (studentId: string, programmeId: string) =>
    api.get<ApiResponse<any>>(`/progress/course/${studentId}/${programmeId}`).then(res => res.data),
  
  // Mark lesson as completed
  markLessonCompleted: (lessonId: string, data: { timeSpent: number; watchTimeVideo?: number; notes?: string }) =>
    api.post<ApiResponse<LessonCompletionResponse>>(`/progress/lesson/${lessonId}/complete`, data).then(res => res.data),
  
  // Update lesson progress
  updateLessonProgress: (lessonId: string, data: { progressPercentage: number; timeSpent: number; watchTimeVideo?: number; notes?: string }) =>
    api.put<ApiResponse<ProgressUpdateResponse>>(`/progress/lesson/${lessonId}/progress`, data).then(res => res.data),
  
  // Record quiz result
  recordQuizResult: (lessonId: string, data: { quizId: string; score: number; maxScore: number; passingScore: number; timeSpent: number; answers: any[]; feedback?: string }) =>
    api.post<ApiResponse<QuizSubmissionResponse>>(`/progress/lesson/${lessonId}/quiz`, data).then(res => res.data),
  
  // Get quiz results
  getQuizResults: (studentId: string, lessonId: string) =>
    api.get<ApiResponse<any>>(`/progress/quiz/${studentId}/${lessonId}`).then(res => res.data),
  
  // Get progress dashboard
  getProgressDashboard: (studentId: string) =>
    api.get<ApiResponse<DashboardResponse>>(`/progress/dashboard/${studentId}`).then(res => res.data),
  
  // Get smart progress
  getSmartProgress: (courseId: string) =>
    api.get<ApiResponse<SmartProgressResponse>>(`/progress/smart/${courseId}`).then(res => res.data),

  // Get general progress overview
  getGeneralProgress: () =>
    api.get<ApiResponse<GeneralProgressResponse>>('/progress').then(res => res.data),
};



// Student API
export const studentAPI = {
  // Get student dashboard
  getStudentDashboard: () => api.get<ApiResponse<any>>('/student/dashboard').then(res => res.data),
  
  // Get student profile
  getStudentProfile: () => api.get<ApiResponse<StudentProfile>>('/student/profile').then(res => res.data),
  
  // Update student profile
  updateStudentProfile: (data: Partial<StudentProfile>) =>
    api.put<ApiResponse<StudentProfile>>('/student/profile', data).then(res => res.data),
  
  // Upload profile photo
  uploadProfilePhoto: (file: File) => {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    return api.post<ApiResponse<any>>('/student/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  
  // Delete profile photo
  deleteProfilePhoto: () => api.delete<ApiResponse<any>>('/student/profile/photo').then(res => res.data),
  
  // Get profile photo URL
  getProfilePhotoUrl: () => api.get<ApiResponse<any>>('/student/profile/photo-url').then(res => res.data),
  
  // Get student enrollments
  getStudentEnrollments: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<any>>('/student/enrollments', { params }).then(res => res.data),
  
  // Get enrollment details
  getEnrollmentDetails: (enrollmentId: string) =>
    api.get<ApiResponse<any>>(`/student/enrollments/${enrollmentId}`).then(res => res.data),
  
  // Get enrolled programs
  getEnrolledPrograms: (params?: { status?: string; category?: string; search?: string }) =>
    api.get<ApiResponse<any>>('/student/enrolled-programs', { params }).then(res => res.data),
  
  // Update learning activity
  updateLearningActivity: (data: { enrollmentId: string; moduleId?: string; lessonId?: string; timeSpent?: number }) =>
    api.post<ApiResponse<any>>('/student/activity', data).then(res => res.data),
  
  // Get student analytics
  getStudentAnalytics: () => api.get<ApiResponse<any>>('/student/analytics').then(res => res.data),
  
  // Enroll in program
  enrollInProgram: (programmeId: string) =>
    api.post<ApiResponse<EnrollmentResponse>>('/student/enroll', { programmeId }).then(res => res.data),
  
  // Mark lesson as completed
  markLessonCompleted: (data: {
    enrollmentId: string;
    moduleId?: string;
    lessonId: string;
    timeSpent?: number;
  }) =>
    api.post<ApiResponse<any>>('/student/lesson/complete', data).then(res => res.data),
  
  // Update lesson progress
  updateLessonProgress: (data: {
    enrollmentId: string;
    lessonId: string;
    progressPercentage: number;
    timeSpent?: number;
  }) =>
    api.put<ApiResponse<any>>('/student/lesson/progress', data).then(res => res.data),
  
  // Update enrollment status
  updateEnrollmentStatus: (enrollmentId: string, status: 'ACTIVE' | 'COMPLETED' | 'PAUSED') =>
    api.put<ApiResponse<any>>(`/student/enrollment/${enrollmentId}/status`, { status }).then(res => res.data),


};

// Type definitions for new endpoints
export interface GeneralProgressResponse {
  userId: string;
  overview: {
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    overallProgress: number;
    totalLessonsCompleted: number;
    totalTimeSpent: number;
    totalQuizzesTaken: number;
    averageQuizScore: number;
  };
  recentActivity: {
    lessonsCompleted: number;
    quizzesTaken: number;
    timeSpent: number;
  };
  courses: Array<{
    courseId: string;
    title: string;
    category: string;
    status: string;
    progress: number;
    enrollmentDate: string;
    lastActivity: string;
  }>;
}

export interface UserCoursesResponse {
  userId: string;
  totalCourses: number;
  courses: Array<{
    enrollmentId: string;
    courseId: string;
    title: string;
    description: string;
    category: string;
    level: string;
    totalLessons: number;
    estimatedDuration: number;
    price: number;
    currency: string;
    imageUrl?: string;
    enrollmentDate: string;
    status: string;
    progress: {
      totalProgress: number;
      completedLessons: number;
      timeSpent: number;
      lastActivityDate: string;
    };
    completionDate?: string;
    certificateIssued: boolean;
  }>;
}

export interface UserLearningStatsResponse {
  userId: string;
  overview: {
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    overallProgress: number;
    totalLessonsCompleted: number;
    totalTimeSpent: number;
    studyStreak: number;
  };
  performance: {
    totalQuizzesTaken: number;
    averageQuizScore: number;
    highestQuizScore: number;
    quizSuccessRate: number;
    averageTimePerLesson: number;
  };
  recentActivity: {
    last7Days: Array<{
      _id: string;
      lessonsCompleted: number;
      timeSpent: number;
    }>;
    last30DaysTimeSpent: number;
  };
  categoryPerformance: Array<{
    _id: string;
    averageProgress: number;
    totalCourses: number;
    totalTimeSpent: number;
  }>;
  weeklyProgress: Array<{
    _id: number;
    lessonsCompleted: number;
    timeSpent: number;
  }>;
  timeBreakdown: {
    totalStudyTime: number;
    recentStudyTime: number;
    averageDailyStudyTime: number;
  };
}

// Auth API
export const authAPI = {
  // Register
  register: (data: RegisterData) => api.post<ApiResponse<User>>('/auth/register', data).then(res => res.data),
  
  // Login
  login: (data: LoginCredentials) => api.post<ApiResponse<User>>('/auth/login', data).then(res => res.data),
  
  // Logout
  logout: () => api.post<ApiResponse<any>>('/auth/logout').then(res => res.data),
  
  // Refresh token
  refreshToken: () => api.post<ApiResponse<any>>('/auth/refresh').then(res => res.data),
  
  // Get current user
  getCurrentUser: () => api.get<ApiResponse<User>>('/auth/me').then(res => res.data),
  
  // Forgot password
  forgotPassword: (email: string) => api.post<ApiResponse<any>>('/auth/forgot-password', { email }).then(res => res.data),
  
  // Validate reset token
  validateResetToken: (token: string) => api.post<ApiResponse<any>>('/auth/reset-password/validate', { token }).then(res => res.data),
  
  // Reset password
  resetPassword: (token: string, password: string) => 
    api.post<ApiResponse<any>>('/auth/reset-password', { token, password }).then(res => res.data),
  
  // Resend email verification
  resendEmailVerification: (email: string) => 
    api.post<ApiResponse<any>>('/auth/resend-verification', { email }).then(res => res.data),
  
  // Verify email
  verifyEmail: (token: string) => api.post<ApiResponse<any>>('/auth/verify-email', { token }).then(res => res.data),
};

// Analytics API
export const analyticsAPI = {
  // Get analytics overview
  getAnalyticsOverview: () => api.get<ApiResponse<any>>('/analytics/overview').then(res => res.data),
  
  // Get progress history
  getProgressHistory: (params?: { startDate?: string; endDate?: string; programmeId?: string }) =>
    api.get<ApiResponse<any>>('/analytics/progress-history', { params }).then(res => res.data),
  
  // Get category performance
  getCategoryPerformance: () => api.get<ApiResponse<any>>('/analytics/category-performance').then(res => res.data),
  
  // Get streaks and achievements
  getStreaksAndAchievements: () => api.get<ApiResponse<any>>('/analytics/streaks-achievements').then(res => res.data),
};

// Integration API
export const integrationAPI = {
  // Get user integrations
  getUserIntegrations: () => api.get<ApiResponse<any>>('/integrations').then(res => res.data),
  
  // Create or update integration
  createOrUpdateIntegration: (data: { type: string; config: any }) =>
    api.post<ApiResponse<any>>('/integrations', data).then(res => res.data),
  
  // Test integration
  testIntegration: (integrationId: string) =>
    api.post<ApiResponse<any>>(`/integrations/${integrationId}/test`).then(res => res.data),
  
  // Delete integration
  deleteIntegration: (integrationId: string) =>
    api.delete<ApiResponse<any>>(`/integrations/${integrationId}`).then(res => res.data),
  
  // Send test notification
  sendTestNotification: (integrationId: string) =>
    api.post<ApiResponse<any>>(`/integrations/${integrationId}/test-notification`).then(res => res.data),
};

export default api;