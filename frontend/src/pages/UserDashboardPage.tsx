import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextUtils';
import { userApi as userAPI } from '@/services/userApi';
import type { User } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User as UserIcon,
  BookOpen,
  Award,
  Clock,
  Calendar,
  Settings,
  Edit,
  CheckCircle,
  PlayCircle,
  Target
} from 'lucide-react';

const UserDashboardPage = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserById(user?.id || '');
      if (response.success && response.user) {
        setUserProfile(response.user);
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Failed to fetch profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800">Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
      case 'user':
        return <Badge className="bg-blue-100 text-blue-800">Student</Badge>;
      case 'visitor':
        return <Badge className="bg-gray-100 text-gray-800">Visitor</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Welcome back, {userProfile?.firstName || userProfile?.username}! Ready to continue learning?
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Section */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={userProfile?.profilePicture} />
                      <AvatarFallback>
                        {userProfile?.firstName?.charAt(0) || userProfile?.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>
                        {userProfile?.firstName && userProfile?.lastName 
                          ? `${userProfile.firstName} ${userProfile.lastName}`
                          : userProfile?.username
                        }
                      </CardTitle>
                      <CardDescription>@{userProfile?.username}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    {getStatusBadge(userProfile?.enrollmentStatus || 'active')}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Role</span>
                    {getRoleBadge(userProfile?.role || 'user')}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Member since</span>
                    <span className="text-sm">
                      {new Date(userProfile?.createdAt || '').toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Last login</span>
                    <span className="text-sm">
                      {userProfile?.updatedAt 
                        ? new Date(userProfile.updatedAt).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">
                      +2 from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <p className="text-xs text-muted-foreground">
                      67% completion rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
                    <Clock className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <p className="text-xs text-muted-foreground">
                      +12 this week
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Current Courses */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Courses</CardTitle>
                  <CardDescription>
                    Continue where you left off
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Advanced JavaScript</h3>
                          <p className="text-sm text-gray-500">Module 3 of 8</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '37.5%' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">37%</span>
                        <Button size="sm">
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Continue
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Target className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Data Science Fundamentals</h3>
                          <p className="text-sm text-gray-500">Module 5 of 10</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">50%</span>
                        <Button size="sm">
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Continue
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Award className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">UI/UX Design Principles</h3>
                          <p className="text-sm text-gray-500">Module 2 of 6</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '33%' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">33%</span>
                        <Button size="sm">
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Continue
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your learning journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Completed JavaScript Basics</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Started Data Science Module 5</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Earned "Quick Learner" badge</p>
                        <p className="text-xs text-gray-500">3 days ago</p>
                      </div>
                      <Badge variant="secondary">Achievement</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboardPage; 