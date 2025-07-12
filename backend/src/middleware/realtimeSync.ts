import { Request, Response, NextFunction } from 'express';
import RealtimeSyncService from '../services/realtimeSyncService';
import logger from '../config/logger';

/**
 * Middleware to automatically sync lesson completion data
 */
export const autoSyncLessonCompletion = async (req: Request, res: Response, next: NextFunction) => {
  // Store original response.json to intercept successful responses
  const originalJson = res.json;
  
  res.json = function(data: any) {
    // Check if this is a successful lesson completion
    if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
      // Extract data from request body for lesson completion
      const { userId, studentId, courseId, lessonId, moduleId, timeSpent } = req.body;
      const user = (req as any).user;
      
      const actualStudentId = studentId || userId || user?.id;
      
      if (actualStudentId && courseId && lessonId && timeSpent) {
        // Perform async sync without blocking the response
        RealtimeSyncService.syncLessonCompletion(
          actualStudentId,
          courseId,
          moduleId || '',
          lessonId,
          timeSpent || 0
        ).catch(error => {
          logger.error('Auto-sync lesson completion failed:', error);
        });
      }
    }
    
    // Call original json method
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Middleware to automatically sync quiz completion data
 */
export const autoSyncQuizCompletion = async (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    // Check if this is a successful quiz completion
    if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
      const { studentId, courseId, lessonId, score, maxScore, timeSpent, isPassed } = req.body;
      const user = (req as any).user;
      
      const actualStudentId = studentId || user?.id;
      
      if (actualStudentId && courseId && lessonId && score !== undefined && maxScore !== undefined) {
        // Perform async sync without blocking the response
        RealtimeSyncService.syncQuizCompletion(
          actualStudentId,
          courseId,
          lessonId,
          {
            score,
            maxScore,
            timeSpent: timeSpent || 0,
            passed: isPassed || false
          }
        ).catch(error => {
          logger.error('Auto-sync quiz completion failed:', error);
        });
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Middleware to automatically sync enrollment statistics
 */
export const autoSyncEnrollmentStats = async (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    // Check if this is a successful enrollment action
    if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
      const { studentId } = req.body;
      const user = (req as any).user;
      
      const actualStudentId = studentId || user?.id;
      
      if (actualStudentId && (req.method === 'POST' || req.method === 'PUT')) {
        // Perform async sync without blocking the response
        RealtimeSyncService.syncEnrollmentStats(actualStudentId).catch(error => {
          logger.error('Auto-sync enrollment stats failed:', error);
        });
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Generic middleware to trigger dashboard refresh
 */
export const triggerDashboardRefresh = (studentIds: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    res.json = function(data: any) {
      // Check if this is a successful response
      if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
        const user = (req as any).user;
        const targetStudentIds = studentIds.length > 0 ? studentIds : [user?.id].filter(Boolean);
        
        // Trigger background refresh for specified students
        targetStudentIds.forEach(studentId => {
          RealtimeSyncService.getRealTimeDashboardData(studentId).catch(error => {
            logger.error(`Dashboard refresh failed for student ${studentId}:`, error);
          });
        });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Batch sync middleware for maintenance operations
 */
export const batchSyncMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.query.batchSync === 'true' && (req as any).user?.role === 'admin') {
    try {
      // Get all student IDs (limit to prevent overload)
      const { default: User } = await import('../models/User');
      const students = await User.find({ role: 'student' }).select('_id').limit(100).lean();
      const studentIds = students.map(s => s._id.toString());
      
      // Perform batch sync in background
      RealtimeSyncService.batchSyncStudents(studentIds).catch(error => {
        logger.error('Batch sync failed:', error);
      });
      
      logger.info(`Initiated batch sync for ${studentIds.length} students`);
    } catch (error) {
      logger.error('Error initiating batch sync:', error);
    }
  }
  
  next();
};
