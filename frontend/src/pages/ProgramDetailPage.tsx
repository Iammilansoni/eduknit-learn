import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Star,
  CheckCircle,
  Play,
  Target,
  Award,
  Calendar,
  MapPin,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextUtils';
import { useEnrollment } from '@/hooks/useCourseProgress';
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
  instructor?: string;
  overview?: string;
  skills?: string[];
  prerequisites?: string[];
}

const ProgramDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { enrollInCourse, loading: enrollLoading } = useEnrollment();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch course by slug
  const { data: courseData, isLoading, error } = useQuery({
    queryKey: ['course-by-slug', slug],
    queryFn: async () => {
      const response = await axios.get(`/api/courses/slug/${slug}`);
      return response.data.data;
    },
    enabled: !!slug,
  });

  const course = courseData as Course;

  const handleEnrollNow = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in this course.",
        variant: "destructive",
      });
      navigate('/login', { state: { from: `/programs/${slug}` } });
      return;
    }

    try {
      await enrollInCourse(course.id);
      toast({
        title: "Enrollment Successful!",
        description: `You've been enrolled in ${course.title}`,
      });
      navigate('/student-dashboard/courses');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to enroll in the course';
      if (errorMessage.includes('Already enrolled')) {
        toast({
          title: "Already Enrolled",
          description: "You're already enrolled in this course. Check your dashboard to continue learning.",
          variant: "default",
        });
        navigate('/student-dashboard/courses');
      } else {
        toast({
          title: "Enrollment Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'communication':
      case 'professional_skills':
        return Users;
      case 'digital_marketing':
      case 'marketing':
        return Target;
      case 'ai':
      case 'artificial_intelligence':
        return Award;
      case 'data':
      case 'data_analytics':
        return BookOpen;
      case 'bioskills':
      case 'biology':
        return GraduationCap;
      case 'decision_making':
      case 'critical_thinking':
        return Target;
      default:
        return BookOpen;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return <Badge className="bg-green-100 text-green-800">Beginner</Badge>;
      case 'intermediate':
        return <Badge className="bg-yellow-100 text-yellow-800">Intermediate</Badge>;
      case 'advanced':
        return <Badge className="bg-red-100 text-red-800">Advanced</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eduBlue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !course) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Course Not Found</h2>
            <p className="text-gray-600 mb-4">The course you are looking for does not exist or is not currently available. It may have been removed or is not yet active.</p>
            <Button onClick={() => navigate('/programs')}>Back to Programs</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const IconComponent = getCategoryIcon(course.category);

  return (
    <Layout>
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-[#0e2445] text-white">
          <div className="edu-container py-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/programs')}
              className="text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Programs
            </Button>
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Course Image */}
              <div className="lg:w-1/3">
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-eduBlue-100 to-eduBlue-200 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-16 w-16 text-eduBlue-600" />
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="lg:w-2/3">
                <div className="flex items-center gap-2 mb-4">
                  {getLevelBadge(course.level)}
                  <Badge variant="outline" className="text-white border-white/30">
                    {course.category.replace('_', ' ')}
                  </Badge>
                </div>

                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-xl text-gray-200 mb-6">{course.description}</p>

                {/* Course Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{course.totalModules}</div>
                    <div className="text-sm text-gray-300">Modules</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{course.totalLessons}</div>
                    <div className="text-sm text-gray-300">Lessons</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{course.estimatedDuration}</div>
                    <div className="text-sm text-gray-300">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{course.instructor || 'EduKnit'}</div>
                    <div className="text-sm text-gray-300">Instructor</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleEnrollNow}
                    disabled={!course.isActive || enrollLoading}
                    className="bg-[#f57920] hover:bg-[#e06a1a] text-white px-8 py-3 text-lg"
                  >
                    {enrollLoading ? "Enrolling..." : "Enroll Now"}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg"
                    onClick={() => setActiveTab('curriculum')}
                  >
                    View Curriculum
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="edu-container py-16">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About This Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {course.overview || course.description}
                  </p>
                </CardContent>
              </Card>

              {course.skills && course.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>What You'll Learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {course.prerequisites && course.prerequisites.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Prerequisites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {course.prerequisites.map((prereq, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                          <span>{prereq}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="curriculum" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                  <p className="text-gray-600">
                    {course.totalModules} modules • {course.totalLessons} lessons • {course.estimatedDuration} minutes
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-eduBlue-600" />
                        <div>
                          <h4 className="font-medium">Course Introduction</h4>
                          <p className="text-sm text-gray-600">Get started with the basics</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">1 lesson</div>
                        <div className="text-sm text-gray-600">5 min</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Play className="h-5 w-5 text-eduBlue-600" />
                        <div>
                          <h4 className="font-medium">Core Concepts</h4>
                          <p className="text-sm text-gray-600">Learn the fundamental principles</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{course.totalLessons - 1} lessons</div>
                        <div className="text-sm text-gray-600">{course.estimatedDuration - 5} min</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">Duration</div>
                          <div className="text-sm text-gray-600">{course.estimatedDuration} minutes</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">Modules</div>
                          <div className="text-sm text-gray-600">{course.totalModules} modules</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Play className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">Lessons</div>
                          <div className="text-sm text-gray-600">{course.totalLessons} lessons</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">Instructor</div>
                          <div className="text-sm text-gray-600">{course.instructor || 'EduKnit Team'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">Level</div>
                          <div className="text-sm text-gray-600">{course.level}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">Category</div>
                          <div className="text-sm text-gray-600">{course.category.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ProgramDetailPage; 