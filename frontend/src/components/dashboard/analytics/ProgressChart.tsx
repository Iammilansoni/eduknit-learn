import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProgressData {
  date: string;
  progress: number;
  studyTime?: number;
  coursesCompleted?: number;
}

interface ProgressChartProps {
  className?: string;
  progressData?: ProgressData[];
  totalProgress?: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ 
  className = '', 
  progressData = [],
  totalProgress = 0
}) => {
  const getTrend = () => {
    if (progressData.length < 2) return { trend: 'neutral', change: 0 };
    
    const recent = progressData.slice(-7); // Last 7 days
    const earlier = progressData.slice(-14, -7); // Previous 7 days
    
    if (recent.length === 0 || earlier.length === 0) return { trend: 'neutral', change: 0 };
    
    const recentAvg = recent.reduce((acc, d) => acc + d.progress, 0) / recent.length;
    const earlierAvg = earlier.reduce((acc, d) => acc + d.progress, 0) / earlier.length;
    
    const change = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;
    
    if (change > 5) return { trend: 'up', change };
    if (change < -5) return { trend: 'down', change };
    return { trend: 'neutral', change };
  };

  const trend = getTrend();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ payload: ProgressData }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium">{formatDate(label)}</p>
          <p className="text-sm text-blue-600">
            Progress: {Math.round(data.progress)}%
          </p>
          {data.studyTime && (
            <p className="text-sm text-green-600">
              Study Time: {Math.round(data.studyTime)}m
            </p>
          )}
          {data.coursesCompleted && (
            <p className="text-sm text-purple-600">
              Courses Completed: {data.coursesCompleted}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (progressData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Progress Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No progress data available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start learning to see your progress trend
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Progress Trend</span>
          <div className="flex items-center space-x-1 text-sm">
            {trend.trend === 'up' && (
              <>
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-green-500">+{Math.round(trend.change)}%</span>
              </>
            )}
            {trend.trend === 'down' && (
              <>
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-red-500">{Math.round(trend.change)}%</span>
              </>
            )}
            {trend.trend === 'neutral' && (
              <>
                <Minus className="h-4 w-4 text-gray-500" />
                <span className="text-gray-500">Stable</span>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="rgba(0,0,0,0.5)"
              />
              <YAxis 
                domain={[0, 100]}
                stroke="rgba(0,0,0,0.5)"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="progress" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#f97316' }}
                activeDot={{ r: 6, fill: '#ea580c' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(totalProgress)}%
            </div>
            <div className="text-xs text-muted-foreground">Current Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {progressData.length > 0 ? Math.round(progressData[progressData.length - 1]?.studyTime || 0) : 0}m
            </div>
            <div className="text-xs text-muted-foreground">Today's Study Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {progressData.length > 0 ? progressData[progressData.length - 1]?.coursesCompleted || 0 : 0}
            </div>
            <div className="text-xs text-muted-foreground">Courses Completed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
