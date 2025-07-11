import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Brain, Megaphone, Bot, Database, FlaskConical, GraduationCap, Users, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContextUtils';
import { useEnrollment } from '@/hooks/useCourseProgress';
import EnrollmentSuccessModal from '@/components/enrollment/EnrollmentSuccessModal';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  slug: string;
  imageUrl?: string;
  isActive: boolean;
  totalModules: number;
  totalLessons: number;
  estimatedDuration: number;
  price: number;
  currency: string;
}

const ProgramsPage = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { enrollInCourse, loading: enrollLoading, error: enrollError } = useEnrollment();
  const queryClient = useQueryClient();

  // Fetch all courses from backend
  const { data: coursesData, isLoading: coursesLoading, error: coursesError, refetch: refetchCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      console.log('Fetching courses from /api/courses...');
      const response = await axios.get('/api/courses');
      console.log('API response:', response);
      console.log('API response data:', response.data);
      console.log('API response data.data:', response.data.data);
      if (response.data.data && response.data.data.length > 0) {
        console.log('First course from API:', response.data.data[0]);
        console.log('First course keys:', Object.keys(response.data.data[0]));
      }
      return response.data;
    },
    staleTime: 30 * 1000, // Reduced to 30 seconds for more frequent updates
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 60 * 1000, // Refetch every minute when page is visible
  });

  // Refetch courses on window focus to ensure up-to-date status after admin toggles
  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      refetchCourses();
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        refetchCourses();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient, refetchCourses]);

  const courses = useMemo(() => coursesData?.data || [], [coursesData?.data]);

  // Debug: Log course statuses
  useEffect(() => {
    if (courses.length > 0) {
      console.log('Current courses status:', courses.map(c => ({ 
        title: c.title, 
        isActive: c.isActive,
        id: c.id,
        hasId: !!c.id,
        fullCourse: c
      })));
      
      // Log the raw courses data to see all fields
      console.log('Raw courses data:', courses);
      console.log('First course keys:', Object.keys(courses[0] || {}));
      console.log('First course full object:', courses[0]);
    }
  }, [courses]);

  const handleRefreshCourses = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['courses'] });
      await refetchCourses();
      toast({
        title: "Courses Updated",
        description: "Course list has been refreshed successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get icon for course category
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'communication':
      case 'professional_skills':
        return Users;
      case 'digital_marketing':
      case 'marketing':
        return Megaphone;
      case 'ai':
      case 'artificial_intelligence':
        return Brain;
      case 'data':
      case 'data_analytics':
        return Database;
      case 'bioskills':
      case 'biology':
        return FlaskConical;
      case 'decision_making':
      case 'critical_thinking':
        return Lightbulb;
      case 'mathematics':
      case 'math':
        return GraduationCap;
      case 'job_search':
      case 'career':
        return GraduationCap;
      default:
        return Users;
    }
  };

  // Get gradient class for course
  const getGradientClass = (category: string) => {
    switch (category.toLowerCase()) {
      case 'communication':
      case 'professional_skills':
        return "from-eduBlue-100 to-eduBlue-50";
      case 'digital_marketing':
      case 'marketing':
        return "from-eduOrange-100 to-eduOrange-50";
      case 'ai':
      case 'artificial_intelligence':
        return "from-eduBlue-100 to-eduBlue-50";
      case 'data':
      case 'data_analytics':
        return "from-eduBlue-100 to-eduBlue-50";
      case 'bioskills':
      case 'biology':
        return "from-eduOrange-100 to-eduOrange-50";
      case 'decision_making':
      case 'critical_thinking':
        return "from-eduBlue-100 to-eduBlue-50";
      case 'mathematics':
      case 'math':
        return "from-eduOrange-100 to-eduOrange-50";
      case 'job_search':
      case 'career':
        return "from-eduBlue-100 to-eduBlue-50";
      default:
        return "from-eduBlue-100 to-eduBlue-50";
    }
  };

  const handleEnrollNow = async (course: Course) => {
    console.log('handleEnrollNow called with course:', course);
    console.log('Course ID:', course.id);
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in this course.",
        variant: "destructive",
      });
      navigate('/login', { state: { from: '/programs' } });
      return;
    }

    if (!course.id) {
      console.error('Course ID is missing!', course);
      toast({
        title: "Enrollment Failed",
        description: "Course ID is missing. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setEnrollmentLoading(true);
      setSelectedCourse(course);
      
      console.log('About to call enrollInCourse with:', course.id);
      const result = await enrollInCourse(course.id);
      console.log('Enrollment result:', result);
      
      setIsAlreadyEnrolled(false);
      setShowSuccessModal(true);
      
      toast({
        title: "Enrollment Successful!",
        description: `You've been enrolled in ${course.title}`,
      });
    } catch (error: unknown) {
      console.error('Enrollment error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      if (errorMessage.includes('Already enrolled')) {
        setIsAlreadyEnrolled(true);
        setShowSuccessModal(true);
        toast({
          title: "Already Enrolled",
          description: "You're already enrolled in this course. Check your dashboard to continue learning.",
          variant: "default",
        });
      } else {
        toast({
          title: "Enrollment Failed",
          description: errorMessage || "Failed to enroll in the course. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleLearnMore = (course: Course) => {
    navigate(`/programs/${course.slug}`);
  };

  if (coursesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eduBlue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading programs...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (coursesError) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load programs</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16">
          {/* Background element with #0e2545 color */}
          <div 
            className="absolute inset-0 bg-[#0e2545] z-0"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)',
              height: 'calc(100% - 100px)'
            }}
          />
          
          <div className="edu-container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="heading-1 mb-6 text-white">
                Our Skill-Building Programs
              </h1>
              <p className="text-xl text-gray-200 mb-8">
                At EduKnit, we believe students shouldn't have to choose between academic preparation and
                career development.
              </p>
              
              {/* Orange highlighted section */}
              <div className="bg-[#f57920] p-5 rounded-lg">
                <p className="text-lg text-white font-medium">
                  Every program is flexible, beginner-friendly, and career-focused — built to give you a head-start
                  while others are still waiting for results.
                </p>
              </div>
              
              {/* Refresh Button */}
              <div className="mt-6">
                <Button
                  onClick={handleRefreshCourses}
                  disabled={isRefreshing || coursesLoading}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                  {isRefreshing ? "Refreshing..." : "Refresh Courses"}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Programs Grid */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="edu-container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course: Course, index: number) => {
                const IconComponent = getCategoryIcon(course.category);
                const gradientClass = getGradientClass(course.category);
                
                return (
                  <Card
                    key={`course-${course.id}-${index}`}
                    style={{
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: "60px",
                      borderBottomLeftRadius: "60px",
                      borderBottomRightRadius: 0,
                    }}
                    className={cn(
                      "group transition-all duration-300 overflow-hidden border-2 shadow-md transform hover:scale-105",
                      !course.isActive && "opacity-75 pointer-events-none",
                      gradientClass.includes("eduBlue")
                        ? "border-[#0e2445]"
                        : "border-[#f57920]",
                      "hover:bg-[#f57920]"
                    )}
                  >
                    {/* Top Gradient Strip */}
                    <div className={cn("h-2 w-full bg-gradient-to-r", gradientClass)} />

                    {/* Image */}
                    {course.imageUrl && (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-48 object-cover"
                      />
                    )}

                    {/* Card Header */}
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            gradientClass.includes("eduBlue")
                              ? "bg-eduBlue-100 text-eduBlue-600"
                              : "bg-eduOrange-100 text-eduOrange-600",
                            "group-hover:bg-white group-hover:text-[#f57920]"
                          )}
                        >
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold flex items-center gap-2 group-hover:text-white">
                            {course.title}
                            {!course.isActive && (
                              <span className="text-sm font-normal px-2 py-1 bg-eduOrange-100 text-eduOrange-600 rounded">
                                Coming Soon
                              </span>
                            )}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Card Content */}
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-300 group-hover:text-white">
                        {course.description}
                      </p>
                      
                      {/* Course Stats */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {[
                          { icon: "📚", label: `${course.totalModules} Modules`, id: "modules" },
                          { icon: "🎯", label: `${course.totalLessons} Lessons`, id: "lessons" },
                          { icon: "⏱️", label: `${course.estimatedDuration} min`, id: "duration" },
                          { icon: "📊", label: course.level, id: "level" }
                        ].map((stat) => (
                          <div key={`${course.id}-${stat.id}`} className="flex items-center text-gray-600 dark:text-gray-300 group-hover:text-white">
                            <span className="mr-2">{stat.icon}</span>
                            {stat.label}
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        <Button
                          className={cn(
                            "flex-1 transition-colors duration-300 font-semibold",
                            "bg-[#0e2445] text-white group-hover:bg-white group-hover:text-[#f57920]"
                          )}
                          disabled={!course.isActive || enrollmentLoading}
                          onClick={() => handleEnrollNow(course)}
                        >
                          {enrollmentLoading ? "Enrolling..." : "Enroll Now"}
                        </Button>
                        
                        <Button
                          variant="outline"
                          className={cn(
                            "transition-colors duration-300",
                            "border-[#0e2445] text-[#0e2445] group-hover:border-white group-hover:text-white"
                          )}
                          disabled={!course.isActive}
                          onClick={() => handleLearnMore(course)}
                        >
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Enrollment Success Modal */}
      {selectedCourse && (
        <EnrollmentSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setSelectedCourse(null);
            setIsAlreadyEnrolled(false);
          }}
          courseTitle={selectedCourse.title}
          courseSlug={selectedCourse.slug}
          isAlreadyEnrolled={isAlreadyEnrolled}
        />
      )}
    </Layout>
  );
};

export default ProgramsPage;
