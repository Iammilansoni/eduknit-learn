import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Trophy, 
  Target, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Users,
  Bookmark,
  Play,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextUtils';
import { analyticsAPI } from '@/services/api';

interface LearningStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalTimeSpent: number;
  averageProgress: number;
  totalLessons: number;
  completedLessons: number;
  totalModules: number;
  completedModules: number;
  streakDays: number;
  totalPoints: number;
  level: number;
}

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  progress: number;
  timeSpent: number;
  lastAccessed: string;
  modulesCompleted: number;
  totalModules: number;
  lessonsCompleted: number;
  totalLessons: number;
  status: 'completed' | 'in_progress' | 'not_started';
}

interface WeeklyActivity {
  date: string;
  lessonsCompleted: number;
  timeSpent: number;
  pointsEarned: number;
}

interface PerformanceMetrics {
  averageQuizScore: number;
  averageCompletionTime: number;
  retentionRate: number;
  engagementScore: number;
}

const EnhancedAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCourse, setSelectedCourse] = useState('all');

  // Fetch learning statistics
  const { data: learningStats, isLoading: statsLoading } = useQuery({
    queryKey: ['learning-stats', user?.id, timeRange],
    queryFn: () => analyticsAPI.getLearningStats(user?.id!, timeRange),
    enabled: !!user?.id,
  });

  // Fetch course progress
  const { data: courseProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['course-progress', user?.id],
    queryFn: () => analyticsAPI.getCourseProgress(user?.id!),
    enabled: !!user?.id,
  });

  // Fetch weekly activity
  const { data: weeklyActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['weekly-activity', user?.id, timeRange],
    queryFn: () => analyticsAPI.getWeeklyActivity(user?.id!, timeRange),
    enabled: !!user?.id,
  });

  // Fetch performance metrics
  const { data: performanceMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['performance-metrics', user?.id],
    queryFn: () => analyticsAPI.getPerformanceMetrics(user?.id!),
    enabled: !!user?.id,
  });

  const stats = learningStats?.data as LearningStats;
  const courses = courseProgress?.data as CourseProgress[];
  const activity = weeklyActivity?.data as WeeklyActivity[];
  const metrics = performanceMetrics?.data as PerformanceMetrics;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelTitle = (level: number) => {
    if (level >= 10) return 'Expert';
    if (level >= 7) return 'Advanced';
    if (level >= 4) return 'Intermediate';
    if (level >= 1) return 'Beginner';
    return 'Newcomer';
  };

  if (statsLoading || progressLoading || activityLoading || metricsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eduBlue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Analytics</h1>
          <p className="text-gray-600">Track your learning progress and performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageProgress?.toFixed(1) || 0}%</div>
            <Progress value={stats?.averageProgress || 0} className="mt-2" />
            <p className="text-xs text-gray-600 mt-1">
              {stats?.completedCourses || 0} of {stats?.totalCourses || 0} courses completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent Learning</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats?.totalTimeSpent || 0)}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats?.streakDays || 0} day{stats?.streakDays !== 1 ? 's' : ''} learning streak
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedLessons || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              of {stats?.totalLessons || 0} total lessons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Level</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getLevelTitle(stats?.level || 0)}</div>
            <p className="text-xs text-gray-600 mt-1">
              Level {stats?.level || 0} • {stats?.totalPoints || 0} points
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Performance</CardTitle>
            <Target className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.averageQuizScore?.toFixed(1) || 0}%</div>
            <p className="text-xs text-gray-600 mt-1">Average quiz score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Time</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(metrics?.averageCompletionTime || 0)}</div>
            <p className="text-xs text-gray-600 mt-1">Average per lesson</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.retentionRate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-gray-600 mt-1">Course completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.engagementScore?.toFixed(1) || 0}/10</div>
            <p className="text-xs text-gray-600 mt-1">Based on activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Course Progress</TabsTrigger>
          <TabsTrigger value="activity">Learning Activity</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses?.map((course) => (
                  <div key={course.courseId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{course.courseTitle}</h3>
                      <Badge className={getStatusColor(course.status)}>
                        {course.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{course.progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Time:</span> {formatTime(course.timeSpent)}
                        </div>
                        <div>
                          <span className="font-medium">Modules:</span> {course.modulesCompleted}/{course.totalModules}
                        </div>
                        <div>
                          <span className="font-medium">Lessons:</span> {course.lessonsCompleted}/{course.totalLessons}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Learning Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity?.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium">{formatDate(day.date)}</div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{day.lessonsCompleted} lessons</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>{formatTime(day.timeSpent)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <span>{day.pointsEarned} points</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Most Active Day</span>
                    <span className="font-medium">Wednesday</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Peak Learning Time</span>
                    <span className="font-medium">2:00 PM - 4:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Session</span>
                    <span className="font-medium">{formatTime(45)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strengths & Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Consistent daily learning</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>High quiz completion rate</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-700 mb-2">Areas for Improvement</h4>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <span>Could increase study time</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <span>More practice with advanced topics</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Bookmark className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Continue Learning</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                You're making great progress! Keep up the momentum with your current courses.
              </p>
              <Button size="sm" variant="outline">View Courses</Button>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Set Goals</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Set daily learning goals to maintain your streak and improve consistency.
              </p>
              <Button size="sm" variant="outline">Set Goals</Button>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Play className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium">Try New Topics</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Explore new courses to broaden your skills and knowledge base.
              </p>
              <Button size="sm" variant="outline">Browse Courses</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAnalyticsDashboard; 