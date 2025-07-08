import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  Play, 
  CheckCircle, 
  BarChart3,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';
import { courseEnrollmentApi, UserCourse } from '@/services/courseEnrollmentApi';
import { useToast } from '@/hooks/use-toast';

const MyCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const enrolledCourses = await courseEnrollmentApi.getMyCourses();
        setCourses(enrolledCourses);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch enrolled courses';
        setError(errorMessage);
        console.error('Error fetching courses:', err);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, [toast]);

  const fetchMyCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const enrolledCourses = await courseEnrollmentApi.getMyCourses();
      setCourses(enrolledCourses);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch enrolled courses';
      setError(errorMessage);
      console.error('Error fetching courses:', err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'ENROLLED':
        return 'bg-yellow-500';
      case 'PAUSED':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'ENROLLED':
        return 'Not Started';
      case 'PAUSED':
        return 'Paused';
      default:
        return status;
    }
  };

  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Courses</h1>
            <p className="text-muted-foreground">Track your learning progress and continue your courses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-80">
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Courses</h1>
            <p className="text-muted-foreground">Track your learning progress and continue your courses</p>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Courses</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchMyCourses}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Empty state
  if (courses.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Courses</h1>
            <p className="text-muted-foreground">Track your learning progress and continue your courses</p>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Enrolled</h3>
              <p className="text-muted-foreground mb-4">
                Start your learning journey by enrolling in your first course
              </p>
              <Button asChild>
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Courses list
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">My Courses</h1>
            <p className="text-muted-foreground">Track your learning progress and continue your courses</p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-eduOrange-500">{courses.length}</div>
            <div className="text-sm text-muted-foreground">Enrolled Courses</div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {courses.filter(c => c.status === 'COMPLETED').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {courses.filter(c => c.status === 'IN_PROGRESS').length}
                  </div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {formatStudyTime(courses.reduce((acc, c) => acc + c.studyTime, 0))}
                  </div>
                  <div className="text-xs text-muted-foreground">Study Time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {courses.reduce((acc, c) => acc + c.analytics.totalPoints, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Points</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((userCourse) => (
            <Card key={userCourse.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {userCourse.course?.title || 'Course Title'}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {userCourse.course?.category || 'Category'}
                      </Badge>
                      <Badge 
                        className={`text-xs text-white ${getStatusColor(userCourse.status)}`}
                      >
                        {getStatusText(userCourse.status)}
                      </Badge>
                    </div>
                  </div>
                  {userCourse.course?.imageUrl && (
                    <img 
                      src={userCourse.course.imageUrl} 
                      alt={userCourse.course.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{Math.round(userCourse.progressPercent)}%</span>
                  </div>
                  <Progress value={userCourse.progressPercent} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatStudyTime(userCourse.studyTime)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(userCourse.enrolledAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span>{userCourse.analytics.streakDays}d streak</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>{userCourse.analytics.totalPoints} pts</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button asChild className="w-full">
                  <Link to={`/courses/${userCourse.courseId}`}>
                    {userCourse.status === 'COMPLETED' ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Review Course
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Continue Learning
                      </>
                    )}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyCoursesPage;
