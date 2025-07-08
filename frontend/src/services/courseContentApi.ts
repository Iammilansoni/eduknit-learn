const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

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

export interface CourseDetails {
  course: Course;
  modules: Module[];
  stats: {
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
  };
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
  async getCourseDetails(programmeId: string): Promise<CourseDetails> {
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
  ): Promise<{ data: Module[] }> {
    try {
      const params = studentId ? { studentId } : {};
      const response = await api.get(`/courses/${programmeId}/modules`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  },

  // Get lessons for a module with optional student progress
  async getLessonsForModule(
    moduleId: string, 
    studentId?: string
  ): Promise<{ data: Lesson[] }> {
    try {
      const params = studentId ? { studentId } : {};
      const response = await api.get(`/modules/${moduleId}/lessons`, { params });
      return response.data;
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
      const response = await api.get(`/lessons/${lessonId}`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching lesson details:', error);
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
