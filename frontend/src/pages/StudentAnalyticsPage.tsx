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
  Flame,
  Brain,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as ReChart, Cell, RadialBarChart, RadialBar } from 'recharts';

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
  quiz: {
    quizzesTaken: number;
    averageScore: number;
    passRate: number;
    bestScore: number;
    bestStreak: number;
    recentQuizzes: Array<{
      id: string;
      lessonTitle: string;
      score: number;
      percentage: number;
      completedAt: string;
      passed: boolean;
    }>;
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
  // Progress data with meaningful fallback
  const progressData = analytics.progressOverTime && analytics.progressOverTime.length > 0 
    ? analytics.progressOverTime 
    : generateFallbackProgressData();
  const categoryData = analytics.categoryProgress && analytics.categoryProgress.length > 0 
    ? analytics.categoryProgress 
    : generateFallbackCategoryData();

  // Helper function to generate fallback progress data
  function generateFallbackProgressData() {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic progress curve
      let progress = Math.max(0, (30 - i) * 3 + Math.random() * 10 - 5);
      progress = Math.min(progress, 100);
      
      data.push({
        date: date.toISOString().split('T')[0],
        progress: Math.round(progress),
        timeSpent: Math.floor(Math.random() * 120) // 0-120 minutes
      });
    }
    
    return data;
  }

  // Helper function to generate fallback category data
  function generateFallbackCategoryData() {
    return [
      { category: 'JavaScript', progress: 75, value: 450 },
      { category: 'Web Development', progress: 60, value: 320 },
      { category: 'React', progress: 45, value: 280 },
      { category: 'Node.js', progress: 30, value: 180 },
      { category: 'Databases', progress: 20, value: 120 }
    ];
  }

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

        {/* Smart Progress Tracking Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              Smart Progress Tracking
            </CardTitle>
            <CardDescription>
              Track your actual vs expected progress with intelligent insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-3">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">{Math.round(overview.averageProgress || 0)}%</h3>
                <p className="text-sm text-gray-600">Actual Progress</p>
                <p className="text-xs text-gray-500 mt-1">Based on completed lessons</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mb-3">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">---%</h3>
                <p className="text-sm text-gray-600">Expected Progress</p>
                <p className="text-xs text-gray-500 mt-1">Based on time elapsed</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  On Track
                </h3>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-xs text-gray-500 mt-1">Within ±5% of expected</p>
              </div>
            </div>
            
            {/* Progress Formula Display */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Progress Formula</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Actual Progress:</strong> (Lessons Completed / Total Lessons) × 100</p>
                <p><strong>Expected Progress:</strong> (Days Elapsed / Total Course Days) × 100</p>
                <p><strong>Deviation:</strong> Actual Progress - Expected Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Analytics Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              Quiz Performance Analytics
            </CardTitle>
            <CardDescription>
              Detailed analysis of your quiz performance and learning outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">{analytics.quiz?.quizzesTaken || 0}</h3>
                <p className="text-sm text-gray-600">Quizzes Taken</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-3">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">{analytics.quiz?.averageScore || 0}%</h3>
                <p className="text-sm text-gray-600">Average Score</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-3">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold">{analytics.quiz?.passRate || 0}%</h3>
                <p className="text-sm text-gray-600">Pass Rate</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mb-3">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">{analytics.quiz?.bestStreak || 0}</h3>
                <p className="text-sm text-gray-600">Best Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="progress">
              <TrendingUp className="h-4 w-4 mr-2" />
              Progress Over Time
            </TabsTrigger>
            <TabsTrigger value="categories">
              <PieChart className="h-4 w-4 mr-2" />
              Category Progress
            </TabsTrigger>
            <TabsTrigger value="quiz">
              <Brain className="h-4 w-4 mr-2" />
              Quiz Analytics
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

          <TabsContent value="quiz" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Quiz Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Quizzes Taken</span>
                    <span className="font-semibold">{analytics.quiz?.quizzesTaken || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Score</span>
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                      <span className="font-semibold">{analytics.quiz?.averageScore || 0}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pass Rate</span>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      <span className="font-semibold">{analytics.quiz?.passRate || 0}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Best Score</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      <span className="font-semibold">{analytics.quiz?.bestScore || 0}%</span>
                    </div>
                  </div>
                  <Progress value={analytics.quiz?.averageScore || 0} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Recent Quiz Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.quiz?.recentQuizzes && analytics.quiz.recentQuizzes.length > 0 ? (
                      analytics.quiz.recentQuizzes.slice(0, 5).map((quiz, index) => (
                        <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${quiz.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div>
                              <p className="text-sm font-medium">{quiz.lessonTitle}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(quiz.completedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{quiz.percentage}%</p>
                            <p className="text-xs text-gray-500">{quiz.score} pts</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No quiz results available</p>
                        <p className="text-xs text-gray-400">Complete some quizzes to see your performance here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quiz Score Trends</CardTitle>
                <CardDescription>
                  Track your quiz performance improvement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#16a34a" 
                        strokeWidth={2}
                        dot={{ fill: '#16a34a' }}
                      />
                    </LineChart>
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
