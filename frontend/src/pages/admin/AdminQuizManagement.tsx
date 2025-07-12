import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Layout from '@/components/layout/Layout';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  Target,
  BarChart3,
  Users,
  Clock,
  Award,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

// Quiz form schema
const quizQuestionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, 'Question is required'),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.boolean()]),
  points: z.number().min(1, 'Points must be at least 1'),
  explanation: z.string().optional()
});

const quizSchema = z.object({
  questions: z.array(quizQuestionSchema).min(1, 'At least one question is required'),
  settings: z.object({
    timeLimit: z.number().optional(),
    passingScore: z.number().min(0).max(100).default(60),
    allowMultipleAttempts: z.boolean().default(true),
    showCorrectAnswers: z.boolean().default(true),
    showFeedback: z.boolean().default(true),
    maxAttempts: z.number().min(1).default(3),
    questionsRandomized: z.boolean().default(false),
    optionsRandomized: z.boolean().default(false)
  })
});

type QuizFormData = z.infer<typeof quizSchema>;

interface Quiz {
  questions: Array<{
    id: string;
    question: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
    options?: string[];
    correctAnswer: string | boolean;
    points: number;
    explanation?: string;
  }>;
  settings: {
    timeLimit?: number;
    passingScore: number;
    allowMultipleAttempts: boolean;
    showCorrectAnswers: boolean;
    showFeedback: boolean;
    maxAttempts: number;
    questionsRandomized: boolean;
    optionsRandomized: boolean;
  };
}

interface QuizAnalytics {
  overview: {
    totalAttempts: number;
    uniqueStudents: number;
    averageScore: number;
    passRate: number;
    averageTimeSpent: number;
    highestScore: number;
    lowestScore: number;
  };
  recentAttempts: Array<{
    studentName: string;
    studentEmail: string;
    score: number;
    maxScore: number;
    percentage: number;
    gradeLetter: string;
    timeSpent: number;
    completedAt: string;
    isPassed: boolean;
  }>;
  questionAnalytics: Array<{
    questionId: string;
    totalAnswers: number;
    correctAnswers: number;
    accuracy: number;
    averagePoints: number;
    averageTime: number;
  }>;
  quiz: Quiz;
}

const AdminQuizManagement = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [activeTab, setActiveTab] = useState('manage');
  const [previewMode, setPreviewMode] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      questions: [{
        question: '',
        type: 'MULTIPLE_CHOICE',
        options: ['', ''],
        correctAnswer: '',
        points: 10,
        explanation: ''
      }],
      settings: {
        passingScore: 60,
        allowMultipleAttempts: true,
        showCorrectAnswers: true,
        showFeedback: true,
        maxAttempts: 3,
        questionsRandomized: false,
        optionsRandomized: false
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions'
  });

  const watchedQuestions = watch('questions');

  const fetchLessonData = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // First, get the lesson details
      const lessonResponse = await api.get(`/lessons/${lessonId}`);
      if (lessonResponse.data.success) {
        setLessonTitle(lessonResponse.data.data.title);
      }

      // Try to get existing quiz
      const quizResponse = await api.get(`/quiz/lesson/${lessonId}`);
      if (quizResponse.data.success && quizResponse.data.data.questions.length > 0) {
        const quizData: Quiz = quizResponse.data.data;
        reset({
          questions: quizData.questions.map((q) => ({
            id: q.id,
            question: q.question,
            type: q.type,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            points: q.points,
            explanation: q.explanation || ''
          })),
          settings: quizData.settings
        });
      }
    } catch (error) {
      console.log('No existing quiz found or error loading lesson data');
    } finally {
      setLoading(false);
    }
  }, [lessonId, reset]);

  const fetchAnalytics = React.useCallback(async () => {
    try {
      const response = await api.get(`/quiz/lesson/${lessonId}/admin-analytics`);
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.log('No analytics data available');
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLessonData();
    fetchAnalytics();
  }, [fetchLessonData, fetchAnalytics]);

  const onSubmit = async (data: QuizFormData) => {
    try {
      setLoading(true);
      
      const response = await api.post(`/quiz/lesson/${lessonId}/manage`, {
        questions: data.questions,
        settings: data.settings
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Quiz saved successfully!',
        });
        fetchAnalytics(); // Refresh analytics
      }
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error && error.message ? 
          (error as { response?: { data?: { message?: string } } }).response?.data?.message || error.message :
          'Failed to save quiz',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async () => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.delete(`/quiz/lesson/${lessonId}/manage`);
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Quiz deleted successfully!',
        });
        reset({
          questions: [{
            question: '',
            type: 'MULTIPLE_CHOICE',
            options: ['', ''],
            correctAnswer: '',
            points: 10,
            explanation: ''
          }],
          settings: {
            passingScore: 60,
            allowMultipleAttempts: true,
            showCorrectAnswers: true,
            showFeedback: true,
            maxAttempts: 3,
            questionsRandomized: false,
            optionsRandomized: false
          }
        });
        setAnalytics(null);
      }
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error && error.message ? 
          (error as { response?: { data?: { message?: string } } }).response?.data?.message || error.message :
          'Failed to delete quiz',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    append({
      question: '',
      type: 'MULTIPLE_CHOICE',
      options: ['', ''],
      correctAnswer: '',
      points: 10,
      explanation: ''
    });
  };

  const addOption = (questionIndex: number) => {
    const currentOptions = watchedQuestions[questionIndex]?.options || [];
    setValue(`questions.${questionIndex}.options`, [...currentOptions, '']);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions = watchedQuestions[questionIndex]?.options || [];
    if (currentOptions.length > 2) {
      const newOptions = currentOptions.filter((_, index) => index !== optionIndex);
      setValue(`questions.${questionIndex}.options`, newOptions);
    }
  };

  const calculateTotalScore = () => {
    return watchedQuestions.reduce((total, question) => total + (question.points || 0), 0);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const renderQuestionForm = (questionIndex: number) => {
    const question = watchedQuestions[questionIndex];
    const questionType = question?.type || 'MULTIPLE_CHOICE';

    return (
      <Card key={questionIndex} className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => remove(questionIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={`questions.${questionIndex}.question`}>Question Text</Label>
            <Textarea
              {...register(`questions.${questionIndex}.question`)}
              placeholder="Enter your question..."
              className="mt-1"
            />
            {errors.questions?.[questionIndex]?.question && (
              <p className="text-sm text-red-600 mt-1">
                {errors.questions[questionIndex]?.question?.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`questions.${questionIndex}.type`}>Question Type</Label>
              <Select
                value={questionType}
                onValueChange={(value) => {
                  setValue(`questions.${questionIndex}.type`, value as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER');
                  // Reset options and correct answer when type changes
                  if (value === 'TRUE_FALSE') {
                    setValue(`questions.${questionIndex}.options`, []);
                    setValue(`questions.${questionIndex}.correctAnswer`, false);
                  } else if (value === 'MULTIPLE_CHOICE') {
                    setValue(`questions.${questionIndex}.options`, ['', '']);
                    setValue(`questions.${questionIndex}.correctAnswer`, '');
                  } else {
                    setValue(`questions.${questionIndex}.options`, []);
                    setValue(`questions.${questionIndex}.correctAnswer`, '');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                  <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                  <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`questions.${questionIndex}.points`}>Points</Label>
              <Input
                type="number"
                min="1"
                {...register(`questions.${questionIndex}.points`, { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.questions?.[questionIndex]?.points && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.questions[questionIndex]?.points?.message}
                </p>
              )}
            </div>
          </div>

          {/* Multiple Choice Options */}
          {questionType === 'MULTIPLE_CHOICE' && (
            <div>
              <Label>Answer Options</Label>
              <div className="space-y-2 mt-2">
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <Input
                      {...register(`questions.${questionIndex}.options.${optionIndex}`)}
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue(`questions.${questionIndex}.correctAnswer`, option)}
                      className={question.correctAnswer === option ? 'bg-green-100' : ''}
                    >
                      {question.correctAnswer === option ? <CheckCircle className="h-4 w-4" /> : 'Correct?'}
                    </Button>
                    {question.options && question.options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(questionIndex)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {/* True/False */}
          {questionType === 'TRUE_FALSE' && (
            <div>
              <Label>Correct Answer</Label>
              <div className="flex space-x-2 mt-2">
                <Button
                  type="button"
                  variant={question.correctAnswer === true ? 'default' : 'outline'}
                  onClick={() => setValue(`questions.${questionIndex}.correctAnswer`, true)}
                >
                  True
                </Button>
                <Button
                  type="button"
                  variant={question.correctAnswer === false ? 'default' : 'outline'}
                  onClick={() => setValue(`questions.${questionIndex}.correctAnswer`, false)}
                >
                  False
                </Button>
              </div>
            </div>
          )}

          {/* Short Answer */}
          {questionType === 'SHORT_ANSWER' && (
            <div>
              <Label htmlFor={`questions.${questionIndex}.correctAnswer`}>Sample Correct Answer</Label>
              <Input
                {...register(`questions.${questionIndex}.correctAnswer`)}
                placeholder="Enter a sample correct answer..."
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor={`questions.${questionIndex}.explanation`}>Explanation (Optional)</Label>
            <Textarea
              {...register(`questions.${questionIndex}.explanation`)}
              placeholder="Provide an explanation for the correct answer..."
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAnalytics = () => {
    if (!analytics) {
      return (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Analytics Available</h3>
          <p className="text-gray-600">Create a quiz and wait for student submissions to see analytics.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.uniqueStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.passRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Time</p>
                  <p className="text-2xl font-bold text-gray-900">{formatTime(analytics.overview.averageTimeSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attempts</CardTitle>
            <CardDescription>Latest quiz submissions from students</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.recentAttempts.map((attempt, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{attempt.studentName}</p>
                        <p className="text-sm text-gray-600">{attempt.studentEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{attempt.score}/{attempt.maxScore} ({attempt.percentage}%)</TableCell>
                    <TableCell>
                      <Badge variant={attempt.gradeLetter === 'A' ? 'default' : 'secondary'}>
                        {attempt.gradeLetter}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTime(attempt.timeSpent)}</TableCell>
                    <TableCell>{new Date(attempt.completedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {attempt.isPassed ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Passed
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Question Analytics */}
        {analytics.questionAnalytics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Question Performance</CardTitle>
              <CardDescription>How students performed on each question</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Total Answers</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Avg Points</TableHead>
                    <TableHead>Avg Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.questionAnalytics.map((question, index) => (
                    <TableRow key={question.questionId}>
                      <TableCell>Question {index + 1}</TableCell>
                      <TableCell>{question.totalAnswers}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${question.accuracy}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{question.accuracy}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{question.averagePoints}</TableCell>
                      <TableCell>{question.averageTime ? formatTime(question.averageTime) : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quiz Management</h1>
            <p className="text-gray-600">{lessonTitle}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="manage">Manage Quiz</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Quiz Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Settings</CardTitle>
                  <CardDescription>Configure quiz behavior and scoring</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="settings.timeLimit">Time Limit (minutes, optional)</Label>
                    <Input
                      type="number"
                      min="1"
                      {...register('settings.timeLimit', { valueAsNumber: true })}
                      placeholder="No time limit"
                    />
                  </div>

                  <div>
                    <Label htmlFor="settings.passingScore">Passing Score (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      {...register('settings.passingScore', { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="settings.maxAttempts">Max Attempts</Label>
                    <Input
                      type="number"
                      min="1"
                      {...register('settings.maxAttempts', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox {...register('settings.allowMultipleAttempts')} />
                        <Label>Allow Multiple Attempts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox {...register('settings.showCorrectAnswers')} />
                        <Label>Show Correct Answers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox {...register('settings.showFeedback')} />
                        <Label>Show Feedback</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox {...register('settings.questionsRandomized')} />
                        <Label>Randomize Question Order</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox {...register('settings.optionsRandomized')} />
                        <Label>Randomize Option Order</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Questions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Questions</CardTitle>
                      <CardDescription>
                        {fields.length} question{fields.length !== 1 ? 's' : ''} • Total Score: {calculateTotalScore()} points
                      </CardDescription>
                    </div>
                    <Button type="button" onClick={addQuestion}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {fields.map((field, index) => renderQuestionForm(index))}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={deleteQuiz}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Quiz
                </Button>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('preview')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-1" />
                    {loading ? 'Saving...' : 'Save Quiz'}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="analytics">
            {renderAnalytics()}
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Preview</CardTitle>
                <CardDescription>See how the quiz will appear to students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {watchedQuestions.map((question, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        <Badge variant="outline">{question.points} points</Badge>
                      </div>
                      <p className="text-gray-700 mb-4">{question.question}</p>
                      
                      {question.type === 'MULTIPLE_CHOICE' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input type="radio" disabled />
                              <label>{option}</label>
                              {option === question.correctAnswer && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === 'TRUE_FALSE' && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="radio" disabled />
                            <label>True</label>
                            {question.correctAnswer === true && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="radio" disabled />
                            <label>False</label>
                            {question.correctAnswer === false && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </div>
                      )}

                      {question.type === 'SHORT_ANSWER' && (
                        <div>
                          <textarea disabled className="w-full p-2 border rounded" placeholder="Student answer will appear here..." />
                          <p className="text-sm text-gray-600 mt-1">Sample answer: {question.correctAnswer}</p>
                        </div>
                      )}

                      {question.explanation && (
                        <div className="mt-4 p-3 bg-blue-50 rounded">
                          <p className="text-sm"><strong>Explanation:</strong> {question.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminQuizManagement;
