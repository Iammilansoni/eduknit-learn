import React from 'react';
import { useStudentAnalytics } from '@/hooks/use-student-profile';
import { StudentAnalytics } from '@/services/studentApi';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Trophy, 
  Clock, 
  BookOpen, 
  Award, 
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Star,
  Zap,
  Flame
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as ReChart, Cell } from 'recharts';

interface BadgeData {
  name: string;
  description?: string;
  earnedAt?: string;
}

interface AnalyticsData {
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
    badges: BadgeData[];
    streaks: {
      currentLoginStreak: number;
      longestLoginStreak: number;
      currentLearningStreak: number;
      longestLearningStreak: number;
    };
  };
  progressOverTime: Array<{
    date: string;
    progress: number;
    timeSpent?: number;
  }>;
  categoryProgress: Array<{
    category: string;
    progress: number;
    value?: number;
  }>;
  profileCompleteness: number;
}

const StudentAnalyticsPage = () => {
  const { data: analyticsData, isLoading, error } = useStudentAnalytics();

  // Debug: Log the analytics data
  console.log('Analytics data received:', analyticsData);
  console.log('Analytics data structure:', {
    rawData: analyticsData,
    overview: analyticsData?.overview,
    gamification: analyticsData?.gamification,
    progressOverTime: analyticsData?.progressOverTime,
    categoryProgress: analyticsData?.categoryProgress,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eduBlue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">Failed to load analytics</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const analytics = analyticsData || ({} as StudentAnalytics);
  const overview = analytics.overview || {
    totalEnrollments: 0,
    completedCourses: 0,
    activeEnrollments: 0,
    certificatesEarned: 0,
    totalTimeSpent: 0,
    averageProgress: 0,
  };
  const gamification = analytics.gamification || {
    totalPoints: 0,
    level: 1,
    badges: [],
    streaks: {
      currentLoginStreak: 0,
      longestLoginStreak: 0,
      currentLearningStreak: 0,
      longestLearningStreak: 0,
    },
  };
  const progressData = analytics.progressOverTime || [];
  const categoryData = analytics.categoryProgress || [];

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Learning Analytics</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your progress, achievements, and learning patterns
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-eduBlue-600">{overview.totalEnrollments || 0}</div>
              <p className="text-xs text-muted-foreground">
                {overview.activeEnrollments || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overview.completedCourses || 0}</div>
              <p className="text-xs text-muted-foreground">
                {overview.certificatesEarned || 0} certificates earned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-eduOrange-600">
                {Math.round((overview.totalTimeSpent || 0) / 60)}h
              </div>
              <p className="text-xs text-muted-foreground">
                Total learning hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(overview.averageProgress || 0)}%
              </div>
              <Progress value={overview.averageProgress || 0} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Gamification Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Achievements & Gamification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-4">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold">{gamification.totalPoints || 0}</h3>
                <p className="text-sm text-gray-600">Total Points</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">Level {gamification.level || 1}</h3>
                <p className="text-sm text-gray-600">Current Level</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
                  <Flame className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold">{gamification.streaks?.currentLearningStreak || 0}</h3>
                <p className="text-sm text-gray-600">Learning Streak</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">{gamification.badges?.length || 0}</h3>
                <p className="text-sm text-gray-600">Badges Earned</p>
              </div>
            </div>

            {/* Badges Display */}
            {gamification.badges && gamification.badges.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium mb-3">Recent Badges</h4>
                <div className="flex flex-wrap gap-2">
                  {gamification.badges.slice(0, 6).map((badge: BadgeData, index: number) => (
                    <Badge key={index} variant="outline" className="p-2">
                      <Award className="h-3 w-3 mr-1" />
                      {badge.name || `Badge ${index + 1}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts and Analytics */}
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress">
              <TrendingUp className="h-4 w-4 mr-2" />
              Progress Over Time
            </TabsTrigger>
            <TabsTrigger value="categories">
              <PieChart className="h-4 w-4 mr-2" />
              Category Progress
            </TabsTrigger>
            <TabsTrigger value="streaks">
              <Calendar className="h-4 w-4 mr-2" />
              Learning Streaks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress Over Time</CardTitle>
                <CardDescription>
                  Track your learning progress across all courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="progress" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        dot={{ fill: '#2563eb' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress by Category</CardTitle>
                <CardDescription>
                  See how you&apos;re performing in different subject areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="progress" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streaks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Flame className="h-5 w-5 mr-2" />
                    Learning Streaks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Streak</span>
                    <div className="flex items-center">
                      <Flame className="h-4 w-4 mr-1 text-orange-500" />
                      <span className="font-semibold">{gamification.streaks?.currentLearningStreak || 0} days</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Longest Streak</span>
                    <div className="flex items-center">
                      <Flame className="h-4 w-4 mr-1 text-red-500" />
                      <span className="font-semibold">{gamification.streaks?.longestLearningStreak || 0} days</span>
                    </div>
                  </div>
                  <Progress 
                    value={(gamification.streaks?.currentLearningStreak || 0) / Math.max(gamification.streaks?.longestLearningStreak || 1, 1) * 100} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Login Streaks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Streak</span>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                      <span className="font-semibold">{gamification.streaks?.currentLoginStreak || 0} days</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Longest Streak</span>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-green-500" />
                      <span className="font-semibold">{gamification.streaks?.longestLoginStreak || 0} days</span>
                    </div>
                  </div>
                  <Progress 
                    value={(gamification.streaks?.currentLoginStreak || 0) / Math.max(gamification.streaks?.longestLoginStreak || 1, 1) * 100} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Profile Completeness */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Completeness</CardTitle>
            <CardDescription>
              Complete your profile to unlock personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Completeness</span>
                <span className="text-sm font-semibold">
                  {analytics.profileCompleteness || 0}%
                </span>
              </div>
              <Progress value={analytics.profileCompleteness || 0} className="h-3" />
              <p className="text-xs text-gray-600">
                Complete your profile to get better course recommendations and connect with other learners
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentAnalyticsPage;
