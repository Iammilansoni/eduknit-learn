import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle2, 
  XCircle, 
  Timer, 
  Trophy,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { useProgressTracking } from '@/hooks/useProgressTracking';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'text';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

interface QuizProgressTrackerProps {
  lessonId: string;
  quizId?: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number; // percentage
  timeLimit?: number; // in minutes
  allowRetake?: boolean;
  maxAttempts?: number;
  onComplete?: (score: number, passed: boolean) => void;
  className?: string;
}

const QuizProgressTracker: React.FC<QuizProgressTrackerProps> = ({
  lessonId,
  quizId = 'default',
  title,
  description,
  questions,
  passingScore = 70,
  timeLimit,
  allowRetake = true,
  maxAttempts = 3,
  onComplete,
  className = ''
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit ? timeLimit * 60 : null); // in seconds
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const { recordQuizResult, loading } = useProgressTracking();

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
  const finalPercentage = (score / maxScore) * 100;
  const passed = finalPercentage >= passingScore;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (quizStarted && !quizCompleted && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev <= 1) {
            // Time's up - auto submit
            setQuizCompleted(true);
            setShowResults(true);
            toast({
              title: "Time's Up!",
              description: "The quiz has been automatically submitted.",
              variant: "destructive"
            });
            return 0;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [quizStarted, quizCompleted, timeLeft]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setStartTime(new Date());
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizCompleted(false);
    setShowResults(false);
    
    toast({
      title: "Quiz Started!",
      description: timeLimit ? `You have ${timeLimit} minutes to complete this quiz.` : "Take your time to answer all questions."
    });
  };

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    const questionResults: Record<string, boolean> = {};

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      const correctAnswer = question.correctAnswer;
      
      let isCorrect = false;
      
      if (question.type === 'single') {
        isCorrect = userAnswer === correctAnswer;
      } else if (question.type === 'multiple') {
        const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [];
        const correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
        isCorrect = userAnswerArray.length === correctAnswerArray.length &&
                   userAnswerArray.every(ans => correctAnswerArray.includes(ans));
      } else if (question.type === 'text') {
        isCorrect = userAnswer?.toString().toLowerCase().trim() === 
                   correctAnswer.toString().toLowerCase().trim();
      }
      
      questionResults[question.id] = isCorrect;
      if (isCorrect) {
        totalScore += question.points;
      }
    });

    setScore(totalScore);
    setResults(questionResults);
    return { totalScore, questionResults };
  };

  const handleSubmitQuiz = async () => {
    const { totalScore } = calculateScore();
    const timeSpent = startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000 / 60) : 0;
    
    const quizAnswers = questions.map(question => ({
      questionId: question.id,
      answer: answers[question.id] || '',
      isCorrect: results[question.id] || false,
      pointsAwarded: results[question.id] ? question.points : 0
    }));

    try {
      await recordQuizResult(lessonId, {
        quizId,
        score: totalScore,
        maxScore,
        passingScore,
        timeSpent,
        answers: quizAnswers
      });

      setQuizCompleted(true);
      setShowResults(true);
      
      onComplete?.(totalScore, finalPercentage >= passingScore);
      
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRetakeQuiz = () => {
    if (attemptNumber >= maxAttempts) {
      toast({
        title: "Maximum Attempts Reached",
        description: `You have reached the maximum number of attempts (${maxAttempts}).`,
        variant: "destructive"
      });
      return;
    }
    
    setAttemptNumber(prev => prev + 1);
    setTimeLeft(timeLimit ? timeLimit * 60 : null);
    handleStartQuiz();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (question: QuizQuestion) => {
    const userAnswer = answers[question.id];
    
    switch (question.type) {
      case 'single':
        return (
          <RadioGroup
            value={userAnswer as string || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
            className="space-y-3"
          >
            {question.options?.map((option, index) => (
              <div key={`${question.id}-option-${index}`} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
        
      case 'multiple':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const isChecked = Array.isArray(userAnswer) ? userAnswer.includes(option) : false;
              return (
                <div key={`${question.id}-option-${index}`} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const currentAnswers = Array.isArray(userAnswer) ? userAnswer : [];
                      if (checked) {
                        handleAnswerChange(question.id, [...currentAnswers, option]);
                      } else {
                        handleAnswerChange(question.id, currentAnswers.filter(a => a !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        );
        
      case 'text':
        return (
          <textarea
            value={userAnswer as string || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer here..."
            className="w-full p-3 border rounded-md resize-none"
            rows={4}
          />
        );
        
      default:
        return null;
    }
  };

  if (!quizStarted) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            {title}
          </CardTitle>
          {description && <p className="text-gray-600">{description}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Questions:</span>
              <Badge variant="outline">{totalQuestions}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Passing Score:</span>
              <Badge variant="outline">{passingScore}%</Badge>
            </div>
            {timeLimit && (
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                <span className="font-medium">Time Limit:</span>
                <Badge variant="outline">{timeLimit} minutes</Badge>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-medium">Attempts:</span>
              <Badge variant="outline">{attemptNumber}/{maxAttempts}</Badge>
            </div>
          </div>
          
          <Button onClick={handleStartQuiz} className="w-full">
            {attemptNumber > 1 ? 'Retake Quiz' : 'Start Quiz'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {passed ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            Quiz {passed ? 'Passed!' : 'Not Passed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold">
              {Math.round(finalPercentage)}%
            </div>
            <div className="text-gray-600">
              {score} out of {maxScore} points
            </div>
            <Badge 
              className={passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
              variant="outline"
            >
              {passed ? 'Passed' : 'Failed'} - Need {passingScore}% to pass
            </Badge>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Question Results:</h3>
            {questions.map((question, index) => {
              const isCorrect = results[question.id];
              return (
                <div key={question.id} className="flex items-center justify-between p-3 border rounded">
                  <span className="flex-1">Question {index + 1}</span>
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {isCorrect ? question.points : 0}/{question.points} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {allowRetake && !passed && attemptNumber < maxAttempts && (
            <Button onClick={handleRetakeQuiz} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz (Attempt {attemptNumber + 1}/{maxAttempts})
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </CardTitle>
          {timeLeft !== null && (
            <Badge 
              variant="outline" 
              className={timeLeft < 300 ? 'text-red-600 border-red-300' : ''}
            >
              <Timer className="w-4 h-4 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
          )}
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
              {renderQuestion(currentQuestion)}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          <span className="text-sm text-gray-500">
            {Object.keys(answers).length} of {totalQuestions} answered
          </span>
          
          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button 
              onClick={handleSubmitQuiz}
              disabled={loading || Object.keys(answers).length < totalQuestions}
            >
              {loading ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={!answers[currentQuestion.id]}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizProgressTracker;
