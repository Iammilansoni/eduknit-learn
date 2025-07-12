import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Play,
  Save,
  Share2,
  Video,
  BookOpen,
  Download,
  ExternalLink,
  Trophy,
  Target
} from 'lucide-react';
import { courseContentApi as courseContentAPI } from '@/services/courseContentApi';
import { useAuth } from '@/contexts/AuthContextUtils';
import LessonContentRenderer, { LessonContent as ContentItem } from '@/components/lesson/LessonContentRenderer';
import api from '@/services/api';

interface InteractiveElement {
  title?: string;
  content?: string;
  description?: string;
  url?: string;
  type?: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  points: number;
}

interface Quiz {
  timeLimit?: number;
  passingScore: number;
  questions: QuizQuestion[];
}

interface LessonData {
  _id: string;
  title: string;
  description: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'INTERACTIVE' | 'DOCUMENT';
  content: {
    videoUrl?: string;
    videoDuration?: number;
    textContent?: string;
    documentUrl?: string;
    interactiveElements?: InteractiveElement[];
    quiz?: Quiz;
    // Rich content support
    richContent?: Array<{
      id: string;
      type: 'text' | 'video' | 'image' | 'code' | 'interactive' | 'embed';
      title?: string;
      content: string;
      metadata?: {
        duration?: number;
        url?: string;
        alt?: string;
        language?: string;
        width?: number;
        height?: number;
        autoplay?: boolean;
        controls?: boolean;
      };
    }>;
    contentFormat?: 'HTML' | 'JSON' | 'LEGACY';
  };
  estimatedDuration: number;
  learningObjectives: string[];
  resources: Array<{
    title: string;
    url: string;
    type: 'PDF' | 'LINK' | 'VIDEO' | 'DOCUMENT';
  }>;
  progress?: {
    completed: boolean;
    timeSpent: number;
    lastAccessed: string;
    progressPercentage: number;
    bookmarked: boolean;
    notes: string;
  };
}

const LessonPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [currentProgress, setCurrentProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);
  const [contentNotes, setContentNotes] = useState<Record<string, string>>({});
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [hasAvailableQuiz, setHasAvailableQuiz] = useState(false);
  const [quizCheckLoading, setQuizCheckLoading] = useState(false);
  const [quizDebugInfo, setQuizDebugInfo] = useState<{
    hasQuiz: boolean;
    questionCount: number;
    quizSettings: { timeLimit?: number; passingScore: number } | null;
    error?: string;
  } | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(process.env.NODE_ENV === 'development');

  // Fetch lesson content
  const { data: lessonData, isLoading, error } = useQuery({
    queryKey: ['lesson-content', lessonId],
    queryFn: () => courseContentAPI.getLessonContent(lessonId!, user?.id),
    enabled: !!lessonId && !!user?.id,
  });

  // Progress update mutation
  const updateProgressMutation = useMutation({
    mutationFn: (data: { timeSpent: number; progressPercentage: number; notes?: string; bookmarked?: boolean }) =>
      courseContentAPI.updateLessonProgress(lessonId!, {
        studentId: user?.id,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-content', lessonId] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update progress. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const lesson = lessonData?.data as unknown as LessonData;

  // Initialize state from lesson data
  useEffect(() => {
    if (lesson?.progress) {
      setCurrentProgress(lesson.progress.progressPercentage || 0);
      setNotes(lesson.progress.notes || '');
      setIsBookmarked(lesson.progress.bookmarked || false);
      setTimeSpent(lesson.progress.timeSpent || 0);
    }
  }, [lesson]);

  // Auto-save progress periodically
  useEffect(() => {
    if (!lesson || timeSpent === 0) return;

    const saveInterval = setInterval(() => {
      updateProgressMutation.mutate({
        timeSpent,
        progressPercentage: currentProgress,
        notes,
        bookmarked: isBookmarked,
      });
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [lesson, timeSpent, currentProgress, notes, isBookmarked, updateProgressMutation]);

  // Check if lesson has an available quiz
  useEffect(() => {
    const checkForQuiz = async () => {
      if (!lessonId) return;
      
      console.log('🔍 Checking for quiz for lesson:', lessonId);
      setQuizCheckLoading(true);
      
      try {
        // First try the debug endpoint to see raw data
        console.log('📊 Calling debug endpoint...');
        const debugResponse = await api.get(`/quiz/debug/lesson/${lessonId}`);
        console.log('🔧 Debug response:', debugResponse.data);
        
        if (debugResponse.data.success) {
          setQuizDebugInfo({
            hasQuiz: debugResponse.data.debug.hasQuiz,
            questionCount: debugResponse.data.debug.questionCount,
            quizSettings: debugResponse.data.debug.quizSettings
          });
        }
        
        // Then try the normal quiz endpoint
        console.log('📊 Calling quiz endpoint...');
        const response = await api.get(`/quiz/lesson/${lessonId}`);
        
        console.log('📊 Quiz API response:', response.data);
        
        if (response.data.success && response.data.data.questions.length > 0) {
          setHasAvailableQuiz(true);
          console.log('✅ Quiz found for lesson:', lessonId, 'Questions:', response.data.data.questions.length);
        } else {
          console.log('❌ No quiz questions found for lesson:', lessonId);
          setHasAvailableQuiz(false);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorData = (error as { response?: { data?: unknown } })?.response?.data;
        console.log('❌ Error fetching quiz for lesson:', lessonId, errorData || errorMessage);
        
        setQuizDebugInfo(prev => prev ? { ...prev, error: errorMessage } : null);
        setHasAvailableQuiz(false);
      } finally {
        setQuizCheckLoading(false);
      }
    };
    
    checkForQuiz();
  }, [lessonId]);

  const handleProgressUpdate = (progress: number) => {
    setCurrentProgress(progress);
  };

  const handleTimeSpent = (time: number) => {
    setTimeSpent(time);
  };

  const handleBookmarkContent = (contentId: string) => {
    setBookmarkedItems(prev => 
      prev.includes(contentId) 
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    );
  };

  const handleNoteAdd = (contentId: string, note: string) => {
    setContentNotes(prev => ({
      ...prev,
      [contentId]: note
    }));
  };

  const handleLessonComplete = () => {
    setCurrentProgress(100);
    updateProgressMutation.mutate({
      timeSpent,
      progressPercentage: 100,
      notes,
      bookmarked: isBookmarked,
    });
    
    // Check if lesson has a quiz and show the dialog
    if (hasAvailableQuiz) {
      setShowQuizDialog(true);
    } else {
      toast({
        title: 'Lesson Completed!',
        description: 'Great job! You can now move to the next lesson.',
      });
    }
  };

  const handleBookmarkToggle = () => {
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    updateProgressMutation.mutate({
      timeSpent,
      progressPercentage: currentProgress,
      notes,
      bookmarked: newBookmarkState,
    });
  };

  const handleSaveNotes = () => {
    updateProgressMutation.mutate({
      timeSpent,
      progressPercentage: currentProgress,
      notes,
      bookmarked: isBookmarked,
    });
    toast({
      title: 'Notes Saved',
      description: 'Your notes have been saved successfully.',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const convertLessonToContentArray = (lesson: LessonData): ContentItem[] => {
    const contentArray: ContentItem[] = [];

    // Add learning objectives if available
    if (lesson.learningObjectives && lesson.learningObjectives.length > 0) {
      contentArray.push({
        id: 'objectives',
        type: 'text',
        title: 'Learning Objectives',
        content: `
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="font-semibold text-blue-900 mb-2">What you'll learn:</h3>
            <ul class="space-y-1">
              ${lesson.learningObjectives.map(obj => `<li class="text-blue-800 flex items-start"><span class="mr-2">✓</span>${obj}</li>`).join('')}
            </ul>
          </div>
        `
      });
    }

    // Handle content based on format
    if (lesson.content.contentFormat === 'JSON' && lesson.content.richContent) {
      // Use structured JSON content directly
      contentArray.push(...lesson.content.richContent);
    } else if (lesson.content.textContent) {
      // Try to detect if textContent is JSON or HTML
      try {
        const parsed = JSON.parse(lesson.content.textContent);
        if (Array.isArray(parsed)) {
          // It's structured JSON content
          contentArray.push(...parsed);
        } else {
          // It's HTML content
          contentArray.push({
            id: 'main-content',
            type: 'text',
            title: lesson.title,
            content: lesson.content.textContent,
            metadata: {}
          });
        }
      } catch {
        // It's HTML content
        contentArray.push({
          id: 'main-content',
          type: 'text',
          title: lesson.title,
          content: lesson.content.textContent,
          metadata: {}
        });
      }
    } else if (lesson.content.videoUrl) {
      // Video content
      contentArray.push({
        id: 'video-content',
        type: 'video',
        title: lesson.title,
        content: lesson.content.videoUrl,
        metadata: {
          duration: lesson.content.videoDuration,
          url: lesson.content.videoUrl,
          controls: true
        }
      });
    } else {
      // Fallback to description
      contentArray.push({
        id: 'main-content',
        type: 'text',
        title: lesson.title,
        content: lesson.description || 'Content coming soon...',
        metadata: {}
      });
    }

    return contentArray;
  };

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

  const contentArray = convertLessonToContentArray(lesson);

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
          <Badge variant="secondary">{formatTime(lesson.estimatedDuration)}</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmarkToggle}
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
                {lesson.type === 'QUIZ' && <BookOpen className="h-5 w-5" />}
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

              {/* Enhanced Content Renderer */}
              <LessonContentRenderer
                content={contentArray}
                onProgressUpdate={handleProgressUpdate}
                onTimeSpent={handleTimeSpent}
                onBookmark={handleBookmarkContent}
                onNoteAdd={handleNoteAdd}
                bookmarkedItems={bookmarkedItems}
                notes={contentNotes}
                showProgress={true}
                currentProgress={currentProgress}
              />

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
                  
                  {/* Quiz Button */}
                  {quizCheckLoading && (
                    <Button variant="outline" disabled className="flex items-center gap-2">
                      <Clock className="h-4 w-4 animate-spin" />
                      Checking for quiz...
                    </Button>
                  )}
                  {!quizCheckLoading && hasAvailableQuiz && (
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/lessons/${lessonId}/quiz`)}
                      className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
                    >
                      <Target className="h-4 w-4" />
                      Take Quiz
                    </Button>
                  )}
                  {!quizCheckLoading && !hasAvailableQuiz && (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      No quiz available
                    </div>
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
                  <Save className="h-4 w-4 mr-2" />
                  Save Notes
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Lesson Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lesson Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Duration</span>
                <span className="text-sm font-medium">{formatTime(lesson.estimatedDuration)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type</span>
                <Badge variant="outline" className="text-xs">
                  {lesson.type}
                </Badge>
              </div>
              {lesson.progress && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge 
                    variant={lesson.progress.completed ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {lesson.progress.completed ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Debug Panel (Development Only) */}
      {showDebugPanel && (
        <Card className="mt-4 border-dashed border-orange-300 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-sm text-orange-800 flex items-center gap-2">
              🔧 Quiz Debug Info (Development Mode)
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="text-orange-600"
              >
                {showDebugPanel ? 'Hide' : 'Show'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Lesson ID:</strong> {lessonId}</div>
              <div><strong>Quiz Check Loading:</strong> {quizCheckLoading ? 'Yes' : 'No'}</div>
              <div><strong>Has Available Quiz:</strong> {hasAvailableQuiz ? '✅ Yes' : '❌ No'}</div>
              
              {quizDebugInfo && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <div className="font-medium text-orange-800 mb-2">Debug API Response:</div>
                  <div><strong>Raw Quiz Found:</strong> {quizDebugInfo.hasQuiz ? '✅ Yes' : '❌ No'}</div>
                  <div><strong>Question Count:</strong> {quizDebugInfo.questionCount}</div>
                  {quizDebugInfo.quizSettings && (
                    <div>
                      <strong>Settings:</strong> 
                      Passing Score: {quizDebugInfo.quizSettings.passingScore}%
                      {quizDebugInfo.quizSettings.timeLimit && `, Time Limit: ${quizDebugInfo.quizSettings.timeLimit}min`}
                    </div>
                  )}
                  {quizDebugInfo.error && (
                    <div className="text-red-600"><strong>Error:</strong> {quizDebugInfo.error}</div>
                  )}
                </div>
              )}
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="font-medium text-yellow-800 mb-2">🔧 Quick Fixes:</div>
                <ol className="text-xs space-y-1 text-yellow-700">
                  <li>1. Go to Admin → Lesson Management</li>
                  <li>2. Find this lesson and click quiz button (🅠)</li>
                  <li>3. Create a new quiz with questions</li>
                  <li>4. Save and refresh this page</li>
                </ol>
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/admin/lessons/${lessonId}/quiz`, '_blank')}
                    className="text-xs"
                  >
                    Open Quiz Admin
                  </Button>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-orange-600">
                💡 Check browser console for detailed API logs
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Completion Dialog */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Lesson Completed!
            </DialogTitle>
            <DialogDescription>
              Congratulations! You've completed this lesson. Would you like to test your knowledge with a quiz?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium">Quiz Available</h4>
              <p className="text-sm text-gray-600">Test your understanding of this lesson</p>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowQuizDialog(false);
                toast({
                  title: 'Lesson Completed!',
                  description: 'You can take the quiz later from the lesson page.',
                });
              }}
            >
              Skip Quiz
            </Button>
            <Button
              onClick={() => {
                setShowQuizDialog(false);
                navigate(`/lessons/${lessonId}/quiz`);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Take Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonPage;
