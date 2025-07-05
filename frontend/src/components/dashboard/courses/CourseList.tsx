
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: number;
  title: string;
  progress: number;
  instructor: string;
  nextLesson: string;
  image: string;
  status: string;
  lastAccessed: string;
  nextSessionDate?: string;
  zoomLink?: string;
  path?: string; // Added path property for direct navigation
}

interface CourseListProps {
  courses: Course[];
  onContinueLearning?: (courseId: number) => void;
}

const renderStatusBadge = (status: string) => {
  switch (status) {
    case 'In Progress':
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{status}</Badge>;
    case 'Almost Complete':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{status}</Badge>;
    case 'Completed':
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">{status}</Badge>;
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

const CourseList: React.FC<CourseListProps> = ({ courses, onContinueLearning }) => {
  const navigate = useNavigate();
  
  const handleContinueLearning = (course: Course) => {
    // If there's a custom path defined for the course, navigate to it
    if (course.path) {
      navigate(course.path);
    } else if (onContinueLearning) {
      onContinueLearning(course.id);
    }
  };
  
  return (
    <div className="grid grid-cols-1 gap-6">
      {courses.map(course => (
        <Card key={course.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 h-48 md:h-auto bg-gray-200 dark:bg-gray-700 relative">
              <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2">
                {renderStatusBadge(course.status)}
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-1">{course.title}</CardTitle>
                    <CardDescription className="text-sm">{course.instructor}</CardDescription>
                  </div>
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    Last accessed: {course.lastAccessed}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2 flex-grow">
                <div className="space-y-4">
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
                  <div className="flex items-start space-x-2">
                    <BookOpen className="h-5 w-5 text-eduBlue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Next Lesson:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{course.nextLesson}</p>
                    </div>
                  </div>
                  {course.nextSessionDate && (
                    <div className="flex items-start space-x-2">
                      <Video className="h-5 w-5 text-eduOrange-500 flex-shrink-0 mt-0.5" />
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
