import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CourseProgressTracker from '@/components/progress/CourseProgressTracker';
import LessonProgressBar from '@/components/progress/LessonProgressBar';
import QuizProgressTracker from '@/components/progress/QuizProgressTracker';
import { BookOpen, Trophy, BarChart3 } from 'lucide-react';

interface ProgressDashboardProps {
  courseId: string;
  courseTitle: string;
  onNavigateToLesson?: (lessonId: string, moduleId: string) => void;
}

// Sample quiz questions for demonstration
const sampleQuizQuestions = [
  {
    id: 'q1',
    question: 'What is the main purpose of effective communication?',
    type: 'single' as const,
    options: [
      'To impress others with vocabulary',
      'To convey information clearly and achieve understanding',
      'To speak as quickly as possible',
      'To use complex sentences'
    ],
    correctAnswer: 'To convey information clearly and achieve understanding',
    points: 10,
    explanation: 'Effective communication is about clarity and mutual understanding.'
  },
  {
    id: 'q2',
    question: 'Which of these are key elements of active listening? (Select all that apply)',
    type: 'multiple' as const,
    options: [
      'Maintaining eye contact',
      'Asking clarifying questions',
      'Thinking about your response while the other person speaks',
      'Summarizing what you heard',
      'Interrupting to show interest'
    ],
    correctAnswer: ['Maintaining eye contact', 'Asking clarifying questions', 'Summarizing what you heard'],
    points: 15,
    explanation: 'Active listening involves full attention and engagement with the speaker.'
  },
  {
    id: 'q3',
    question: 'Explain the difference between assertive and aggressive communication.',
    type: 'text' as const,
    correctAnswer: 'Assertive communication is confident and respectful while aggressive communication is forceful and disrespectful',
    points: 20,
    explanation: 'Assertive communication respects both your own and others\' rights and feelings.'
  }
];

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  courseId,
  courseTitle,
  onNavigateToLesson
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const handleLessonClick = (lessonId: string, moduleId: string) => {
    setCurrentLesson(lessonId);
    setActiveTab('lesson');
    onNavigateToLesson?.(lessonId, moduleId);
  };

  const handleLessonComplete = async (lessonId: string, timeSpent?: number) => {
    // This would typically call the API to mark lesson as complete
    console.log('Marking lesson complete:', lessonId, timeSpent);
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    console.log('Quiz completed:', { score, passed });
    if (passed) {
      setShowQuiz(false);
      setActiveTab('overview');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{courseTitle}</h1>
          <p className="text-gray-600 mt-1">Track your learning progress and achievements</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Course ID: {courseId}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="lesson" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Current Lesson
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Quiz
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <CourseProgressTracker
            courseId={courseId}
            onLessonClick={handleLessonClick}
            onMarkComplete={handleLessonComplete}
          />
        </TabsContent>

        <TabsContent value="lesson" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Lesson Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {currentLesson ? (
                  <LessonProgressBar
                    lessonId={currentLesson}
                    lessonTitle="Introduction to Effective Communication"
                    initialProgress={25}
                    estimatedDuration={45}
                    onProgressUpdate={(progress) => console.log('Progress:', progress)}
                    onComplete={() => {
                      console.log('Lesson completed!');
                      setActiveTab('overview');
                    }}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No lesson selected. Click on a lesson from the overview to start learning.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {currentLesson && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Button 
                    onClick={() => setShowQuiz(true)}
                    variant="outline"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Take Quiz
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('overview')}
                    variant="outline"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Progress
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quiz" className="mt-6">
          <QuizProgressTracker
            lessonId={currentLesson || 'sample-lesson'}
            quizId="communication-basics-quiz"
            title="Communication Skills Assessment"
            description="Test your understanding of basic communication principles"
            questions={sampleQuizQuestions}
            passingScore={70}
            timeLimit={15}
            allowRetake={true}
            maxAttempts={3}
            onComplete={handleQuizComplete}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Detailed analytics coming soon...</p>
                  <p className="text-sm mt-2">Track your learning patterns, time spent, and performance trends.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressDashboard;
