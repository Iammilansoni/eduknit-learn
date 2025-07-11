import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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
  ArrowRight,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  ExternalLink,
  MessageCircle,
  Star,
  Eye,
  EyeOff
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
  description?: string;
  questions: QuizQuestion[];
  timeLimit?: number;
  passingScore: number;
}

interface LessonContent {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'INTERACTIVE';
  duration: number;
  videoUrl?: string;
  videoDuration?: number;
  resources?: Array<{
    title: string;
    url: string;
    type: 'PDF' | 'LINK' | 'VIDEO' | 'DOCUMENT' | 'IMAGE';
  }>;
  quiz?: Quiz;
  progress?: {
    completed: boolean;
    timeSpent: number;
    lastAccessed: string;
    progressPercentage: number;
    bookmarked: boolean;
    notes: string;
  };
  learningObjectives?: string[];
}

const EnhancedLessonViewer: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizTimeRemaining, setQuizTimeRemaining] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [lastReadPosition, setLastReadPosition] = useState(0);

  // Fetch lesson content
  const { data: lessonData, isLoading, error } = useQuery({
    queryKey: ['lesson-content', lessonId],
    queryFn: () => courseContentAPI.getLessonContent(lessonId!, user?.id),
    enabled: !!lessonId && !!user?.id,
  });

  // Progress tracking mutation
  const updateProgressMutation = useMutation({
    mutationFn: (data: { timeSpent: number; progressPercentage: number; notes?: string; bookmarked?: boolean }) =>
      courseContentAPI.updateLessonProgress(lessonId!, {
        studentId: user?.id,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-content', lessonId] });
    },
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

  // Initialize notes and bookmark status
  useEffect(() => {
    if (lesson?.progress) {
      setNotes(lesson.progress.notes || '');
      setIsBookmarked(lesson.progress.bookmarked || false);
    }
  }, [lesson]);

  // Reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      if (lesson?.type === 'TEXT') {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        setReadingProgress(Math.min(progress, 100));
        setLastReadPosition(scrollTop);
      }
    };

    if (lesson?.type === 'TEXT') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [lesson]);

  // Auto-save progress
  useEffect(() => {
    const saveProgress = () => {
      if (lesson && user?.id) {
        let progressPercentage = 0;
        let timeSpent = 0;

        if (lesson.type === 'VIDEO' && videoRef.current) {
          progressPercentage = (currentTime / (lesson.videoDuration || 1)) * 100;
          timeSpent = currentTime;
        } else if (lesson.type === 'TEXT') {
          progressPercentage = readingProgress;
          timeSpent = Date.now() - new Date(lesson.progress?.lastAccessed || Date.now()).getTime();
        }

        updateProgressMutation.mutate({
          timeSpent,
          progressPercentage: Math.min(progressPercentage, 100),
          notes,
          bookmarked: isBookmarked,
        });
      }
    };

    const interval = setInterval(saveProgress, 30000); // Save every 30 seconds
    return () => clearInterval(interval);
  }, [lesson, currentTime, readingProgress, notes, isBookmarked, user?.id]);

  // Quiz timer effect
  useEffect(() => {
    if (showQuiz && lesson?.quiz?.timeLimit && quizTimeRemaining !== null) {
      const timer = setInterval(() => {
        setQuizTimeRemaining((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
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

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLessonComplete = () => {
    updateProgressMutation.mutate({
      timeSpent: lesson?.type === 'VIDEO' ? currentTime : 0,
      progressPercentage: 100,
    });

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

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    updateProgressMutation.mutate({
      timeSpent: lesson?.type === 'VIDEO' ? currentTime : 0,
      progressPercentage: lesson?.progress?.progressPercentage || 0,
      bookmarked: !isBookmarked,
    });
  };

  const handleSaveNotes = () => {
    updateProgressMutation.mutate({
      timeSpent: lesson?.type === 'VIDEO' ? currentTime : 0,
      progressPercentage: lesson?.progress?.progressPercentage || 0,
      notes,
    });
    toast({
      title: 'Notes Saved',
      description: 'Your notes have been saved successfully.',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVideoPlayer = () => (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        onTimeUpdate={(e) => handleVideoProgress(e.currentTarget.currentTime)}
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setCurrentTime(0);
          }
        }}
      >
        <source src={lesson?.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Custom Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <span className="text-sm">{formatTime(currentTime)} / {formatTime(lesson?.videoDuration || 0)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTextContent = () => (
    <div className="space-y-6">
      {/* Learning Objectives */}
      {lesson?.learningObjectives && lesson.learningObjectives.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Learning Objectives</h3>
          <ul className="space-y-1">
            {lesson.learningObjectives.map((objective, index) => (
              <li key={index} className="text-blue-800 flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                {objective}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Content */}
      <div 
        className="prose max-w-none prose-lg"
        dangerouslySetInnerHTML={{ __html: lesson?.content || '' }}
      />

      {/* Reading Progress */}
      <div className="sticky bottom-4 bg-white border rounded-lg p-3 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Reading Progress</span>
          <span className="text-sm text-gray-600">{Math.round(readingProgress)}%</span>
        </div>
        <Progress value={readingProgress} className="h-2" />
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg">Additional Resources</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lesson?.resources?.map((resource, index) => (
          <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h5 className="font-medium">{resource.title}</h5>
                <p className="text-sm text-gray-600 capitalize">{resource.type.toLowerCase()}</p>
              </div>
              <div className="flex space-x-2">
                {resource.type === 'PDF' && (
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{lesson.type}</Badge>
          <Badge variant="secondary">{formatTime(lesson.duration)}</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={isBookmarked ? 'text-yellow-600' : ''}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
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
                    <span>{Math.round(lesson.progress.progressPercentage)}%</span>
                  </div>
                  <Progress value={lesson.progress.progressPercentage} />
                </div>
              )}

              {/* Content Based on Type */}
              {lesson.type === 'VIDEO' && lesson.videoUrl && renderVideoPlayer()}
              {lesson.type === 'TEXT' && renderTextContent()}

              {/* Resources */}
              {lesson.resources && lesson.resources.length > 0 && renderResources()}

              {/* Lesson Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Time spent: {formatTime(lesson.progress?.timeSpent || 0)}</span>
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
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Notes Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">Notes</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotes(!showNotes)}
                >
                  {showNotes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            {showNotes && (
              <CardContent>
                <Textarea
                  placeholder="Add your notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[200px]"
                />
                <Button 
                  onClick={handleSaveNotes}
                  className="mt-2 w-full"
                  size="sm"
                >
                  Save Notes
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lesson Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duration</span>
                <span className="text-sm font-medium">{formatTime(lesson.duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium">{Math.round(lesson.progress?.progressPercentage || 0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Time Spent</span>
                <span className="text-sm font-medium">{formatTime(lesson.progress?.timeSpent || 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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

              <div className="flex justify-center">
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

export default EnhancedLessonViewer; 