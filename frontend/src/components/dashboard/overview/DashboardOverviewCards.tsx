
import React from 'react';
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, CalendarIcon, Video, TrendingUp } from 'lucide-react';
import { useStudentDashboard } from '@/hooks/useStudentDashboard';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardOverviewCards = () => {
  const { dashboard, progressDashboard, loading, error } = useStudentDashboard();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="col-span-full">
          <CardContent className="p-6">
            <p className="text-red-600 dark:text-red-400">Error loading dashboard data: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const enrolledCoursesCount = progressDashboard?.courses?.length || 0;
  const overallProgress = progressDashboard?.overview?.overallProgress || 0;
  const upcomingDeadlinesCount = dashboard?.upcomingDeadlines?.length || 0;
  const totalStudyTime = dashboard?.stats?.totalStudyTime || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Enrolled Courses</CardTitle>
          <CardDescription>Your active learning paths</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-4xl font-bold text-eduBlue-600 dark:text-eduBlue-400">
            <GraduationCap className="mr-2 h-8 w-8 text-eduBlue-500" />
            {enrolledCoursesCount}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Overall Progress</CardTitle>
          <CardDescription>Your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {Math.round(overallProgress)}% Complete
              </span>
            </div>
            <Progress value={overallProgress} className="h-2 bg-gray-200 dark:bg-gray-700" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
          <CardDescription>Tasks requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-4xl font-bold text-eduOrange-600 dark:text-eduOrange-400">
            <CalendarIcon className="mr-2 h-8 w-8 text-eduOrange-500" />
            {upcomingDeadlinesCount}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Study Time</CardTitle>
          <CardDescription>Total time invested</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-4xl font-bold text-purple-600 dark:text-purple-400">
            <TrendingUp className="mr-2 h-8 w-8 text-purple-500" />
            {Math.round(totalStudyTime / 60)}h
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverviewCards;
