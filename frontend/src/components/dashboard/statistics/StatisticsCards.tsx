
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const StatisticsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Weekly Learning Activity</CardTitle>
          <CardDescription>Hours spent learning</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-48 flex items-end justify-between px-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const heights = ['40%', '65%', '35%', '80%', '55%', '20%', '30%'];
              return (
                <div key={day} className="flex flex-col items-center">
                  <div 
                    className="w-8 bg-eduBlue-500 dark:bg-eduBlue-600 rounded-t-md transition-all duration-500 ease-in-out" 
                    style={{ height: heights[i] }}
                  ></div>
                  <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">{day}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Course Progress</CardTitle>
          <CardDescription>Completion status by subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">Web Development</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">65%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">Data Science</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">32%</span>
              </div>
              <Progress value={32} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">Digital Marketing</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">89%</span>
              </div>
              <Progress value={89} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
