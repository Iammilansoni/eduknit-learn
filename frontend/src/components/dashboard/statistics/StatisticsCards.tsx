
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface StatisticsCardsProps {
  totalEnrollments?: number;
  completedCourses?: number;
  averageProgress?: number;
  totalHoursLearned?: number;
  currentStreak?: number;
  totalPoints?: number;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  totalEnrollments = 0,
  completedCourses = 0,
  averageProgress = 0,
  totalHoursLearned = 0,
  currentStreak = 0,
  totalPoints = 0
}) => {
  // Mock weekly activity data - in a real app, this would come from the backend
  const weeklyActivity = [4, 6, 3, 8, 5, 2, 3]; // hours per day
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Weekly Learning Activity</CardTitle>
          <CardDescription>Hours spent learning this week</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-48 flex items-end justify-between px-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const maxHours = Math.max(...weeklyActivity);
              const height = maxHours > 0 ? `${(weeklyActivity[i] / maxHours) * 100}%` : '10%';
              return (
                <div key={day} className="flex flex-col items-center">
                  <div 
                    className="w-8 bg-eduBlue-500 dark:bg-eduBlue-600 rounded-t-md transition-all duration-500 ease-in-out" 
                    style={{ height }}
                  ></div>
                  <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">{day}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{weeklyActivity[i]}h</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {weeklyActivity.reduce((a, b) => a + b, 0)} hours this week
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Learning Summary</CardTitle>
          <CardDescription>Your overall progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">Enrolled Courses</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{totalEnrollments}</span>
              </div>
              <Progress value={totalEnrollments > 0 ? (completedCourses / totalEnrollments) * 100 : 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">Average Progress</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{Math.round(averageProgress)}%</span>
              </div>
              <Progress value={averageProgress} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">Learning Streak</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentStreak} days</span>
              </div>
              <Progress value={Math.min(currentStreak * 10, 100)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">Total Points</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{totalPoints}</span>
              </div>
              <Progress value={Math.min(totalPoints / 10, 100)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
