import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Calendar,
  Activity,
  Target
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
  monthlyGrowth: {
    users: number;
    enrollments: number;
    completions: number;
  };
  topCourses: Array<{
    id: string;
    title: string;
    enrollments: number;
    completionRate: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Layout>
      <AdminNavigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Platform performance and user engagement metrics
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics?.totalUsers || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    {getGrowthIcon(analytics?.monthlyGrowth.users || 0)}
                    <span className={`ml-2 text-sm font-medium ${getGrowthColor(analytics?.monthlyGrowth.users || 0)}`}>
                      {Math.abs(analytics?.monthlyGrowth.users || 0)}% this month
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Courses</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics?.totalCourses || 0}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics?.totalEnrollments || 0}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    {getGrowthIcon(analytics?.monthlyGrowth.enrollments || 0)}
                    <span className={`ml-2 text-sm font-medium ${getGrowthColor(analytics?.monthlyGrowth.enrollments || 0)}`}>
                      {Math.abs(analytics?.monthlyGrowth.enrollments || 0)}% this month
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics?.averageProgress || 0}%</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enrollment Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Enrollment Overview</span>
                  </CardTitle>
                  <CardDescription>
                    Current enrollment status breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-900">Active Enrollments</p>
                        <p className="text-sm text-blue-600">Currently learning</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics?.activeEnrollments || 0}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">Completed Enrollments</p>
                        <p className="text-sm text-green-600">Successfully finished</p>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {analytics?.completedEnrollments || 0}
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Completion Rate</span>
                        <span className="text-sm text-gray-600">
                          {analytics?.totalEnrollments && analytics?.completedEnrollments
                            ? Math.round((analytics.completedEnrollments / analytics.totalEnrollments) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${analytics?.totalEnrollments && analytics?.completedEnrollments
                              ? (analytics.completedEnrollments / analytics.totalEnrollments) * 100
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Monthly Growth</span>
                  </CardTitle>
                  <CardDescription>
                    Platform growth metrics this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">New Users</span>
                      <div className="flex items-center space-x-2">
                        {getGrowthIcon(analytics?.monthlyGrowth.users || 0)}
                        <span className={`font-medium ${getGrowthColor(analytics?.monthlyGrowth.users || 0)}`}>
                          {analytics?.monthlyGrowth.users || 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">New Enrollments</span>
                      <div className="flex items-center space-x-2">
                        {getGrowthIcon(analytics?.monthlyGrowth.enrollments || 0)}
                        <span className={`font-medium ${getGrowthColor(analytics?.monthlyGrowth.enrollments || 0)}`}>
                          {analytics?.monthlyGrowth.enrollments || 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Course Completions</span>
                      <div className="flex items-center space-x-2">
                        {getGrowthIcon(analytics?.monthlyGrowth.completions || 0)}
                        <span className={`font-medium ${getGrowthColor(analytics?.monthlyGrowth.completions || 0)}`}>
                          {analytics?.monthlyGrowth.completions || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Courses */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Top Performing Courses</span>
                </CardTitle>
                <CardDescription>
                  Courses with highest enrollment and completion rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.topCourses && analytics.topCourses.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topCourses.map((course, index) => (
                      <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{course.title}</h3>
                            <p className="text-sm text-gray-600">{course.enrollments} enrollments</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-1">
                            {course.completionRate}% completion
                          </Badge>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${course.completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No course data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Platform Activity</span>
                </CardTitle>
                <CardDescription>
                  Latest user activities and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="p-2 rounded-full bg-gray-100">
                          <Activity className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.type}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminAnalyticsPage; 