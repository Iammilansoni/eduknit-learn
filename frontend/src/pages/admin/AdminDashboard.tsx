import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Video, 
  BarChart3, 
  Settings,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  GraduationCap,
  Calendar,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextUtils';

interface DashboardStats {
  totalCourses: number;
  totalModules: number;
  totalLessons: number;
  totalUsers: number;
  totalStudents: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user?: string;
  }>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard/stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const quickActions = [
    {
      title: 'Create Course',
      description: 'Add a new course to the platform',
      icon: <Plus className="h-6 w-6" />,
      action: () => navigate('/admin/courses'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <Users className="h-6 w-6" />,
      action: () => navigate('/admin/users'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'View Analytics',
      description: 'Check platform analytics and reports',
      icon: <BarChart3 className="h-6 w-6" />,
      action: () => navigate('/admin/analytics'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: <Settings className="h-6 w-6" />,
      action: () => navigate('/admin/settings'),
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  const managementCards = [
    {
      title: 'Course Management',
      description: 'Create, edit, and manage courses',
      icon: <BookOpen className="h-8 w-8" />,
      stats: stats?.totalCourses || 0,
      action: () => navigate('/admin/courses'),
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: 'Module Management',
      description: 'Organize course content into modules',
      icon: <FileText className="h-8 w-8" />,
      stats: stats?.totalModules || 0,
      action: () => navigate('/admin/modules'),
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'Lesson Management',
      description: 'Create and manage individual lessons',
      icon: <Video className="h-8 w-8" />,
      stats: stats?.totalLessons || 0,
      action: () => navigate('/admin/modules'),
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      title: 'User Management',
      description: 'Manage student and admin accounts',
      icon: <Users className="h-8 w-8" />,
      stats: stats?.totalUsers || 0,
      action: () => navigate('/admin/users'),
      color: 'bg-gradient-to-r from-orange-500 to-orange-600'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return <UserCheck className="h-4 w-4" />;
      case 'completion': return <CheckCircle className="h-4 w-4" />;
      case 'course_created': return <BookOpen className="h-4 w-4" />;
      case 'user_registered': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'enrollment': return 'text-blue-600';
      case 'completion': return 'text-green-600';
      case 'course_created': return 'text-purple-600';
      case 'user_registered': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Layout>
      <AdminNavigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.username || 'Admin'}. Here's an overview of your platform.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={action.action}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg text-white ${action.color}`}>
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {managementCards.map((card, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={card.action}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg text-white ${card.color}`}>
                    {card.icon}
                  </div>
                  <Badge variant="secondary" className="text-lg font-semibold">
                    {card.stats}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enrollment Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Enrollment Overview</span>
              </CardTitle>
              <CardDescription>
                Current enrollment statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats?.totalEnrollments || 0}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats?.activeEnrollments || 0}</div>
                      <div className="text-sm text-gray-600">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{stats?.completedEnrollments || 0}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Average Progress</span>
                      <span className="text-sm text-gray-600">{stats?.averageProgress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats?.averageProgress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Statistics</span>
              </CardTitle>
              <CardDescription>
                Platform user demographics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats?.totalUsers || 0}</div>
                      <div className="text-sm text-gray-600">Total Users</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats?.totalStudents || 0}</div>
                      <div className="text-sm text-gray-600">Students</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Student Ratio</span>
                      <span className="text-sm text-gray-600">
                        {stats?.totalUsers && stats?.totalStudents 
                          ? Math.round((stats.totalStudents / stats.totalUsers) * 100) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest platform activities and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full bg-gray-100 ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        {activity.user && (
                          <p className="text-xs text-gray-500">by {activity.user}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard; 