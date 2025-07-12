import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  SkipForward, 
  CheckCircle, 
  Clock, 
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Trophy,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { courseContentApi as courseContentAPI } from '@/services/courseContentApi';
import { useAuth } from '@/contexts/AuthContextUtils';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit?: number;
  passingScore: number;
  totalQuestions: number;
  questions: QuizQuestion[];
}

interface LessonContent {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'INTERACTIVE';
  duration: number;
  videoUrl?: string;
  resources?: string[];
  quiz?: Quiz;
  progress?: {
    completed: boolean;
    timeSpent: number;
    lastAccessed: string;
    progressPercentage: number;
  };
}

const LessonViewer: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizTimeRemaining, setQuizTimeRemaining] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Helper function to convert URLs to embed URLs
  const getVideoEmbedUrl = (url: string) => {
    try {
      // YouTube URLs
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get('v');
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
        }
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
        }
      }
      
      // Vimeo URLs
      if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
        }
      }
      
      // Google Drive URLs
      if (url.includes('drive.google.com/file/d/')) {
        const fileId = url.split('/file/d/')[1]?.split('/')[0];
        if (fileId) {
          return `https://drive.google.com/file/d/${fileId}/preview`;
        }
      }
      
      // For direct video files, return as-is
      return url;
    } catch (error) {
      console.error('Error processing video URL:', error);
      return url;
    }
  };

  // Check if URL is an embeddable video
  const isEmbeddableVideo = (url: string) => {
    return url.includes('youtube.com') || 
           url.includes('youtu.be') || 
           url.includes('vimeo.com') || 
           url.includes('drive.google.com');
  };

  // Fetch lesson content
  const { data: lessonData, isLoading, error } = useQuery({
    queryKey: ['lesson-content', lessonId],
    queryFn: () => courseContentAPI.getLessonContent(lessonId!, user?.id),
    enabled: !!lessonId && !!user?.id,
  });

  // Quiz submission mutation
  const submitQuizMutation = useMutation({
    mutationFn: (data: { answers: any[]; timeSpent: number }) =>
      courseContentAPI.submitQuiz(lessonId!, {
        studentId: user?.id,
        ...data,
      }),
    onSuccess: (data) => {
      setQuizResults(data.data);
      setQuizSubmitted(true);
      toast({
        title: data.data.quizResult.passed ? 'Quiz Passed!' : 'Quiz Completed',
        description: data.data.feedback,
        variant: data.data.quizResult.passed ? 'default' : 'destructive',
      });
      // Refresh progress data
      queryClient.invalidateQueries({ queryKey: ['lesson-content', lessonId] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to submit quiz. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const lesson = lessonData?.data as LessonContent;

  // Quiz timer effect
  useEffect(() => {
    if (showQuiz && lesson?.quiz?.timeLimit && quizTimeRemaining !== null) {
      const timer = setInterval(() => {
        setQuizTimeRemaining((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            // Auto-submit quiz when time runs out
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showQuiz, lesson?.quiz?.timeLimit, quizTimeRemaining]);

  const handleVideoProgress = (time: number) => {
    setCurrentTime(time);
  };

  const handleLessonComplete = () => {
    // Mark lesson as completed
    // This would typically call an API to update progress
    toast({
      title: 'Lesson Completed!',
      description: 'Great job! You can now take the quiz.',
    });
    
    if (lesson?.quiz) {
      setShowQuiz(true);
      setQuizTimeRemaining(lesson.quiz.timeLimit || null);
    }
  };

  const handleQuizAnswer = (questionId: string, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitQuiz = () => {
    const answers = Object.entries(quizAnswers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    submitQuizMutation.mutate({
      answers,
      timeSpent: currentTime
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eduBlue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load lesson</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{lesson.type}</Badge>
          <Badge variant="secondary">{formatTime(lesson.duration)}</Badge>
        </div>
      </div>

      {/* Lesson Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {lesson.type === 'VIDEO' && <Video className="h-5 w-5" />}
            {lesson.type === 'TEXT' && <FileText className="h-5 w-5" />}
            {lesson.type === 'QUIZ' && <HelpCircle className="h-5 w-5" />}
            {lesson.title}
          </CardTitle>
          <p className="text-gray-600">{lesson.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          {lesson.progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{lesson.progress.progressPercentage}%</span>
              </div>
              <Progress value={lesson.progress.progressPercentage} />
            </div>
          )}

          {/* Video Player */}
          {lesson.type === 'VIDEO' && lesson.videoUrl && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {isEmbeddableVideo(lesson.videoUrl) ? (
                <iframe
                  src={getVideoEmbedUrl(lesson.videoUrl)}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title="Video Player"
                  onLoad={() => setVideoError(null)}
                  onError={() => setVideoError('Failed to load embedded video')}
                />
              ) : (
                <video
                  className="w-full h-full"
                  controls
                  onTimeUpdate={(e) => handleVideoProgress(e.currentTarget.currentTime)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={() => setVideoError('Failed to load video file')}
                  onLoadStart={() => setVideoError(null)}
                >
                  <source src={lesson.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              
              {/* Video Error Display */}
              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white">
                  <div className="text-center">
                    <p className="mb-2">{videoError}</p>
                    <p className="text-sm text-gray-300">Video URL: {lesson.videoUrl}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text Content */}
          {lesson.type === 'TEXT' && (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          )}

          {/* Interactive Content */}
          {lesson.type === 'INTERACTIVE' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Interactive Content</h3>
              <p className="text-gray-600 mb-4">
                This lesson contains interactive elements. Click below to start.
              </p>
              <Button onClick={handleLessonComplete}>
                Start Interactive Lesson
              </Button>
            </div>
          )}

          {/* Resources */}
          {lesson.resources && lesson.resources.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Additional Resources</h4>
              <div className="space-y-1">
                {lesson.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-eduBlue-600 hover:underline"
                  >
                    Resource {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Lesson Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Time spent: {formatTime(currentTime)}</span>
            </div>
            
            <div className="flex space-x-2">
              {lesson.progress?.completed ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              ) : (
                <Button onClick={handleLessonComplete}>
                  Mark as Complete
                </Button>
              )}
              
              {lesson.quiz && !lesson.progress?.completed && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowQuiz(true)}
                >
                  Take Quiz
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Dialog */}
      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {lesson.quiz?.title}
            </DialogTitle>
            {lesson.quiz?.description && (
              <p className="text-gray-600">{lesson.quiz.description}</p>
            )}
            {quizTimeRemaining !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Time remaining: {formatTime(quizTimeRemaining)}</span>
              </div>
            )}
          </DialogHeader>

          {!quizSubmitted ? (
            <div className="space-y-6">
              {lesson.quiz?.questions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <h4 className="font-semibold">
                    Question {index + 1}: {question.question}
                  </h4>
                  
                  {question.type === 'MULTIPLE_CHOICE' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            onChange={(e) => handleQuizAnswer(question.id, e.target.value)}
                            className="text-eduBlue-600"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'TRUE_FALSE' && (
                    <div className="space-y-2">
                      {['True', 'False'].map((option) => (
                        <label key={option} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            onChange={(e) => handleQuizAnswer(question.id, e.target.value)}
                            className="text-eduBlue-600"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'SHORT_ANSWER' && (
                    <input
                      type="text"
                      placeholder="Enter your answer..."
                      onChange={(e) => handleQuizAnswer(question.id, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setShowQuiz(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitQuiz}
                  disabled={submitQuizMutation.isPending}
                >
                  {submitQuizMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-xl font-semibold mb-2">
                  {quizResults?.quizResult.passed ? 'Congratulations!' : 'Quiz Completed'}
                </h3>
                <p className="text-gray-600 mb-4">
                  Score: {quizResults?.quizResult.score}/{quizResults?.quizResult.maxScore} 
                  ({quizResults?.quizResult.percentage}%)
                </p>
                <p className="text-sm text-gray-500">
                  Points earned: {quizResults?.quizResult.pointsEarned}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Question Results:</h4>
                {quizResults?.results.map((result: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {result.isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 text-red-500">✗</div>
                      )}
                      <span className="font-medium">Question {index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{result.question}</p>
                    <p className="text-xs text-gray-500">
                      Your answer: {result.studentAnswer || 'No answer'}
                    </p>
                    {!result.isCorrect && (
                      <p className="text-xs text-gray-500">
                        Correct answer: {result.correctAnswer}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => setShowQuiz(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonViewer; 