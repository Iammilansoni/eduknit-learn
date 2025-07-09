import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  BookOpen, 
  Clock, 
  Play, 
  CheckCircle, 
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  HelpCircle,
  Award,
  Target,
  ArrowLeft,
  Calendar,
  Users,
  Star,
  BarChart3
} from 'lucide-react';
import { courseContentAPI, studentAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContextUtils';

interface Module {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  estimatedDuration: number;
  lessons: Lesson[];
  progress?: {
    completedLessons: number;
    totalLessons: number;
    percentage: number;
    timeSpent: number;
  };
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'INTERACTIVE';
  duration: number;
  orderIndex: number;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercentage?: number;
  timeSpent?: number;
}

interface CourseProgress {
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
  modules: Module[];
}

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Fetch course progress
  const { data: progressData, isLoading, error } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => courseContentAPI.getCourseProgress(courseId!, user?.id),
    enabled: !!courseId && !!user?.id,
  });

  // Fetch next module recommendation
  const { data: nextModuleData } = useQuery({
    queryKey: ['next-module', courseId],
    queryFn: () => courseContentAPI.getNextModule(courseId!, user?.id),
    enabled: !!courseId && !!user?.id,
  });

  const courseProgress = progressData?.data as CourseProgress;
  const nextModule = nextModuleData?.data;

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleLessonClick = (lessonId: string) => {
    navigate(`/student-dashboard/lessons/${lessonId}`);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-4 w-4" />;
      case 'TEXT':
        return <FileText className="h-4 w-4" />;
      case 'QUIZ':
        return <HelpCircle className="h-4 w-4" />;
      case 'ASSIGNMENT':
        return <Target className="h-4 w-4" />;
      case 'INTERACTIVE':
        return <Play className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getLessonStatusBadge = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'NOT_STARTED':
        return <Badge variant="outline">Not Started</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eduBlue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !courseProgress) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load course</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/student-dashboard/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Courses
          </Button>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{courseProgress.programmeTitle}</Badge>
            <Badge variant="secondary">{formatDuration(courseProgress.timeSpent)}</Badge>
                </div>
              </div>
              
        {/* Course Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{courseProgress.programmeTitle}</CardTitle>
                <p className="text-gray-600 mb-4">
                  Continue your learning journey with this comprehensive course
                </p>
                
                {/* Progress Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-eduBlue-600">
                      {courseProgress.overallProgress}%
                    </div>
                    <div className="text-sm text-gray-500">Overall Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {courseProgress.modulesCompleted}/{courseProgress.totalModules}
                    </div>
                    <div className="text-sm text-gray-500">Modules</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-eduOrange-600">
                      {courseProgress.lessonsCompleted}/{courseProgress.totalLessons}
                    </div>
                    <div className="text-sm text-gray-500">Lessons</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatDuration(courseProgress.timeSpent)}
                    </div>
                    <div className="text-sm text-gray-500">Time Spent</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course Progress</span>
                    <span>{courseProgress.overallProgress}%</span>
                  </div>
                  <Progress value={courseProgress.overallProgress} className="h-3" />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Next Module Recommendation */}
        {nextModule?.nextModule && (
          <Card className="border-eduBlue-200 bg-eduBlue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-eduBlue-600" />
                Continue Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-1">{nextModule.nextModule.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{nextModule.nextModule.description}</p>
                  {nextModule.nextLesson && (
                    <p className="text-sm text-gray-500">
                      Next lesson: {nextModule.nextLesson.title}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={() => nextModule.nextLesson && handleLessonClick(nextModule.nextLesson.id)}
                  disabled={!nextModule.nextLesson}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Content
            </CardTitle>
            <p className="text-sm text-gray-600">
              {courseProgress.totalModules} modules • {courseProgress.totalLessons} lessons
            </p>
          </CardHeader>
          <CardContent>
                  <div className="space-y-4">
              {courseProgress.modules.map((module) => (
                <Collapsible
                  key={module.id}
                  open={expandedModules.has(module.id)}
                  onOpenChange={() => toggleModule(module.id)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        {expandedModules.has(module.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                              <div>
                          <h4 className="font-semibold">Module {module.orderIndex}: {module.title}</h4>
                          <p className="text-sm text-gray-600">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {module.progress?.completedLessons || 0}/{module.lessons.length}
                          </div>
                          <div className="text-xs text-gray-500">lessons</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {module.progress?.percentage || 0}%
                          </div>
                          <Progress 
                            value={module.progress?.percentage || 0} 
                            className="w-16 h-2" 
                          />
                              </div>
                        <Badge variant="outline">
                          {formatDuration(module.estimatedDuration)}
                                    </Badge>
                                    </div>
                              </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-8 mt-2 space-y-2">
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleLessonClick(lesson.id)}
                        >
                          <div className="flex items-center space-x-3">
                            {getLessonIcon(lesson.type)}
                            <div>
                              <h5 className="font-medium">Lesson {lesson.orderIndex}: {lesson.title}</h5>
                              <p className="text-sm text-gray-600">{lesson.description}</p>
                            </div>
                                        </div>
                          <div className="flex items-center space-x-3">
                            {getLessonStatusBadge(lesson.status)}
                            <Badge variant="outline">
                              {formatDuration(lesson.duration)}
                            </Badge>
                            {lesson.status === 'COMPLETED' && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                                      </div>
                                    </div>
                      ))}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              ))}
                            </div>
          </CardContent>
        </Card>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-eduOrange-600">
                {formatDuration(courseProgress.timeSpent)}
                              </div>
              <p className="text-xs text-muted-foreground">
                Total time spent learning
              </p>
                        </CardContent>
                      </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {courseProgress.totalLessons > 0 ? 
                  Math.round((courseProgress.lessonsCompleted / courseProgress.totalLessons) * 100) : 0}%
                              </div>
              <p className="text-xs text-muted-foreground">
                Lessons completed
              </p>
                      </CardContent>
                    </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {courseProgress.lastAccessedAt ? 
                  new Date(courseProgress.lastAccessedAt).toLocaleDateString() : 'Never'}
                  </div>
              <p className="text-xs text-muted-foreground">
                Last time you studied
              </p>
              </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetailPage;
