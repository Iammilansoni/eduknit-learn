import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
  TrendingUp, 
  Target, 
  Award,
  PlayCircle,
  BarChart3,
  Users
} from 'lucide-react';

// Import progress components
import CourseProgressTracker from '@/components/progress/CourseProgressTracker';
import LessonProgressBar from '@/components/progress/LessonProgressBar';
import QuizProgressTracker from '@/components/progress/QuizProgressTracker';
import ProgressDashboard from '@/components/progress/ProgressDashboard';
import { useProgressTracking } from '@/hooks/useProgressTracking';

const ProgressTestPage: React.FC = () => {
  const [courseId, setCourseId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [activeTab, setActiveTab] = useState('course-tracker');
  
  const { markLessonCompleted, updateLessonProgress, recordQuizResult } = useProgressTracking();

  // Sample quiz questions for testing
  const sampleQuizQuestions = [
    {
      id: 'q1',
      question: 'What is the main purpose of progress tracking?',
      type: 'single' as const,
      options: [
        'To monitor student engagement',
        'To calculate final grades',
        'To track learning progress and provide feedback',
        'To measure time spent'
      ],
      correctAnswer: 'To track learning progress and provide feedback',
      points: 10,
      explanation: 'Progress tracking helps monitor learning and provide valuable feedback.'
    },
    {
      id: 'q2',
      question: 'Which metrics are important for progress tracking?',
      type: 'multiple' as const,
      options: [
        'Completion percentage',
        'Time spent',
        'Quiz scores',
        'Login frequency',
        'Number of clicks'
      ],
      correctAnswer: ['Completion percentage', 'Time spent', 'Quiz scores'],
      points: 15,
      explanation: 'Key metrics focus on learning outcomes and engagement.'
    }
  ];

  // Sample test data - replace with actual IDs from your database
  const testData = {
    sampleCourseId: '60d5ecb74f94a0001f5e4567', // Replace with actual course ID
    sampleLessonId: '60d5ecb74f94a0001f5e4568', // Replace with actual lesson ID
    sampleStudentId: '60d5ecb74f94a0001f5e4569', // Replace with actual student ID
  };

  const handleTestMarkComplete = async () => {
    if (!lessonId) {
      alert('Please enter a lesson ID');
      return;
    }
    
    try {
      await markLessonCompleted(lessonId, 30); // 30 minutes spent
      alert('Lesson marked as completed!');
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      alert('Error marking lesson complete');
    }
  };

  const handleTestUpdateProgress = async () => {
    if (!lessonId) {
      alert('Please enter a lesson ID');
      return;
    }
    
    try {
      await updateLessonProgress(lessonId, 75, 20, 15); // 75%, 20 min spent, 15 min video
      alert('Lesson progress updated to 75%!');
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Error updating progress');
    }
  };

  const handleTestQuizResult = async () => {
    if (!lessonId) {
      alert('Please enter a lesson ID');
      return;
    }
    
    try {
      await recordQuizResult(lessonId, {
        score: 85,
        maxScore: 100,
        passingScore: 70,
        timeSpent: 10,
        quizId: 'test-quiz'
      });
      alert('Quiz result recorded: 85/100!');
    } catch (error) {
      console.error('Error recording quiz result:', error);
      alert('Error recording quiz result');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-eduBlue-800 mb-2">
          Progress Feature Testing
        </h1>
        <p className="text-gray-600">
          Test all progress tracking components and functionality
        </p>
      </div>

      {/* Test Data Input Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Test Data Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="courseId">Course ID</Label>
              <Input
                id="courseId"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder={testData.sampleCourseId}
              />
            </div>
            <div>
              <Label htmlFor="lessonId">Lesson ID</Label>
              <Input
                id="lessonId"
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                placeholder={testData.sampleLessonId}
              />
            </div>
            <div>
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder={testData.sampleStudentId}
              />
            </div>
          </div>

          <Alert className="mb-4">
            <AlertDescription>
              Replace the placeholder values with actual IDs from your database. 
              You can find these in your MongoDB collection or through your API endpoints.
            </AlertDescription>
          </Alert>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleTestMarkComplete} className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Test Mark Complete
            </Button>
            <Button onClick={handleTestUpdateProgress} variant="outline" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Test Update Progress
            </Button>
            <Button onClick={handleTestQuizResult} variant="outline" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Test Quiz Result
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Components Testing */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="course-tracker" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Course Progress
          </TabsTrigger>
          <TabsTrigger value="lesson-progress" className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4" />
            Lesson Progress
          </TabsTrigger>
          <TabsTrigger value="quiz-tracker" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Quiz Progress
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="course-tracker" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress Tracker</CardTitle>
              <p className="text-sm text-gray-600">
                Shows detailed course progress with modules and lessons
              </p>
            </CardHeader>
            <CardContent>
              {courseId || testData.sampleCourseId ? (
                <CourseProgressTracker
                  courseId={courseId || testData.sampleCourseId}
                  onLessonClick={(lessonId, moduleId) => {
                    console.log('Lesson clicked:', lessonId, 'Module:', moduleId);
                    alert(`Lesson clicked: ${lessonId}`);
                  }}
                  onMarkComplete={async (lessonId, timeSpent) => {
                    await markLessonCompleted(lessonId, timeSpent);
                    alert('Lesson marked complete via tracker!');
                  }}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    Please enter a Course ID above to test the Course Progress Tracker
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lesson-progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Progress Bar</CardTitle>
              <p className="text-sm text-gray-600">
                Shows individual lesson progress with interactive controls
              </p>
            </CardHeader>
            <CardContent>
              {lessonId || testData.sampleLessonId ? (
                <LessonProgressBar
                  lessonId={lessonId || testData.sampleLessonId}
                  lessonTitle="Test Lesson - Communication Skills"
                  initialProgress={25}
                  estimatedDuration={45}
                  onProgressUpdate={(progress) => {
                    console.log('Progress updated:', progress);
                  }}
                  onComplete={() => {
                    alert('Lesson completed via progress bar!');
                  }}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    Please enter a Lesson ID above to test the Lesson Progress Bar
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz-tracker" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Progress Tracker</CardTitle>
              <p className="text-sm text-gray-600">
                Shows quiz results and assessment progress
              </p>
            </CardHeader>
            <CardContent>
              {lessonId || testData.sampleLessonId ? (
                <QuizProgressTracker
                  lessonId={lessonId || testData.sampleLessonId}
                  title="Progress Tracking Quiz"
                  description="Test your understanding of progress tracking concepts"
                  questions={sampleQuizQuestions}
                  passingScore={70}
                  timeLimit={15}
                  allowRetake={true}
                  maxAttempts={3}
                  onComplete={(score, passed) => {
                    alert(`Quiz completed! Score: ${score}%, Passed: ${passed}`);
                  }}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    Please enter both Student ID and Lesson ID above to test the Quiz Progress Tracker
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Dashboard</CardTitle>
              <p className="text-sm text-gray-600">
                Comprehensive dashboard showing all progress metrics
              </p>
            </CardHeader>
            <CardContent>
              {courseId || testData.sampleCourseId ? (
                <ProgressDashboard
                  courseId={courseId || testData.sampleCourseId}
                  courseTitle="Communication Skills Mastery"
                  onNavigateToLesson={(lessonId, moduleId) => {
                    console.log('Navigate to lesson:', lessonId, 'Module:', moduleId);
                    setLessonId(lessonId);
                    setActiveTab('lesson-progress');
                  }}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    Please enter a Course ID above to test the Progress Dashboard
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Testing Section */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints for Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Course Progress Details:</strong> GET /api/progress/course-details/{courseId}</p>
            <p><strong>Student Progress:</strong> GET /api/progress/student/{studentId}</p>
            <p><strong>Mark Lesson Complete:</strong> POST /api/progress/lesson/{lessonId}/complete</p>
            <p><strong>Update Lesson Progress:</strong> PUT /api/progress/lesson/{lessonId}/progress</p>
            <p><strong>Record Quiz Result:</strong> POST /api/progress/lesson/{lessonId}/quiz</p>
            <p><strong>Get Quiz Results:</strong> GET /api/progress/quiz/{studentId}/{lessonId}</p>
            <p><strong>Progress Dashboard:</strong> GET /api/progress/dashboard/{studentId}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTestPage;
