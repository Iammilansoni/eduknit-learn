
import React from 'react';
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, CalendarIcon, Video } from 'lucide-react';

interface DashboardOverviewCardsProps {
  enrolledCourses: any[];
  upcomingDeadlines: any[];
  liveSessionsToday: any[];
}

const DashboardOverviewCards = ({ 
  enrolledCourses, 
  upcomingDeadlines, 
  liveSessionsToday 
}: DashboardOverviewCardsProps) => {
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
            {enrolledCourses.length}
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
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">62% Complete</span>
            </div>
            <Progress value={62} className="h-2 bg-gray-200 dark:bg-gray-700" />
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
            {upcomingDeadlines.length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Live Sessions Today</CardTitle>
          <CardDescription>Interactive learning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-4xl font-bold text-purple-600 dark:text-purple-400">
            <Video className="mr-2 h-8 w-8 text-purple-500" />
            {liveSessionsToday.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverviewCards;
