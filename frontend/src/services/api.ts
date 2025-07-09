import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

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
          // Refresh failed, clear user data and redirect to login only if not on public page
          localStorage.removeItem('user');
          if (!isPublicPage) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }
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
    socialMedia?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
      portfolio?: string;
    };
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

// Auth API
export const authAPI = {
  // Register new user
  register: async (data: RegisterData): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Validate reset token
  validateResetToken: async (token: string): Promise<ApiResponse<{ email: string }>> => {
    const response = await api.get(`/auth/reset-password?token=${token}`);
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Resend verification email
  resendVerificationEmail: async (email: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },
};

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
};

// Student API
export const studentAPI = {
  // Get student dashboard data
  getDashboard: async (): Promise<ApiResponse<{
    student: User & { profile?: StudentProfile };
    stats: {
      totalCourses: number;
      completedCourses: number;
      inProgressCourses: number;
      averageProgress: number;
      totalTimeSpent: number;
      certificatesEarned: number;
    };
    activeEnrollments: Enrollment[];
    recentActivity: Activity[];
    upcomingDeadlines: Deadline[];
    notifications: Notification[];
  }>> => {
    const response = await api.get('/student/dashboard');
    return response.data;
  },

  // Get student profile
  getProfile: async (): Promise<ApiResponse<{
    user: User;
    profile: StudentProfile;
    completeness: number;
  }>> => {
    const response = await api.get('/student/profile');
    return response.data;
  },

  // Update student profile
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    contactInfo?: {
      phoneNumber?: string;
      alternateEmail?: string;
      socialMedia?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
        portfolio?: string;
      };
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
  }): Promise<ApiResponse<{
    user: User;
    profile: StudentProfile;
    completeness: number;
  }>> => {
    const response = await api.put('/student/profile', data);
    return response.data;
  },

  // Upload profile photo
  uploadProfilePhoto: async (file: File): Promise<ApiResponse<{
    profilePhoto: {
      url: string;
      filename: string;
      uploadDate: string;
      size: number;
      mimeType: string;
    };
    completeness: number;
  }>> => {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    
    const response = await api.post('/student/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete profile photo
  deleteProfilePhoto: async (): Promise<ApiResponse<{
    completeness: number;
    gravatarUrl?: string;
  }>> => {
    const response = await api.delete('/student/profile/photo');
    return response.data;
  },

  // Get profile photo URL
  getProfilePhotoUrl: async (): Promise<ApiResponse<{
    profilePhotoUrl: string;
    source: 'custom' | 'gravatar' | 'initials';
    isCustom: boolean;
    isGravatar: boolean;
    isInitials: boolean;
    hasCustomPhoto: boolean;
  }>> => {
    const response = await api.get('/student/profile/photo-url');
    return response.data;
  },

  // Get student enrollments
  getEnrollments: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    enrollments: Enrollment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> => {
    const response = await api.get('/student/enrollments', { params });
    return response.data;
  },

  // Get enrollment details
  getEnrollmentDetails: async (enrollmentId: string): Promise<ApiResponse<Enrollment>> => {
    const response = await api.get(`/student/enrollments/${enrollmentId}`);
    return response.data;
  },

  // Get enrolled programs for profile management
  getEnrolledPrograms: async (params?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<ApiResponse<{
    enrolledPrograms: {
      id: string;
      programme: {
        id: string;
        title: string;
        description: string;
        duration: string;
        level: string;
        category: string;
        skills: string[];
        tags: string[];
        instructor?: {
          firstName: string;
          lastName: string;
          email: string;
          profilePicture?: string;
        };
        totalModules: number;
      };
      enrollment: {
        status: string;
        enrollmentDate: string;
        completionDate?: string;
        certificateIssued: boolean;
        grade?: string;
      };
      progress: {
        totalProgress: number;
        completedModules: string[];
        completedLessons: string[];
        timeSpent: number;
        lastActivityDate?: string;
        streak: number;
      };
      achievements: {
        id: string;
        title: string;
        description: string;
        earnedDate: string;
        type: string;
      }[];
    }[];
    statistics: {
      total: number;
      active: number;
      completed: number;
      paused: number;
      averageProgress: number;
      totalTimeSpent: number;
      categories: string[];
    };
  }>> => {
    const response = await api.get('/student/enrolled-programs', { params });
    return response.data;
  },

  // Update learning activity
  updateLearningActivity: async (data: {
    enrollmentId: string;
    moduleId?: string;
    lessonId?: string;
    timeSpent?: number;
  }): Promise<ApiResponse<{
    progress: Progress;
    streak: Streak;
  }>> => {
    const response = await api.post('/student/activity', data);
    return response.data;
  },

  // Get student analytics
  getAnalytics: async (): Promise<ApiResponse<{
    overview: {
      totalEnrollments: number;
      completedCourses: number;
      activeEnrollments: number;
      certificatesEarned: number;
      totalTimeSpent: number;
      averageProgress: number;
    };
    gamification: {
      totalPoints: number;
      level: number;
      badges: Badge[];
      streaks: {
        currentLoginStreak: number;
        longestLoginStreak: number;
        currentLearningStreak: number;
        longestLearningStreak: number;
      };
    };
    progressOverTime: ProgressOverTime[];
    categoryProgress: CategoryProgress[];
    profileCompleteness: number;
  }>> => {
    const response = await api.get('/student/analytics');
    return response.data;
  },
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
    const response = await api.post('/student/enroll', { programmeId });
    return response.data;
  },
};

// Course Content API endpoints
export const courseApi = {
  // Get all available courses
  getAllCourses: async (): Promise<ApiResponse<CourseResponse[]>> => {
    const response = await api.get('/courses');
    return response.data;
  },

  // Get course details
  getCourseDetails: async (programmeId: string): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.get(`/courses/${programmeId}`);
    return response.data;
  },

  // Get modules for a course
  getModulesForCourse: async (programmeId: string): Promise<ApiResponse<ModuleResponse[]>> => {
    const response = await api.get(`/courses/${programmeId}/modules`);
    return response.data;
  },

  // Get lessons for a module
  getLessonsForModule: async (moduleId: string): Promise<ApiResponse<LessonResponse[]>> => {
    const response = await api.get(`/modules/${moduleId}/lessons`);
    return response.data;
  },

  // Get lesson details
  getLessonDetails: async (lessonId: string): Promise<ApiResponse<LessonResponse>> => {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data;
  },

  // Get my enrolled courses
  getMyCourses: async (): Promise<ApiResponse<CourseResponse[]>> => {
    const response = await api.get('/course/my-courses');
    return response.data;
  },

  // Get enrolled course details
  getEnrolledCourseDetail: async (courseId: string): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.get(`/course/my-course/${courseId}`);
    return response.data;
  },

  // Update course progress
  updateCourseProgress: async (data: {
    lessonId: string;
    progressPercentage: number;
    timeSpent: number;
    notes?: string;
  }): Promise<ApiResponse<ProgressUpdateResponse>> => {
    const response = await api.post('/course/progress', data);
    return response.data;
  },
};

// Error handling utility
export const handleApiError = (error: AxiosError): string => {
  const data = error.response?.data as Partial<ApiResponse> | undefined;
  if (data?.message) {
    return data.message;
  }
  if (data?.errors) {
    return data.errors.map((e) => e.message).join(', ');
  }
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

export default api;