import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentEnrollments } from '@/hooks/use-student-profile';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Clock, 
  Play, 
  CheckCircle, 
  TrendingUp, 
  Filter,
  Search,
  Calendar,
  Award,
  Target,
  ArrowRight,
  MoreVertical,
  Pause,
  PlayCircle,
  RefreshCw
} from 'lucide-react';
import { studentApi as studentAPI } from '@/services/studentApi';
import { useAuth } from '@/contexts/AuthContextUtils';
import { useUpdateEnrollmentStatus } from '@/hooks/useCourseProgress';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CourseEnrollment {
  id: string;
  programmeId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  enrollmentDate: string;
  progress: {
    totalProgress: number;
    completedLessons: string[];
    timeSpent: number;
    lastActivityDate?: string;
  };
  programme: {
    id: string;
    title: string;
    description: string;
    category: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    totalModules: number;
    totalLessons: number;
    estimatedDuration: number;
    thumbnail?: string;
  };
}

const MyCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Status update hook
  const { updateStatus, loading: statusUpdateLoading } = useUpdateEnrollmentStatus();

  // Fetch enrolled courses
  const { data: enrollmentsData, isLoading, error, refetch } = useStudentEnrollments();

  // Force refetch enrollments on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      refetch();
    }
  }, [user?.id, refetch]);

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['student-enrollments'] });
      await refetch();
      toast({
        title: "Refreshed",
        description: "Your courses have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh courses",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle the corrected data structure: { enrollments: [...], pagination: {...} }
  const enrollments = (enrollmentsData?.enrollments || []) as CourseEnrollment[];

  // Debug: Log enrollments data
  useEffect(() => {
    console.log('MyCoursesPage - Current enrollments:', enrollments);
    console.log('MyCoursesPage - Enrollments count:', enrollments.length);
    if (enrollments.length > 0) {
      console.log('MyCoursesPage - First enrollment:', enrollments[0]);
    }
  }, [enrollments]);

  // Filter courses based on search and filters
  const filteredEnrollments = enrollments.filter(enrollment => {
    // Add defensive checks for programme data
    if (!enrollment.programme) {
      console.warn('Enrollment missing programme data:', enrollment);
      return false;
    }

    const matchesSearch = enrollment.programme.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.programme.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || enrollment.programme.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Group courses by status
  const activeCourses = filteredEnrollments.filter(e => e.status === 'ACTIVE');
  const completedCourses = filteredEnrollments.filter(e => e.status === 'COMPLETED');
  const pausedCourses = filteredEnrollments.filter(e => e.status === 'PAUSED');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'PAUSED':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return <Badge variant="secondary" className="bg-green-50 text-green-700">Beginner</Badge>;
      case 'INTERMEDIATE':
        return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">Intermediate</Badge>;
      case 'ADVANCED':
        return <Badge variant="secondary" className="bg-red-50 text-red-700">Advanced</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleContinueLearning = (enrollment: CourseEnrollment) => {
    // Navigate to the course detail page with the enrollment ID
    navigate(`/student-dashboard/courses/${enrollment.programmeId}?enrollmentId=${enrollment.id}`);
  };

  const handleViewCourse = (enrollment: CourseEnrollment) => {
    navigate(`/student-dashboard/courses/${enrollment.programmeId}?enrollmentId=${enrollment.id}`);
  };

  const handleStatusUpdate = async (enrollmentId: string, newStatus: 'ACTIVE' | 'COMPLETED' | 'PAUSED') => {
    try {
      await updateStatus(enrollmentId, newStatus);
      toast({
        title: "Status Updated",
        description: `Course moved to ${newStatus.toLowerCase()} category`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update course status",
        variant: "destructive",
      });
    }
  };



  const formatLastActivity = (date?: string) => {
    if (!date) return 'Not started';
    const lastActivity = new Date(date);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eduBlue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your courses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    const isAuthError = (error as any)?.response?.status === 401 || (error as any)?.response?.status === 403;
    
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            {isAuthError ? (
              <>
                <p className="text-orange-600 mb-4">Please log in to view your courses</p>
                <Button onClick={() => navigate('/login')}>Go to Login</Button>
              </>
            ) : (
              <>
                <p className="text-red-600 mb-4">Failed to load courses</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Courses</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Continue your learning journey
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button onClick={() => navigate('/programs')}>
              Browse More Courses
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-eduBlue-600">{enrollments.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeCourses.length} active courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedCourses.length}</div>
              <p className="text-xs text-muted-foreground">
                {enrollments.length > 0 ? Math.round((completedCourses.length / enrollments.length) * 100) : 0}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-eduOrange-600">
                {formatDuration(enrollments.reduce((total, e) => total + (e.progress.timeSpent || 0), 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Time spent learning
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {enrollments.length > 0 ? Math.round(enrollments.reduce((total, e) => total + (e.progress.totalProgress || 0), 0) / enrollments.length) : 0}%
              </div>
              <Progress 
                value={enrollments.length > 0 ? enrollments.reduce((total, e) => total + (e.progress.totalProgress || 0), 0) / enrollments.length : 0} 
                className="mt-2" 
              />
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Programming">Programming</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Course Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active ({activeCourses.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCourses.length})</TabsTrigger>
            <TabsTrigger value="paused">Paused ({pausedCourses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeCourses.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No active courses</h3>
                  <p className="text-gray-600">
                    Enroll in a course to get started!
                  </p>
                  <Button onClick={() => navigate('/programs')} className="mt-4">
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeCourses.map((enrollment) => {
                  // Add defensive check for programme data
                  if (!enrollment.programme) {
                    console.warn('Enrollment missing programme data:', enrollment);
                    return null;
                  }

                  return (
                    <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{enrollment.programme.title || 'Unknown Course'}</CardTitle>
                            <p className="text-gray-600 text-sm mb-3">
                              {enrollment.programme.description || 'No description available'}
                            </p>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(enrollment.status)}
                              {getLevelBadge(enrollment.programme.level)}
                            </div>
                          </div>
                          {enrollment.programme.thumbnail && (
                            <img
                              src={enrollment.programme.thumbnail}
                              alt={enrollment.programme.title || 'Course thumbnail'}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(enrollment.progress.totalProgress)}%</span>
                          </div>
                          <Progress value={enrollment.progress.totalProgress} />
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-eduBlue-600">
                              {enrollment.progress.completedLessons.length}
                            </div>
                            <div className="text-gray-500">Lessons</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-eduOrange-600">
                              {formatDuration(enrollment.progress.timeSpent)}
                            </div>
                            <div className="text-gray-500">Time</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-600">
                              {enrollment.programme.totalModules || 0}
                            </div>
                            <div className="text-gray-500">Modules</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleContinueLearning(enrollment)}
                            className="flex-1"
                            disabled={statusUpdateLoading}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Continue Learning
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewCourse(enrollment)}>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                View Course
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(enrollment.id, 'PAUSED')}>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause Course
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(enrollment.id, 'COMPLETED')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Completed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Last Activity */}
                        {enrollment.progress.lastActivityDate && (
                          <div className="text-xs text-gray-500">
                            Last activity: {formatLastActivity(enrollment.progress.lastActivityDate)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedCourses.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No completed courses yet</h3>
                  <p className="text-gray-600">
                    Complete your first course to see it here!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completedCourses.map((enrollment) => {
                  // Add defensive check for programme data
                  if (!enrollment.programme) {
                    console.warn('Enrollment missing programme data:', enrollment);
                    return null;
                  }

                  return (
                    <Card key={enrollment.id} className="border-green-200 bg-green-50/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2 flex items-center gap-2">
                              {enrollment.programme.title || 'Unknown Course'}
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </CardTitle>
                            <p className="text-gray-600 text-sm mb-3">
                              {enrollment.programme.description || 'No description available'}
                            </p>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(enrollment.status)}
                              {getLevelBadge(enrollment.programme.level)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div className="text-center">
                            <div className="font-semibold text-green-600">
                              {formatDuration(enrollment.progress.timeSpent)}
                            </div>
                            <div className="text-gray-500">Total Time</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-600">
                              {enrollment.progress.completedLessons.length}
                            </div>
                            <div className="text-gray-500">Lessons Completed</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => handleViewCourse(enrollment)}
                            className="flex-1"
                            disabled={statusUpdateLoading}
                          >
                            View Certificate
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusUpdate(enrollment.id, 'ACTIVE')}>
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Resume Course
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(enrollment.id, 'PAUSED')}>
                                <Pause className="h-4 w-4 mr-2" />
                                Move to Paused
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="paused" className="space-y-6">
            {pausedCourses.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No paused courses</h3>
                  <p className="text-gray-600">
                    All your courses are active!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pausedCourses.map((enrollment) => {
                  // Add defensive check for programme data
                  if (!enrollment.programme) {
                    console.warn('Enrollment missing programme data:', enrollment);
                    return null;
                  }

                  return (
                    <Card key={enrollment.id} className="border-yellow-200 bg-yellow-50/50">
                      <CardHeader>
                        <CardTitle className="text-lg mb-2">{enrollment.programme.title || 'Unknown Course'}</CardTitle>
                        <p className="text-gray-600 text-sm mb-3">
                          {enrollment.programme.description || 'No description available'}
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(enrollment.status)}
                          {getLevelBadge(enrollment.programme.level)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(enrollment.progress.totalProgress)}%</span>
                          </div>
                          <Progress value={enrollment.progress.totalProgress} />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleContinueLearning(enrollment)}
                            className="flex-1"
                            disabled={statusUpdateLoading}
                          >
                            Resume Learning
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusUpdate(enrollment.id, 'ACTIVE')}>
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Activate Course
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(enrollment.id, 'COMPLETED')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Completed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MyCoursesPage; 