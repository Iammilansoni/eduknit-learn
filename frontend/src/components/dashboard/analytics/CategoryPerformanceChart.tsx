import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Clock, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CategoryPerformance {
  category: string;
  averageProgress: number;
  completedCourses: number;
  totalCourses: number;
  totalStudyTime: number;
  averageScore: number;
}

interface CategoryPerformanceChartProps {
  className?: string;
  categoryPerformance?: CategoryPerformance[];
}

const CategoryPerformanceChart: React.FC<CategoryPerformanceChartProps> = ({ 
  className = '', 
  categoryPerformance = []
}) => {
  const getCategoryColor = (index: number) => {
    const colors = [
      '#f97316', // orange
      '#3b82f6', // blue
      '#10b981', // green
      '#8b5cf6', // purple
      '#f59e0b', // amber
      '#ef4444', // red
      '#06b6d4', // cyan
      '#84cc16', // lime
    ];
    return colors[index % colors.length];
  };

  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getPerformanceLabel = (progress: number) => {
    if (progress >= 80) return { label: 'Excellent', color: 'text-green-600' };
    if (progress >= 60) return { label: 'Good', color: 'text-blue-600' };
    if (progress >= 40) return { label: 'Fair', color: 'text-yellow-600' };
    return { label: 'Needs Work', color: 'text-red-600' };
  };

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ payload: CategoryPerformance; value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium">{data.category}</p>
          <p className="text-sm text-blue-600">
            Progress: {Math.round(data.averageProgress)}%
          </p>
          <p className="text-sm text-green-600">
            Courses: {data.completedCourses}/{data.totalCourses}
          </p>
          <p className="text-sm text-purple-600">
            Study Time: {formatStudyTime(data.totalStudyTime)}
          </p>
          <p className="text-sm text-orange-600">
            Avg Score: {Math.round(data.averageScore)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (categoryPerformance.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Category Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No category data available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete courses to see your performance by category
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const bestCategory = categoryPerformance.reduce((best, current) => 
    current.averageProgress > best.averageProgress ? current : best
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <span>Category Performance</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Best: {bestCategory.category}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis 
                dataKey="category" 
                stroke="rgba(0,0,0,0.5)"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[0, 100]}
                stroke="rgba(0,0,0,0.5)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="averageProgress" radius={[4, 4, 0, 0]}>
                {categoryPerformance.map((entry, index) => (
                  <Cell key={`cell-${entry.category}-${index}`} fill={getCategoryColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Details */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Performance Breakdown</h4>
          {categoryPerformance.map((category, index) => {
            const performance = getPerformanceLabel(category.averageProgress);
            return (
              <div key={`category-${category.category}-${index}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getCategoryColor(index) }}
                  />
                  <div>
                    <div className="font-medium text-sm">{category.category}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.completedCourses}/{category.totalCourses} courses
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">{Math.round(category.averageProgress)}%</div>
                  <Badge variant="outline" className={`text-xs ${performance.color}`}>
                    {performance.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(categoryPerformance.reduce((acc, cat) => acc + cat.averageProgress, 0) / categoryPerformance.length)}%
            </div>
            <div className="text-xs text-muted-foreground">Average Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatStudyTime(categoryPerformance.reduce((acc, cat) => acc + cat.totalStudyTime, 0))}
            </div>
            <div className="text-xs text-muted-foreground">Total Study Time</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryPerformanceChart;
