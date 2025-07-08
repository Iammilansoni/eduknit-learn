import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Clock, Target } from 'lucide-react';
import { analyticsApi, CategoryPerformance } from '@/services/analyticsApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CategoryPerformanceChartProps {
  className?: string;
}

const CategoryPerformanceChart: React.FC<CategoryPerformanceChartProps> = ({ className = '' }) => {
  const [categoryData, setCategoryData] = useState<CategoryPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await analyticsApi.getCategoryPerformance();
        setCategoryData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load category performance';
        setError(errorMessage);
        console.error('Error loading category performance:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryData();
  }, []);

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

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Category Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
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
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (categoryData.length === 0) {
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

  const bestCategory = categoryData.reduce((best, current) => 
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
            <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getCategoryColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Details */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Category Breakdown</h4>
          {categoryData.map((category, index) => {
            const performance = getPerformanceLabel(category.averageProgress);
            return (
              <div key={category.category} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getCategoryColor(index) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{category.category}</span>
                    <Badge variant="outline" className={`text-xs ${performance.color}`}>
                      {performance.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Target className="h-3 w-3" />
                      <span>{Math.round(category.averageProgress)}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatStudyTime(category.totalStudyTime)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="h-3 w-3" />
                      <span>{category.completedCourses}/{category.totalCourses}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {categoryData.length}
            </div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(categoryData.reduce((acc, cat) => acc + cat.averageProgress, 0) / categoryData.length)}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatStudyTime(categoryData.reduce((acc, cat) => acc + cat.totalStudyTime, 0))}
            </div>
            <div className="text-xs text-muted-foreground">Total Time</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryPerformanceChart;
