// Main API instance
export { default as api } from './api';
export type { 
  ApiResponse, 
  User, 
  UserCoursesResponse, 
  UserLearningStatsResponse,
  CourseProgressResponse,
  LessonContentResponse,
  QuizData,
  QuizQuestion,
  QuizAnswer
} from './api';

// Authentication API
export { authApi, default as authApiDefault } from './authApi';
export type {
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  AuthUser,
  LoginResponse,
  RegisterResponse,
} from './authApi';

// User Management API
export { userApi, default as userApiDefault } from './userApi';
export type {
  UserStats,
  CreateUserData,
  UpdateUserData,
  UsersListResponse,
  UserFilters,
} from './userApi';

// Student API
export { studentApi, default as studentApiDefault } from './studentApi';
export type {
  StudentProfile,
  StudentDashboard,
  Enrollment,
  StudentAnalytics,
  LearningActivity,
  EnrolledProgram,
} from './studentApi';

// Course Content API
export { courseContentApi, default as courseContentApiDefault } from './courseContentApi';
export type {
  Course,
  Module,
  Lesson,
  LessonDetails,
  CourseFilters,
} from './courseContentApi';

// Progress API
export { progressApi, default as progressApiDefault } from './progressApi';
export type {
  ProgressData,
  CourseProgress,
  ModuleProgress,
  LessonProgress,
  NextModuleResponse,
  LearningStatistics,
  QuizResult,
  ProgressDashboard,
} from './progressApi';

// Integration API
export { integrationApi, default as integrationApiDefault } from './integrationApi';
export type {
  DiscordUpdate,
  DiscordServerInfo,
  Integration,
  CreateIntegrationData,
  TestNotificationData,
} from './integrationApi';

// Privacy API
export { privacyApi, default as privacyApiDefault } from './privacyApi';
export type {
  PrivacySettings,
  DataDeletionRequest,
  AuditLog,
  UserDataExport,
  UpdateVisibilityData,
  UpdateConsentData,
  CreateDeletionRequestData,
  ProcessDeletionRequestData,
} from './privacyApi';

// Health API
export { healthApi, default as healthApiDefault } from './healthApi';
export type {
  HealthStatus,
  DetailedHealthStatus,
} from './healthApi';

// Combined APIs object for easy access
import { authApi } from './authApi';
import { userApi } from './userApi';
import { studentApi } from './studentApi';
import { courseContentApi } from './courseContentApi';
import { progressApi } from './progressApi';
import { integrationApi } from './integrationApi';
import { privacyApi } from './privacyApi';
import { healthApi } from './healthApi';

export const APIs = {
  auth: authApi,
  user: userApi,
  student: studentApi,
  courseContent: courseContentApi,
  progress: progressApi,
  integration: integrationApi,
  privacy: privacyApi,
  health: healthApi,
};

export default APIs;
