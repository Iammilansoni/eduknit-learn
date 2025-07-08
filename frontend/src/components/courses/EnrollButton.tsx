import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertCircle, Play } from 'lucide-react';
import { courseEnrollmentApi, UserCourse } from '@/services/courseEnrollmentApi';
import { useToast } from '@/hooks/use-toast';

interface EnrollButtonProps {
  courseId: string;
  courseName?: string;
  className?: string;
  onEnrollmentChange?: (enrolled: boolean, userCourse?: UserCourse) => void;
}

const EnrollButton: React.FC<EnrollButtonProps> = ({
  courseId,
  courseName = 'course',
  className = '',
  onEnrollmentChange
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userCourse, setUserCourse] = useState<UserCourse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check enrollment status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setIsCheckingStatus(true);
        setError(null);
        const result = await courseEnrollmentApi.checkEnrollmentStatus(courseId);
        setIsEnrolled(result.isEnrolled);
        setUserCourse(result.userCourse || null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to check enrollment status';
        setError(errorMessage);
        console.error('Error checking enrollment status:', err);
      } finally {
        setIsCheckingStatus(false);
      }
    };
    
    checkStatus();
  }, [courseId]);

  const checkEnrollmentStatus = async () => {
    try {
      setIsCheckingStatus(true);
      setError(null);
      const result = await courseEnrollmentApi.checkEnrollmentStatus(courseId);
      setIsEnrolled(result.isEnrolled);
      setUserCourse(result.userCourse || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check enrollment status';
      setError(errorMessage);
      console.error('Error checking enrollment status:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const enrolledCourse = await courseEnrollmentApi.enrollInCourse(courseId);
      
      setIsEnrolled(true);
      setUserCourse(enrolledCourse);
      
      toast({
        title: "Enrollment Successful! 🎉",
        description: `You've successfully enrolled in ${courseName}. Let's start learning!`,
        duration: 5000,
      });

      // Notify parent component of enrollment change
      onEnrollmentChange?.(true, enrolledCourse);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enroll in course';
      setError(errorMessage);
      
      toast({
        title: "Enrollment Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking enrollment
  if (isCheckingStatus) {
    return (
      <Button disabled className={`flex-1 ${className}`}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking...
      </Button>
    );
  }

  // Show error state if there's an error
  if (error && !isEnrolled) {
    return (
      <Button 
        variant="destructive" 
        onClick={checkEnrollmentStatus}
        className={`flex-1 ${className}`}
      >
        <AlertCircle className="mr-2 h-4 w-4" />
        Retry
      </Button>
    );
  }

  // Show enrolled state with continue learning button
  if (isEnrolled && userCourse) {
    return (
      <Button 
        className={`flex-1 bg-eduOrange-500 hover:bg-eduOrange-600 ${className}`}
        onClick={() => {
          // Navigate to course content or continue learning
          // This could be handled by parent component
          onEnrollmentChange?.(true, userCourse);
        }}
      >
        {userCourse.status === 'COMPLETED' ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Course Completed
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Continue Learning ({Math.round(userCourse.progressPercent)}%)
          </>
        )}
      </Button>
    );
  }

  // Show enroll button for non-enrolled users
  return (
    <Button
      onClick={handleEnroll}
      disabled={isLoading}
      className={`flex-1 bg-eduOrange-500 hover:bg-eduOrange-600 ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enrolling...
        </>
      ) : (
        <>
          <Check className="mr-2 h-4 w-4" />
          Enroll Now
        </>
      )}
    </Button>
  );
};

export default EnrollButton;
