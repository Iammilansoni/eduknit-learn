import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertTriangle, Play, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import Layout from '@/components/layout/Layout';

type AnswerType = string | boolean | number;

interface QuizQuestion {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  points: number;
  correctAnswer?: AnswerType;
  studentAnswer?: AnswerType;
  isCorrect?: boolean;
  pointsAwarded?: number;
}

interface Quiz {
  id: string;
  lessonId: string;
  lessonTitle: string;
  questions: QuizQuestion[];
  settings: {
    timeLimit?: number;
    passingScore: number;
    allowMultipleAttempts: boolean;
    showCorrectAnswers: boolean;
    showFeedback: boolean;
  };
  totalQuestions: number;
  maxScore: number;
  previousAttempts: number;
  bestScore: number | null;
  canAttempt: boolean;
}

interface QuizAttempt {
  attemptId: string;
  attemptNumber: number;
  startedAt: string;
  timeLimit?: number;
  maxScore: number;
}

interface QuizResults {
  attemptId: string;
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  gradeLetter: string;
  timeSpent: number;
  completedAt: string;
  questions: QuizQuestion[];
  feedback: string;
  canRetake: boolean;
}

const StudentQuizPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, AnswerType>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizState, setQuizState] = useState<'overview' | 'taking' | 'results'>('overview');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const fetchQuiz = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/quiz/lesson/${lessonId}`);
      if (response.data.success) {
        setQuiz(response.data.data);
      }
    } catch (error: unknown) {
      console.error('Error fetching quiz:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load quiz',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [lessonId, toast]);

  const submitQuiz = useCallback(async () => {
    if (!currentAttempt || !quiz) return;
    
    try {
      setSubmitting(true);
      
      const submissionAnswers = quiz.questions.map(question => ({
        questionId: question.id,
        answer: answers[question.id] || '',
        timeSpent: 0
      }));

      const response = await api.post(`/quiz/attempt/${currentAttempt.attemptId}/submit`, {
        answers: submissionAnswers
      });

      if (response.data.success) {
        setResults(response.data.data);
        setQuizState('results');
        setCurrentAttempt(null);
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        toast({
          title: 'Quiz Submitted',
          description: `You scored ${response.data.data.percentage}%!`,
          variant: response.data.data.isPassed ? 'default' : 'destructive'
        });
      }
    } catch (error: unknown) {
      console.error('Error submitting quiz:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit quiz',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  }, [currentAttempt, quiz, answers, toast]);

  const handleTimeUp = useCallback(() => {
    toast({
      title: 'Time\'s Up!',
      description: 'The quiz time has expired. Submitting your current answers.',
      variant: 'destructive'
    });
    submitQuiz();
  }, [toast, submitQuiz]);

  useEffect(() => {
    if (lessonId) {
      fetchQuiz();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [lessonId, fetchQuiz]);

  useEffect(() => {
    if (currentAttempt && timeRemaining !== null && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentAttempt, timeRemaining, handleTimeUp]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/quiz/lesson/${lessonId}/start`);
      if (response.data.success) {
        const attempt = response.data.data;
        setCurrentAttempt(attempt);
        setQuizState('taking');
        setCurrentQuestionIndex(0);
        setAnswers({});
        startTimeRef.current = new Date();
        
        if (attempt.timeLimit) {
          setTimeRemaining(attempt.timeLimit * 60);
        }
        
        toast({
          title: 'Quiz Started',
          description: 'Good luck! Take your time and read each question carefully.',
          variant: 'default'
        });
      }
    } catch (error: unknown) {
      console.error('Error starting quiz:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start quiz',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: AnswerType) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (question: QuizQuestion, index: number) => {
    const answer = answers[question.id] || '';

    return (
      <Card key={question.id} className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Question {index + 1} of {quiz?.totalQuestions}</span>
            <Badge variant="outline">{question.points} point{question.points !== 1 ? 's' : ''}</Badge>
          </CardTitle>
          <CardDescription>{question.question}</CardDescription>
        </CardHeader>
        <CardContent>
          {question.type === 'MULTIPLE_CHOICE' && question.options && (
            <RadioGroup
              value={String(answer)}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                  <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'TRUE_FALSE' && (
            <RadioGroup
              value={String(answer)}
              onValueChange={(value) => handleAnswerChange(question.id, value === 'true')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`${question.id}-true`} />
                <Label htmlFor={`${question.id}-true`}>True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`${question.id}-false`} />
                <Label htmlFor={`${question.id}-false`}>False</Label>
              </div>
            </RadioGroup>
          )}

          {question.type === 'SHORT_ANSWER' && (
            <Textarea
              value={String(answer)}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Enter your answer here..."
              className="w-full"
            />
          )}
        </CardContent>
      </Card>
    );
  };

  const renderQuizOverview = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-blue-600" />
            {quiz?.lessonTitle} - Quiz
          </CardTitle>
          <CardDescription>
            Test your knowledge with this quiz. Make sure you understand the lesson content before starting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{quiz?.totalQuestions}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{quiz?.maxScore}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{quiz?.settings.passingScore}%</div>
              <div className="text-sm text-gray-600">Passing Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {quiz?.settings.timeLimit ? `${quiz.settings.timeLimit}min` : '∞'}
              </div>
              <div className="text-sm text-gray-600">Time Limit</div>
            </div>
          </div>

          {quiz && quiz.previousAttempts > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have attempted this quiz {quiz.previousAttempts} time{quiz.previousAttempts !== 1 ? 's' : ''}.
                {quiz.bestScore !== null && ` Your best score is ${quiz.bestScore}%.`}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 justify-center">
            <Button onClick={startQuiz} size="lg" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start Quiz
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back to Lesson
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuizTaking = () => {
    if (!quiz || !currentAttempt) return null;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.totalQuestions) * 100;

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{quiz.lessonTitle} - Quiz</h2>
              {timeRemaining !== null && (
                <div className="flex items-center gap-2 text-lg font-mono">
                  <Clock className="h-5 w-5" />
                  <span className={timeRemaining < 300 ? 'text-red-600' : 'text-gray-600'}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
            <Progress value={progress} className="w-full" />
            <div className="mt-2 text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {quiz.totalQuestions}
            </div>
          </CardContent>
        </Card>

        {renderQuestion(currentQuestion, currentQuestionIndex)}

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <div className="text-sm text-gray-600">
                Answered: {Object.keys(answers).length} / {quiz.totalQuestions}
              </div>

              {currentQuestionIndex < quiz.totalQuestions - 1 ? (
                <Button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={submitQuiz}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderQuizResults = () => {
    if (!results) return null;

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.isPassed ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              Quiz Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{results.percentage}%</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{results.score}/{results.maxScore}</div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{results.gradeLetter}</div>
                <div className="text-sm text-gray-600">Grade</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{Math.round(results.timeSpent / 60)}min</div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                {results.feedback}
              </AlertDescription>
            </Alert>

            <div className="flex gap-4 justify-center">
              {results.canRetake && (
                <Button onClick={() => {
                  setQuizState('overview');
                  setResults(null);
                  fetchQuiz();
                }} variant="outline" className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Retake Quiz
                </Button>
              )}
              <Button onClick={() => navigate(-1)}>
                Back to Lesson
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-6 w-6" />
              Question Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  <div className="flex items-center gap-2">
                    {question.isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">
                      {question.pointsAwarded}/{question.points} points
                    </span>
                  </div>
                </div>
                <p className="text-gray-700">{question.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Your Answer:</strong> {String(question.studentAnswer)}
                  </div>
                  <div>
                    <strong>Correct Answer:</strong> {String(question.correctAnswer)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!quiz) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No quiz found for this lesson, or you don't have access to it.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate(-1)} variant="outline">
              Back to Lesson
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {quizState === 'overview' && renderQuizOverview()}
      {quizState === 'taking' && renderQuizTaking()}
      {quizState === 'results' && renderQuizResults()}
    </Layout>
  );
};

export default StudentQuizPage;
