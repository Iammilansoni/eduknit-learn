
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Video, Clock, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string | number;
  title: string;
  progress: number;
  instructor: string;
  nextLesson: string;
  image: string;
  status: string;
  lastAccessed: string;
  nextSessionDate?: string;
  zoomLink?: string;
  path?: string;
  // Enhanced properties for better integration
  programmeId?: string;
  enrollmentId?: string;
  totalModules?: number;
  totalLessons?: number;
  completedModules?: number;
  completedLessons?: number;
  estimatedDuration?: number;
  category?: string;
  level?: string;
  enrollmentDate?: string;
}

interface CourseListProps {
  courses: Course[];
  onContinueLearning?: (courseId: string | number) => void;
  showEnrollmentDate?: boolean;
  showCourseStats?: boolean;
}

const renderStatusBadge = (status: string) => {
  switch (status) {
    case 'In Progress':
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{status}</Badge>;
    case 'Almost Complete':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{status}</Badge>;
    case 'Completed':
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">{status}</Badge>;
    case 'Not Started':
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

const CourseList: React.FC<CourseListProps> = ({ 
  courses, 
  onContinueLearning,
  showEnrollmentDate = false,
  showCourseStats = true
}) => {
  const navigate = useNavigate();
  
  const handleContinueLearning = (course: Course) => {
    // If there's a custom path defined for the course, navigate to it
    if (course.path) {
      navigate(course.path);
    } else if (course.programmeId) {
      // Navigate to the course detail page with enrollment ID
      const url = course.enrollmentId 
        ? `/student-dashboard/courses/${course.programmeId}?enrollmentId=${course.enrollmentId}`
        : `/student-dashboard/courses/${course.programmeId}`;
      navigate(url);
    } else if (onContinueLearning) {
      onContinueLearning(course.id);
    }
  };

  const handleViewCourse = (course: Course) => {
    if (course.programmeId) {
      const url = course.enrollmentId 
        ? `/student-dashboard/courses/${course.programmeId}?enrollmentId=${course.enrollmentId}`
        : `/student-dashboard/courses/${course.programmeId}`;
      navigate(url);
    }
  };
  
  return (
    <div className="grid grid-cols-1 gap-6">
      {courses.map((course, index) => (
        <Card key={course.id || `course-${index}`} className="overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 h-48 md:h-auto bg-gray-200 dark:bg-gray-700 relative">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to a placeholder image
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
              <div className="absolute top-2 left-2">
                {renderStatusBadge(course.status)}
              </div>
              {course.category && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {course.category}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex flex-col flex-1">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{course.title}</CardTitle>
                    <CardDescription className="text-sm">{course.instructor}</CardDescription>
                    {showEnrollmentDate && course.enrollmentDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Enrolled: {formatDate(course.enrollmentDate)}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Last accessed: {formatDate(course.lastAccessed)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2 flex-grow">
                <div className="space-y-4">
                  {/* Progress Section */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {course.progress}% Complete
                      </span>
                    </div>
                    <Progress 
                      value={course.progress} 
                      className="h-2 bg-gray-200 dark:bg-gray-700" 
                    />
                  </div>

                  {/* Course Stats */}
                  {showCourseStats && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {course.totalModules && (
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-eduBlue-500" />
                          <div>
                            <p className="font-medium">Modules</p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {course.completedModules || 0}/{course.totalModules}
                            </p>
                          </div>
                        </div>
                      )}
                      {course.totalLessons && (
                        <div className="flex items-center space-x-2">
                          <Video className="h-4 w-4 text-eduOrange-500" />
                          <div>
                            <p className="font-medium">Lessons</p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {course.completedLessons || 0}/{course.totalLessons}
                            </p>
                          </div>
                        </div>
                      )}
                      {course.estimatedDuration && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="font-medium">Duration</p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {formatDuration(course.estimatedDuration)}
                            </p>
                          </div>
                        </div>
                      )}
                      {course.level && (
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 rounded-full bg-purple-500" />
                          <div>
                            <p className="font-medium">Level</p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {course.level}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Next Lesson */}
                  <div className="flex items-start space-x-2">
                    <ArrowRight className="h-5 w-5 text-eduBlue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Next Lesson:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{course.nextLesson}</p>
                    </div>
                  </div>

                  {/* Next Live Session */}
                  {course.nextSessionDate && (
                    <div className="flex items-start space-x-2">
                      <Calendar className="h-5 w-5 text-eduOrange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Next Live Session:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(course.nextSessionDate)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2 pt-0">
                <Button 
                  className="flex-1 bg-eduBlue-500 hover:bg-eduBlue-600"
                  onClick={() => handleContinueLearning(course)}
                >
                  <BookOpen className="mr-2 h-4 w-4" /> Continue Learning
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-eduBlue-500 text-eduBlue-500 hover:bg-eduBlue-50 dark:hover:bg-eduBlue-900/20"
                  onClick={() => handleViewCourse(course)}
                >
                  View Course
                </Button>
                {course.zoomLink && (
                  <Button
                    variant="outline"
                    className="flex-1 border-eduOrange-500 text-eduOrange-500 hover:bg-eduOrange-50 dark:hover:bg-eduOrange-900/20"
                    onClick={() => window.open(course.zoomLink, '_blank')}
                  >
                    <Video className="mr-2 h-4 w-4" /> Join Live Session
                  </Button>
                )}
              </CardFooter>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CourseList;
