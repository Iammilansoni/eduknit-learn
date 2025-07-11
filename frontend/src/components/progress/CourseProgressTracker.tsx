import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  BookOpen, 
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Video,
  FileText,
  HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { progressApi } from '@/services/progressApi';
import { useProgressTracking } from '@/hooks/useProgressTracking';

interface LessonProgress {
  lesson: {
    id: string;
    title: string;
    description: string;
    duration: string;
    type: 'video' | 'reading' | 'quiz';
    isRequired: boolean;
    estimatedTime: number;
  };
  progress: {
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
    progressPercentage: number;
    timeSpent: number;
    watchTimeVideo?: number;
    startedAt?: string;
    completedAt?: string;
    lastAccessedAt?: string;
    attempts: number;
    bookmarked: boolean;
    notes: string;
  };
  quiz: {
    hasQuiz: boolean;
    bestScore?: number;
    totalAttempts: number;
    passed: boolean;
  };
}

interface ModuleProgress {
  module: {
    id: string;
    title: string;
    description: string;
    order: number;
  };
  progress: {
    progressPercentage: number;
    completedLessons: number;
    totalLessons: number;
    totalTimeSpent: number;
  };
  lessons: LessonProgress[];
}

interface CourseProgressData {
  course: {
    id: string;
    title: string;
    description: string;
    estimatedDuration: number;
  };
  enrollment: {
    enrollmentDate: string;
    daysElapsed: number;
    status: string;
  };
  overview: {
    overallProgress: number;
    completedLessons: number;
    totalLessons: number;
    totalTimeSpent: number;
    expectedProgress: number;
    deviation: number;
    trackingStatus: 'ON_TRACK' | 'BEHIND' | 'AHEAD';
  };
  modules: ModuleProgress[];
}

interface CourseProgressTrackerProps {
  courseId: string;
  onLessonClick?: (lessonId: string, moduleId: string) => void;
  onMarkComplete?: (lessonId: string, timeSpent?: number) => Promise<void>;
}

const CourseProgressTracker: React.FC<CourseProgressTrackerProps> = ({
  courseId,
  onLessonClick,
  onMarkComplete
}) => {
  const [progressData, setProgressData] = useState<CourseProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [markingComplete, setMarkingComplete] = useState<string | null>(null);

  const { markLessonCompleted } = useProgressTracking();

  useEffect(() => {
    const loadProgressData = async () => {
      try {
        setLoading(true);
        const response = await progressApi.getCourseProgressDetails(courseId);
        setProgressData(response.data);
      } catch (error) {
        console.error('Error fetching progress:', error);
        toast({
          title: "Error",
          description: "Failed to load course progress",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadProgressData();
  }, [courseId]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/progress/course-details/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch progress data');
      }

      const result = await response.json();
      setProgressData(result.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
      toast({
        title: "Error",
        description: "Failed to load course progress",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (lessonId: string, timeSpent: number = 0) => {
    if (!onMarkComplete) return;

    try {
      setMarkingComplete(lessonId);
      await markLessonCompleted(lessonId, timeSpent);
      await fetchProgressData(); // Refresh data
      
      toast({
        title: "Lesson Completed!",
        description: "Your progress has been updated successfully."
      });
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      toast({
        title: "Error",
        description: "Failed to mark lesson as complete",
        variant: "destructive"
      });
    } finally {
      setMarkingComplete(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'IN_PROGRESS':
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTrackingStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'AHEAD':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'BEHIND':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eduBlue-600"></div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No progress data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{progressData.course.title}</CardTitle>
              <p className="text-gray-600 mt-1">{progressData.course.description}</p>
            </div>
            <Badge 
              className={`px-3 py-1 ${getTrackingStatusColor(progressData.overview.trackingStatus)}`}
              variant="outline"
            >
              {progressData.overview.trackingStatus.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-500">
                  {progressData.overview.completedLessons}/{progressData.overview.totalLessons} lessons
                </span>
              </div>
              <Progress value={progressData.overview.overallProgress} className="h-3" />
              <p className="text-xs text-gray-500">
                {Math.round(progressData.overview.overallProgress)}% complete
              </p>
            </div>

            {/* Time Spent */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Time Spent</span>
              </div>
              <p className="text-2xl font-bold text-eduBlue-600">
                {formatTime(progressData.overview.totalTimeSpent)}
              </p>
              <p className="text-xs text-gray-500">
                {progressData.enrollment.daysElapsed} days since enrollment
              </p>
            </div>

            {/* Expected vs Actual */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Progress Status</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Expected: {Math.round(progressData.overview.expectedProgress)}%</span>
                  <span>Actual: {Math.round(progressData.overview.overallProgress)}%</span>
                </div>
                <div className="text-xs text-gray-500">
                  {progressData.overview.deviation > 0 ? '+' : ''}{Math.round(progressData.overview.deviation)}% 
                  {progressData.overview.deviation > 0 ? ' ahead' : ' behind'} schedule
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules and Lessons */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Module Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {progressData.modules.map((module, index) => (
              <motion.div
                key={module.module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{module.module.title}</h3>
                        <p className="text-gray-600 text-sm">{module.module.description}</p>
                      </div>
                      <Badge variant="outline">
                        {module.progress.completedLessons}/{module.progress.totalLessons} lessons
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(module.progress.progressPercentage)}%</span>
                      </div>
                      <Progress value={module.progress.progressPercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatTime(module.progress.totalTimeSpent)} spent</span>
                        <span>{module.progress.totalLessons} total lessons</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Accordion type="single" collapsible className="space-y-4">
            {progressData.modules.map((module) => (
              <AccordionItem key={module.module.id} value={module.module.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{module.module.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {module.progress.completedLessons}/{module.progress.totalLessons}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {Math.round(module.progress.progressPercentage)}%
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-4">
                    {module.lessons.map((lesson) => (
                      <Card key={lesson.lesson.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {getStatusIcon(lesson.progress.status)}
                            <div className="flex items-center gap-2">
                              {getLessonTypeIcon(lesson.lesson.type)}
                              <span className="font-medium">{lesson.lesson.title}</span>
                            </div>
                            {lesson.quiz.hasQuiz && (
                              <Badge variant="outline" className="text-xs">
                                Quiz {lesson.quiz.passed ? '✓' : `${lesson.quiz.bestScore}%`}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">
                              {formatTime(lesson.progress.timeSpent)}
                            </span>
                            
                            {lesson.progress.status !== 'COMPLETED' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onLessonClick?.(lesson.lesson.id, module.module.id)}
                                >
                                  {lesson.progress.status === 'NOT_STARTED' ? 'Start' : 'Continue'}
                                </Button>
                                {onMarkComplete && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleMarkComplete(lesson.lesson.id)}
                                    disabled={markingComplete === lesson.lesson.id}
                                  >
                                    {markingComplete === lesson.lesson.id ? 'Marking...' : 'Mark Complete'}
                                  </Button>
                                )}
                              </div>
                            )}
                            
                            {lesson.progress.status === 'COMPLETED' && (
                              <Badge className="bg-green-100 text-green-800">
                                <Award className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {lesson.progress.progressPercentage > 0 && lesson.progress.progressPercentage < 100 && (
                          <div className="mt-3">
                            <Progress value={lesson.progress.progressPercentage} className="h-1" />
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseProgressTracker;
