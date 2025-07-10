
import React from 'react';
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, CalendarIcon, Video, TrendingUp, Award, Target } from 'lucide-react';

interface DashboardOverviewCardsProps {
  totalCourses?: number;
  completedCourses?: number;
  totalProgress?: number;
  totalHours?: number;
  currentStreak?: number;
  totalPoints?: number;
}

const DashboardOverviewCards: React.FC<DashboardOverviewCardsProps> = ({
  totalCourses = 0,
  completedCourses = 0,
  totalProgress = 0,
  totalHours = 0,
  currentStreak = 0,
  totalPoints = 0
}) => {
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
            {totalCourses}
          </div>
          {completedCourses > 0 && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              {completedCourses} completed
            </p>
          )}
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
                {Math.round(totalProgress)}% Complete
              </span>
            </div>
            <Progress value={totalProgress} className="h-2 bg-gray-200 dark:bg-gray-700" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Learning Streak</CardTitle>
          <CardDescription>Days of consistent learning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-4xl font-bold text-eduOrange-600 dark:text-eduOrange-400">
            <Target className="mr-2 h-8 w-8 text-eduOrange-500" />
            {currentStreak}
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            {currentStreak === 1 ? 'day' : 'days'} streak
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total Points</CardTitle>
          <CardDescription>Earned through learning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-4xl font-bold text-purple-600 dark:text-purple-400">
            <Award className="mr-2 h-8 w-8 text-purple-500" />
            {totalPoints}
          </div>
          {totalHours > 0 && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              {Math.round(totalHours)}h learned
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverviewCards;
