import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Clock, BookOpen } from 'lucide-react';
import { useSmartProgress } from '@/hooks/useCourseProgress';
import { motion } from 'framer-motion';

interface SmartProgressTrackerProps {
  courseId: string;
  compact?: boolean;
}

export const DeviationStatus: React.FC<{ 
  deviation: number; 
  label: 'Ahead' | 'On Track' | 'Behind';
}> = ({ deviation, label }) => {
  const getStatusColor = () => {
    switch (label) {
      case 'Ahead':
        return 'bg-green-100 text-green-800';
      case 'On Track':
        return 'bg-blue-100 text-blue-800';
      case 'Behind':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (label) {
      case 'Ahead':
        return <TrendingUp size={14} />;
      case 'On Track':
        return <Target size={14} />;
      case 'Behind':
        return <TrendingDown size={14} />;
      default:
        return null;
    }
  };

  return (
    <Badge className={`${getStatusColor()} flex items-center gap-1`}>
      {getIcon()}
      {label} ({deviation > 0 ? '+' : ''}{deviation}%)
    </Badge>
  );
};

export const SmartProgressTracker: React.FC<SmartProgressTrackerProps> = ({ 
  courseId, 
  compact = false 
}) => {
  const { progressData, loading, error } = useSmartProgress(courseId);

  if (loading) {
    return (
      <Card className={compact ? 'h-64' : 'h-80'}>
        <CardContent className="p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !progressData) {
    return (
      <Card className={compact ? 'h-64' : 'h-80'}>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BookOpen className="mx-auto h-8 w-8 mb-2" />
            <p className="text-sm">{error || 'No progress data available'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={compact ? 'h-64' : 'h-80'}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold truncate">
            {progressData.courseName}
          </CardTitle>
          <div className="flex items-center justify-between">
            <DeviationStatus 
              deviation={progressData.deviation} 
              label={progressData.label} 
            />
            <span className="text-sm text-gray-600">
              {progressData.lessonsCompleted}/{progressData.totalLessons} lessons
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Actual Progress</span>
                <span className="text-sm text-gray-600">{Math.round(progressData.actualProgress)}%</span>
              </div>
              <Progress 
                value={progressData.actualProgress} 
                className="h-3"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500">Expected Progress</span>
                <span className="text-sm text-gray-500">{Math.round(progressData.expectedProgress)}%</span>
              </div>
              <Progress 
                value={progressData.expectedProgress} 
                className="h-2 opacity-60"
              />
            </div>
          </div>

          {!compact && (
            <>
              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                    <Clock size={14} />
                    Days Elapsed
                  </div>
                  <div className="text-lg font-semibold">
                    {progressData.daysElapsed}/{progressData.totalCourseDays}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                    <BookOpen size={14} />
                    Completion
                  </div>
                  <div className="text-lg font-semibold">
                    {Math.round((progressData.lessonsCompleted / progressData.totalLessons) * 100)}%
                  </div>
                </div>
              </div>

              {/* Last Activity */}
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500">
                  Last activity: {new Date(progressData.lastActivity).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">
                  Enrolled: {new Date(progressData.enrollmentDate).toLocaleDateString()}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};