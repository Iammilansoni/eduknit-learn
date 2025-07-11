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

// Missing interfaces that were referenced but not defined
export interface UserCoursesResponse {
  enrolledCourses: Array<{
    id: string;
    title: string;
    description: string;
    progress: number;
    status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';
    enrollmentDate: string;
    completionDate?: string;
    category: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  }>;
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
}

export interface UserLearningStatsResponse {
  totalStudyTime: number; // in minutes
  coursesCompleted: number;
  coursesInProgress: number;
  averageProgress: number;
  currentStreak: number;
  longestStreak: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  recentActivity: Array<{
    type: 'LESSON_COMPLETED' | 'QUIZ_TAKEN' | 'MODULE_COMPLETED';
    title: string;
    date: string;
    points?: number;
  }>;
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

// Lesson Content Response Interface
export interface LessonContentResponse {
  _id: string;
  title: string;
  description: string;
  content?: {
    text?: string;
    videoUrl?: string;
    videoThumbnail?: string;
    resources?: Array<{
      title: string;
      url: string;
      type: 'PDF' | 'LINK' | 'VIDEO' | 'IMAGE';
    }>;
    quiz?: QuizContent;
  };
  type: 'VIDEO' | 'TEXT' | 'INTERACTIVE' | 'ASSESSMENT';
  estimatedDuration?: number;
  moduleId: string;
  programmeId: string;
  order: number;
  isActive: boolean;
  progress?: {
    completed: boolean;
    timeSpent: number;
    lastAccessed: string;
    progressPercentage: number;
    bookmarked: boolean;
    notes?: string;
  };
  quiz?: QuizData;
}

// Quiz Content Interface
export interface QuizContent {
  timeLimit?: number;
  passingScore?: number;
  questions: QuizQuestion[];
}

// Quiz Data Interface
export interface QuizData {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
  totalQuestions: number;
  questions: QuizQuestion[];
}

// Quiz Question Interface
export interface QuizQuestion {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  points: number;
}

// Quiz Answer Interface
export interface QuizAnswer {
  questionId: string;
  answer: string | number | boolean | string[];
  isCorrect?: boolean;
  pointsAwarded?: number;
}

// Quiz Submission Interface
export interface QuizSubmissionData {
  studentId: string;
  answers: QuizAnswer[];
  timeSpent: number;
}

// Next Module Response Interface
export interface NextModuleResponse {
  nextModule?: {
    moduleId: string;
    title: string;
    description: string;
    orderIndex: number;
    estimatedDuration?: number;
  };
  nextLesson?: {
    lessonId: string;
    title: string;
    description: string;
    moduleId: string;
    orderIndex: number;
    type: 'VIDEO' | 'TEXT' | 'INTERACTIVE' | 'ASSESSMENT';
  };
  completionStatus: {
    currentModule: string;
    completedModules: string[];
    totalModules: number;
    overallProgress: number;
  };
}

// Progress Update Data Interface
export interface ProgressUpdateData {
  studentId: string;
  timeSpent?: number;
  progressPercentage?: number;
  notes?: string;
  bookmarked?: boolean;
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
  getUserCourses: async (): Promise<ApiResponse<UserCoursesResponse>> => {
    const response = await api.get('/user/courses');
    return response.data;
  },
  
  // Get user's learning statistics
  getUserLearningStats: async (): Promise<ApiResponse<UserLearningStatsResponse>> => {
    const response = await api.get('/user/learning-stats');
    return response.data;
  },
};

// Progress API endpoints
export const progressApi = {
  // Get dashboard data for a student
  getDashboardData: async (studentId: string): Promise<ApiResponse<DashboardResponse>> => {
    const response = await api.get(`/progress/dashboard/${studentId}`);
    return response.data;
  },

  // Get smart progress for a course
  getSmartProgress: async (courseId: string): Promise<ApiResponse<SmartProgressResponse>> => {
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
  getCourseProgressDetails: async (courseId: string): Promise<ApiResponse<CourseProgressResponse>> => {
    const response = await api.get(`/progress/course-details/${courseId}`);
    return response.data;
  },

  // Mark lesson as completed (new API)
  markLessonAsCompleted: async (lessonId: string, data: {
    timeSpent?: number;
    watchTimeVideo?: number;
    notes?: string;
  }): Promise<ApiResponse<LessonCompletionResponse>> => {
    const response = await api.post(`/progress/lesson/${lessonId}/complete`, data);
    return response.data;
  },

  // Update lesson progress (new API)
  updateLessonProgressNew: async (lessonId: string, data: {
    progressPercentage: number;
    timeSpent?: number;
    watchTimeVideo?: number;
    notes?: string;
  }): Promise<ApiResponse<ProgressUpdateData>> => {
    const response = await api.put(`/progress/lesson/${lessonId}/progress`, data);
    return response.data;
  },

  // Record quiz results (new API)
  recordQuizResultNew: async (lessonId: string, data: {
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
  }): Promise<ApiResponse<QuizSubmissionResponse>> => {
    const response = await api.post(`/progress/lesson/${lessonId}/quiz`, data);
    return response.data;
  },
};

// Lesson Content API
export const lessonContentApi = {
  // Get lesson content by lesson ID
  getLessonContent: async (lessonId: string): Promise<ApiResponse<LessonContentResponse>> => {
    const response = await api.get(`/course-content/lesson-content/${lessonId}`);
    return response.data;
  },

  // Get progress for a specific course/programme
  getCourseProgress: async (programmeId: string): Promise<ApiResponse<CourseProgressResponse>> => {
    const response = await api.get(`/course-content/progress/${programmeId}`);
    return response.data;
  },

  // Get next module in a course
  getNextModule: async (programmeId: string): Promise<ApiResponse<NextModuleResponse>> => {
    const response = await api.get(`/course-content/next-module/${programmeId}`);
    return response.data;
  },

  // Get modules for a course
  getModulesForCourse: async (programmeId: string, studentId?: string): Promise<ApiResponse<ModuleProgressResponse[]>> => {
    const params = studentId ? { studentId } : {};
    const response = await api.get(`/course-content/modules/${programmeId}`, { params });
    return response.data;
  },
};

// Course API
export const courseApi = {
  // Get all courses
  getAllCourses: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    level?: string;
  }): Promise<ApiResponse<{
    courses: CourseResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  // Get course by ID
  getCourseById: async (id: string): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // Get course mapping
  getCourseMapping: async (): Promise<ApiResponse<Array<{
    _id: string;
    title: string;
    slug: string;
    isActive: boolean;
  }>>> => {
    const response = await api.get('/courses/mapping');
    return response.data;
  },
};

// Auth API
export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register
  register: async (userData: RegisterData): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Refresh token
  refreshToken: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
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

// Export default api instance
export default api;
