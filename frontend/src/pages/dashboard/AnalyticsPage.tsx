import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  BookOpen,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Trophy,
  Star,
  Eye,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextUtils';

interface AnalyticsData {
  totalCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  passedQuizzes: number;
  averageScore: number;
  studyTime: number; // in minutes
  streakDays: number;
  currentLevel: number;
  experiencePoints: number;
  nextLevelXP: number;
  weeklyProgress: {
    date: string;
    lessonsCompleted: number;
    timeSpent: number;
    quizzesPassed: number;
  }[];
  courseProgress: {
    courseId: string;
    courseTitle: string;
    progress: number;
    lessonsCompleted: number;
    totalLessons: number;
    averageScore: number;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: string;
    progress: number;
    maxProgress: number;
  }[];
  learningStreak: {
    date: string;
    active: boolean;
    minutes: number;
  }[];
}

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30'); // days
  const [selectedCourse, setSelectedCourse] = useState('all');

  // Mock analytics data (would be fetched from API)
  const mockAnalyticsData: AnalyticsData = {
    totalCourses: 8,
    completedCourses: 3,
    totalLessons: 156,
    completedLessons: 89,
    totalQuizzes: 45,
    passedQuizzes: 38,
    averageScore: 87.5,
    studyTime: 2840, // minutes
    streakDays: 12,
    currentLevel: 7,
    experiencePoints: 2840,
    nextLevelXP: 3200,
    weeklyProgress: [
      { date: '2024-01-01', lessonsCompleted: 3, timeSpent: 120, quizzesPassed: 2 },
      { date: '2024-01-02', lessonsCompleted: 2, timeSpent: 90, quizzesPassed: 1 },
      { date: '2024-01-03', lessonsCompleted: 4, timeSpent: 180, quizzesPassed: 3 },
      { date: '2024-01-04', lessonsCompleted: 1, timeSpent: 45, quizzesPassed: 1 },
      { date: '2024-01-05', lessonsCompleted: 5, timeSpent: 210, quizzesPassed: 4 },
      { date: '2024-01-06', lessonsCompleted: 2, timeSpent: 75, quizzesPassed: 2 },
      { date: '2024-01-07', lessonsCompleted: 3, timeSpent: 135, quizzesPassed: 2 },
    ],
    courseProgress: [
      { courseId: '1', courseTitle: 'JavaScript Basics', progress: 85, lessonsCompleted: 17, totalLessons: 20, averageScore: 92 },
      { courseId: '2', courseTitle: 'Web Development Fundamentals', progress: 60, lessonsCompleted: 12, totalLessons: 20, averageScore: 88 },
      { courseId: '3', courseTitle: 'Data Science Fundamentals', progress: 45, lessonsCompleted: 9, totalLessons: 20, averageScore: 85 },
      { courseId: '4', courseTitle: 'Python Programming', progress: 100, lessonsCompleted: 20, totalLessons: 20, averageScore: 94 },
      { courseId: '5', courseTitle: 'Digital Marketing Mastery', progress: 30, lessonsCompleted: 6, totalLessons: 20, averageScore: 82 },
    ],
    achievements: [
      { id: '1', title: 'First Steps', description: 'Complete your first lesson', icon: '🎯', earnedAt: '2024-01-01', progress: 1, maxProgress: 1 },
      { id: '2', title: 'Quiz Master', description: 'Pass 10 quizzes with 90%+ score', icon: '🏆', earnedAt: '2024-01-05', progress: 12, maxProgress: 10 },
      { id: '3', title: 'Streak Champion', description: 'Maintain a 7-day learning streak', icon: '🔥', earnedAt: '2024-01-07', progress: 12, maxProgress: 7 },
      { id: '4', title: 'Course Completer', description: 'Complete your first course', icon: '🎓', earnedAt: '2024-01-10', progress: 3, maxProgress: 1 },
      { id: '5', title: 'Time Warrior', description: 'Study for 50 hours total', icon: '⏰', earnedAt: '', progress: 47, maxProgress: 50 },
      { id: '6', title: 'Perfect Score', description: 'Get 100% on 5 quizzes', icon: '⭐', earnedAt: '', progress: 3, maxProgress: 5 },
    ],
    learningStreak: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        active: i >= 18, // Last 12 days are active
        minutes: i >= 18 ? Math.floor(Math.random() * 120) + 30 : 0
      };
    })
  };

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

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 70) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLevelProgress = () => {
    const currentLevelXP = 2400; // XP needed for current level
    const nextLevelXP = 3200; // XP needed for next level
    const xpInLevel = mockAnalyticsData.experiencePoints - currentLevelXP;
    const xpNeededForNext = nextLevelXP - currentLevelXP;
    return (xpInLevel / xpNeededForNext) * 100;
  };

  const handleExportData = () => {
    // This would export analytics data as CSV/PDF
    console.log('Export analytics data');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Track your learning progress and achievements
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-eduBlue-600">
                {mockAnalyticsData.completedCourses}/{mockAnalyticsData.totalCourses}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((mockAnalyticsData.completedCourses / mockAnalyticsData.totalCourses) * 100)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockAnalyticsData.completedLessons}/{mockAnalyticsData.totalLessons}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((mockAnalyticsData.completedLessons / mockAnalyticsData.totalLessons) * 100)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {mockAnalyticsData.averageScore}%
              </div>
              <p className="text-xs text-muted-foreground">
                Across {mockAnalyticsData.passedQuizzes} quizzes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatTime(mockAnalyticsData.studyTime)}
              </div>
              <p className="text-xs text-muted-foreground">
                {mockAnalyticsData.streakDays} day streak
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Level Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold">Level {mockAnalyticsData.currentLevel}</div>
                <div className="text-sm text-gray-600">
                  {mockAnalyticsData.experiencePoints} / {mockAnalyticsData.nextLevelXP} XP
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Next Level</div>
                <div className="text-lg font-bold text-eduBlue-600">Level {mockAnalyticsData.currentLevel + 1}</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-eduBlue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getLevelProgress()}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {mockAnalyticsData.nextLevelXP - mockAnalyticsData.experiencePoints} XP needed for next level
            </div>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="streak">Learning Streak</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Weekly Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalyticsData.weeklyProgress.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium">{formatDate(day.date)}</div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {day.lessonsCompleted} lessons
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(day.timeSpent)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            {day.quizzesPassed} quizzes
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        {day.lessonsCompleted > 0 ? 'Active' : 'No activity'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quiz Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Quiz Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {mockAnalyticsData.passedQuizzes}
                    </div>
                    <div className="text-sm text-gray-600">Quizzes Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {mockAnalyticsData.totalQuizzes - mockAnalyticsData.passedQuizzes}
                    </div>
                    <div className="text-sm text-gray-600">Quizzes Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.round((mockAnalyticsData.passedQuizzes / mockAnalyticsData.totalQuizzes) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalyticsData.courseProgress.map((course) => (
                    <div key={course.courseId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{course.courseTitle}</h4>
                          <p className="text-sm text-gray-600">
                            {course.lessonsCompleted} of {course.totalLessons} lessons completed
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getProgressColor(course.progress)}`}>
                            {course.progress}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Avg: {course.averageScore}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            course.progress >= 90 ? 'bg-green-500' :
                            course.progress >= 70 ? 'bg-blue-500' :
                            course.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockAnalyticsData.achievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`border rounded-lg p-4 text-center ${
                        achievement.earnedAt ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <h4 className="font-medium mb-1">{achievement.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      {achievement.earnedAt ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          Earned
                        </Badge>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            {achievement.progress} / {achievement.maxProgress}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streak" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {mockAnalyticsData.learningStreak.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs ${
                        day.active ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {day.active ? '✓' : '○'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatDate(day.date)}
                      </div>
                      {day.active && (
                        <div className="text-xs text-green-600">
                          {formatTime(day.minutes)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {mockAnalyticsData.streakDays} day streak!
                  </div>
                  <p className="text-sm text-gray-600">Keep up the great work!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage; 