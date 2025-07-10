const API_BASE_URL = '/api';

// Use the existing api instance from the main api.ts file
import { api } from './api';

// Types for Course Content API responses
export interface Course {
  id: string;
  title: string;
  description: string;
  overview?: string;
  category: string;
  level: string;
  instructor: string;
  duration: string;
  timeframe: string;
  skills: string[];
  prerequisites: string[];
  imageUrl?: string;
  price: number;
  currency: string;
  certificateAwarded: boolean;
  modulesCount?: number;
  lessonsCount?: number;
  totalLessons: number;
  totalModules: number;
  estimatedDuration: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Module {
  _id: string;
  title: string;
  description: string;
  programmeId: string;
  orderIndex: number;
  estimatedDuration: number;
  totalLessons: number;
  prerequisites: string[];
  dueDate?: string;
  learningObjectives: string[];
  isActive: boolean;
  progress?: {
    completedLessons: number;
    totalLessons: number;
    progressPercentage: number;
    isCompleted: boolean;
    isStarted: boolean;
  };
  actualLessonsCount?: number;
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'interactive';
  moduleId: string;
  programmeId: string;
  orderIndex: number;
  estimatedDuration: number;
  content: any;
  learningObjectives: string[];
  resources: {
    type: string;
    title: string;
    url: string;
  }[];
  isRequired: boolean;
  isActive: boolean;
  progress?: {
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

export interface LessonDetails {
  lesson: {
    id: string;
    title: string;
    description: string;
    type: string;
    estimatedDuration: number;
    content: any;
    learningObjectives: string[];
    resources: any[];
    isRequired: boolean;
    orderIndex: number;
    module: any;
    programme: any;
  };
  navigation: {
    previousLesson: { _id: string; title: string; orderIndex: number } | null;
    nextLesson: { _id: string; title: string; orderIndex: number } | null;
    currentPosition: number;
    totalLessons: number;
  };
  stats: {
    averageCompletionTime: number;
    totalCompletions: number;
    averageAttempts: number;
  };
  studentProgress?: {
    status: string;
    progressPercentage: number;
    timeSpent: number;
    lastAccessedAt?: string;
    completedAt?: string;
    bookmarked: boolean;
    notes: string;
    attempts: number;
    watchTimeVideo?: number;
  } | null;
}

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
  modules: Array<{
    id: string;
    title: string;
    description: string;
    orderIndex: number;
    estimatedDuration: number;
    lessons: Array<{
      id: string;
      title: string;
      description: string;
      type: string;
      duration: number;
      orderIndex: number;
      status: string;
      progressPercentage: number;
      timeSpent: number;
    }>;
    progress: {
      completedLessons: number;
      totalLessons: number;
      percentage: number;
    };
  }>;
}

export interface CourseFilters {
  category?: string;
  level?: string;
  search?: string;
}

// Course Content API functions
export const courseContentApi = {
  // Get all courses with optional filtering
  async getAllCourses(filters?: CourseFilters): Promise<{
    data: Course[];
    total: number;
  }> {
    try {
      const response = await api.get('/courses', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get detailed course information
  async getCourseDetails(programmeId: string): Promise<Course> {
    try {
      const response = await api.get(`/courses/${programmeId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching course details:', error);
      throw error;
    }
  },

  // Get modules for a course with optional student progress
  async getModulesForCourse(
    programmeId: string, 
    studentId?: string
  ): Promise<Module[]> {
    try {
      const params = studentId ? { studentId } : {};
      const response = await api.get(`/course-content/modules/${programmeId}`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  },

  // Get lessons for a module with optional student progress
  async getLessonsForModule(
    moduleId: string, 
    studentId?: string
  ): Promise<Lesson[]> {
    try {
      const params = studentId ? { studentId } : {};
      const response = await api.get(`/course-content/lessons/${moduleId}`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  },

  // Get detailed lesson information
  async getLessonDetails(
    lessonId: string, 
    studentId?: string
  ): Promise<LessonDetails> {
    try {
      const params = studentId ? { studentId } : {};
      const response = await api.get(`/course-content/lesson/${lessonId}`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching lesson details:', error);
      throw error;
    }
  },

  // Get lesson content
  async getLessonContent(
    lessonId: string, 
    studentId?: string
  ): Promise<any> {
    try {
      const params = studentId ? { studentId } : {};
      const response = await api.get(`/course-content/lesson-content/${lessonId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching lesson content:', error);
      throw error;
    }
  },

  // Update lesson progress
  async updateLessonProgress(
    lessonId: string,
    data: {
      studentId: string;
      timeSpent: number;
      progressPercentage: number;
      notes?: string;
      bookmarked?: boolean;
    }
  ): Promise<any> {
    try {
      const response = await api.put(`/course-content/lesson-progress/${lessonId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      throw error;
    }
  },

  // Submit quiz
  async submitQuiz(
    lessonId: string,
    data: {
      studentId: string;
      answers: Array<{
        questionId: string;
        answer: string;
      }>;
      timeSpent: number;
    }
  ): Promise<any> {
    try {
      const response = await api.post(`/course-content/quiz/${lessonId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  },

  // Get next module recommendation
  async getNextModule(
    programmeId: string, 
    studentId?: string
  ): Promise<any> {
    try {
      const params = studentId ? { studentId } : {};
      const response = await api.get(`/course-content/next-module/${programmeId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching next module:', error);
      throw error;
    }
  },

  // Get course progress
  async getCourseProgress(
    programmeId: string, 
    studentId?: string
  ): Promise<CourseProgressResponse> {
    try {
      const params = studentId ? { studentId } : {};
      const response = await api.get(`/course-content/progress/${programmeId}`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      throw error;
    }
  },

  // Search courses
  async searchCourses(query: string): Promise<{
    data: Course[];
    total: number;
  }> {
    try {
      return await this.getAllCourses({ search: query });
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  },

  // Get courses by category
  async getCoursesByCategory(category: string): Promise<{
    data: Course[];
    total: number;
  }> {
    try {
      return await this.getAllCourses({ category });
    } catch (error) {
      console.error('Error fetching courses by category:', error);
      throw error;
    }
  },

  // Get courses by level
  async getCoursesByLevel(level: string): Promise<{
    data: Course[];
    total: number;
  }> {
    try {
      return await this.getAllCourses({ level });
    } catch (error) {
      console.error('Error fetching courses by level:', error);
      throw error;
    }
  },
};

export default courseContentApi;
