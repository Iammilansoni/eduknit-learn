import React, { useState, useEffect, useCallback } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  BookmarkPlus,
  BookmarkCheck,
  NotebookPen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { useProgressTracking } from '@/hooks/useProgressTracking';

interface LessonProgressBarProps {
  lessonId: string;
  lessonTitle: string;
  initialProgress?: number;
  estimatedDuration?: number; // in minutes
  onProgressUpdate?: (progress: number) => void;
  onComplete?: () => void;
  className?: string;
}

const LessonProgressBar: React.FC<LessonProgressBarProps> = ({
  lessonId,
  lessonTitle,
  initialProgress = 0,
  estimatedDuration = 30,
  onProgressUpdate,
  onComplete,
  className = ''
}) => {
  const [progress, setProgress] = useState(initialProgress);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  
  const { markLessonCompleted, updateLessonProgress, loading } = useProgressTracking();

  const handleProgressSave = useCallback(async () => {
    try {
      await updateLessonProgress(lessonId, progress, timeSpent, 0, notes);
      onProgressUpdate?.(progress);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [lessonId, progress, timeSpent, notes, updateLessonProgress, onProgressUpdate]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60); // in minutes
        setTimeSpent(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, startTime]);

  // Auto-save progress every 30 seconds when active
  useEffect(() => {
    let saveInterval: NodeJS.Timeout;
    
    if (isActive && progress > 0 && progress < 100) {
      saveInterval = setInterval(() => {
        handleProgressSave();
      }, 30000); // Save every 30 seconds
    }

    return () => {
      if (saveInterval) {
        clearInterval(saveInterval);
      }
    };
  }, [isActive, progress, handleProgressSave]);

  const handleStart = () => {
    if (!isActive) {
      setIsActive(true);
      setStartTime(new Date());
      
      if (progress === 0) {
        setProgress(5); // Start with 5% when beginning
        onProgressUpdate?.(5);
      }
    }
  };

  const handlePause = () => {
    setIsActive(false);
    if (progress > 0 && progress < 100) {
      handleProgressSave();
    }
  };

  const handleComplete = async () => {
    try {
      setProgress(100);
      setIsActive(false);
      
      await markLessonCompleted(lessonId, timeSpent, 0, notes);
      
      onProgressUpdate?.(100);
      onComplete?.();
      
      toast({
        title: "Lesson Completed! 🎉",
        description: `You've successfully completed "${lessonTitle}"`,
      });
    } catch (error) {
      console.error('Failed to complete lesson:', error);
    }
  };

  const handleManualProgress = (newProgress: number) => {
    setProgress(newProgress);
    
    if (newProgress >= 100) {
      handleComplete();
    } else if (newProgress > 0 && !isActive) {
      // Auto-start timer if manually setting progress > 0
      handleStart();
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you could also save bookmark status to backend
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProgressColor = () => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-gray-400';
  };

  const isCompleted = progress >= 100;

  return (
    <Card className={`${className} ${isActive ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{lessonTitle}</h3>
            <div className="flex items-center gap-2">
              {isCompleted && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
              {isActive && (
                <Badge className="bg-blue-100 text-blue-800 animate-pulse">
                  <Clock className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-3 cursor-pointer" 
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newProgress = (clickX / rect.width) * 100;
                handleManualProgress(Math.max(0, Math.min(100, newProgress)));
              }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isCompleted && (
                <>
                  {!isActive ? (
                    <Button 
                      onClick={handleStart}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      {progress === 0 ? 'Start' : 'Resume'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handlePause}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Pause className="w-4 h-4" />
                      Pause
                    </Button>
                  )}
                  
                  {progress > 0 && progress < 100 && (
                    <Button 
                      onClick={handleComplete}
                      size="sm"
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {loading ? 'Completing...' : 'Mark Complete'}
                    </Button>
                  )}
                </>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleBookmark}
                className={`flex items-center gap-2 ${isBookmarked ? 'text-yellow-600' : 'text-gray-500'}`}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <BookmarkPlus className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center gap-2"
              >
                <NotebookPen className="w-4 h-4" />
                Notes
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(timeSpent)}
              </span>
              {estimatedDuration > 0 && (
                <span>/ {formatTime(estimatedDuration)} estimated</span>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <AnimatePresence>
            {showNotes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-4"
              >
                <label className="block text-sm font-medium mb-2">Your Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes about this lesson..."
                  className="w-full p-2 border rounded-md text-sm resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={handleProgressSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Notes'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Visualization */}
          {progress > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs text-gray-500"
            >
              <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={`progress-dot-${lessonId}-${i}`}
                    className={`w-2 h-2 rounded-full ${
                      i < Math.floor(progress / 10) ? getProgressColor() : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span>{Math.round(progress)}% complete</span>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonProgressBar;
