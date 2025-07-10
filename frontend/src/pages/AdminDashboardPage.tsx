import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextUtils';
import { userAPI } from '@/services/api';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  BookOpen,
  Settings,
  Activity,
  BarChart3,
  Shield,
  GraduationCap,
  UserCheck,
  TrendingUp,
  Database,
  Loader2,
  LogOut
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeCourses: number;
  totalEnrollments: number;
  systemHealth: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'course_created' | 'enrollment' | 'system';
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
  bgColor: string;
}

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Fetch user stats (for total users)
      const userStatsResponse = await userAPI.getUserStats();
      const userStats = userStatsResponse.data;

      // Fetch course stats (for total courses)
      const courseStatsResponse = await fetch('/api/admin/courses/stats', {
        credentials: 'include'
      });
      const courseStatsJson = await courseStatsResponse.json();
      const courseStats = courseStatsJson.data;

      // Fetch enrollment stats (for total enrollments)
      const enrollmentStatsResponse = await fetch('/api/admin/enrollments/stats', {
        credentials: 'include'
      });
      const enrollmentStatsJson = await enrollmentStatsResponse.json();
      const enrollmentStats = enrollmentStatsJson.data;

      // Calculate system health (simple calculation based on active users vs total)
      const systemHealth = userStats ? Math.round((userStats.active / userStats.total) * 100) : 98;

      // Use the same numbers as /admin/users and /admin/courses
      const finalStats = {
        totalUsers: userStats?.total || 0, // from /api/user/stats
        activeCourses: courseStats?.totalCourses || 0, // from /api/admin/courses/stats
        totalEnrollments: enrollmentStats?.totalEnrollments || 0, // from /api/admin/enrollments/stats
        systemHealth: systemHealth
      };
      setStats(finalStats);

      // Generate recent activity based on real data
      const recentActivity: RecentActivity[] = [];
      if (enrollmentStats?.totalEnrollments > 0) {
        recentActivity.push({
          id: '1',
          type: 'enrollment',
          title: 'Enrollment milestone',
          description: `Reached ${enrollmentStats.totalEnrollments} total enrollments`,
          timestamp: '1 hour ago',
          icon: TrendingUp,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        });
      }
      if (courseStats?.totalCourses > 0) {
        recentActivity.push({
          id: '2',
          type: 'course_created',
          title: 'Course milestone',
          description: `${courseStats.totalCourses} courses available`,
          timestamp: '2 hours ago',
          icon: BookOpen,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        });
      }
      if (userStats?.total > 0) {
        recentActivity.push({
          id: '3',
          type: 'user_registration',
          title: 'User milestone',
          description: `${userStats.total} users registered`,
          timestamp: '3 hours ago',
          icon: UserCheck,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        });
      }
      if (recentActivity.length === 0) {
        recentActivity.push({
          id: '1',
          type: 'system',
          title: 'System initialized',
          description: 'Admin dashboard is ready',
          timestamp: 'Just now',
          icon: Activity,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        });
      }
      setRecentActivity(recentActivity);
    } catch (error: unknown) {
      console.error('Error fetching dashboard stats:', error);
      setStats({
        totalUsers: 0,
        activeCourses: 0,
        totalEnrollments: 0,
        systemHealth: 98
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const adminModules = [
    {
      title: 'Course Management',
      description: 'Create, edit, and manage all courses and their content',
      icon: BookOpen,
      href: '/admin/courses',
      color: 'bg-blue-500',
      stats: 'Manage courses'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and enrollment status',
      icon: Users,
      href: '/admin/users',
      color: 'bg-green-500',
      stats: 'Manage users'
    },
    {
      title: 'Analytics Dashboard',
      description: 'View detailed analytics and performance metrics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-purple-500',
      stats: 'View analytics'
    },
    {
      title: 'System Settings',
      description: 'Configure system settings and preferences',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-orange-500',
      stats: 'Configure system'
    }
  ];

  const quickStats = [
    {
      title: 'Total Users',
      value: stats ? stats.totalUsers.toLocaleString() : '0',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Active Courses',
      value: stats ? stats.activeCourses.toString() : '0',
      icon: GraduationCap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Enrollments',
      value: stats ? stats.totalEnrollments.toLocaleString() : '0',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'System Health',
      value: stats ? `${stats.systemHealth}%` : '98%',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user.firstName || user.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-gray-500" />
                <span className="text-sm text-gray-500">Administrator</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="p-3 rounded-full bg-gray-200">
                      <div className="h-6 w-6"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            quickStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Admin Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminModules.map((module, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => navigate(module.href)}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${module.color} text-white group-hover:scale-110 transition-transform`}>
                    <module.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{module.stats}</span>
                  <Button variant="outline" size="sm" className="group-hover:bg-gray-100">
                    Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-gray-200 rounded-full">
                      <div className="h-4 w-4"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-48"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 ${activity.bgColor} rounded-full`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                    </div>
                    <span className="text-xs text-gray-400">{activity.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>System Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Platform</p>
                <p className="text-gray-500">EduKnit Learn v1.0</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Environment</p>
                <p className="text-gray-500">Development</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Last Updated</p>
                <p className="text-gray-500">{new Date().toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;