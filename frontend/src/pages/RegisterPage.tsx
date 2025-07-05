import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Eye, EyeOff, Mail, User, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContextUtils';

const registerSchema = z.object({
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters.' })
    .max(30, { message: 'Username must be less than 30 characters.' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.' 
    }),
  confirmPassword: z.string(),
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showEmailExistsMessage, setShowEmailExistsMessage] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, user, loading } = useAuth();
  
  // Check if user is already logged in
  useEffect(() => {
    if (user && !loading) {
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'user' || user.role === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/visitor');
      }
    }
  }, [user, loading, navigate]);
  
  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current);
        countdownTimer.current = null;
      }
    };
  }, []);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      setShowSuccessMessage(false);
      setShowEmailExistsMessage(false);
      await register({
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'student', // Default to student role
      });
      
      // Registration successful - show success message and start countdown
      setShowSuccessMessage(true);
      setRegisteredEmail(data.email);
      
      // Start 30-second countdown timer
      countdownTimer.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownTimer.current) {
              clearInterval(countdownTimer.current);
              countdownTimer.current = null;
            }
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: unknown) {
      // Check if it's an email conflict error
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          // This is expected - show UI message and redirect to login page
          setShowEmailExistsMessage(true);
          
          // Clear the form to prepare for potential retry or redirect
          form.reset();
          
          // Redirect to login page after a short delay
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
      }
      
      // Log only unexpected errors
      console.error('Unexpected registration error:', error);
      // Error handling is done in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Join EduKnit Learn!</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Create your account and start your learning journey with us. We're excited to have you on board!
            </p>
          </div>

          <Form {...form}>
            {showSuccessMessage && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                      🎉 Registration Successful!
                    </h3>
                    <div className="mt-2 text-sm text-green-700 dark:text-green-300 space-y-2">
                      <p>Welcome to EduKnit Learn! Your account has been created successfully.</p>
                      <p className="font-medium">📧 Check your email ({registeredEmail}) for a verification link.</p>
                      <p>You'll need to verify your email before you can log in.</p>
                      <div className="mt-3 p-2 bg-green-100 dark:bg-green-800/50 rounded border">
                        <p className="font-medium">Redirecting to login page in {countdown} seconds...</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-green-300 text-green-800 hover:bg-green-100 dark:border-green-600 dark:text-green-200 dark:hover:bg-green-800"
                        onClick={() => {
                          // Clear timer before navigating
                          if (countdownTimer.current) {
                            clearInterval(countdownTimer.current);
                            countdownTimer.current = null;
                          }
                          navigate('/login');
                        }}
                      >
                        Go to Login Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {showEmailExistsMessage && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Email Already Registered
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>This email is already registered. Redirecting to login page...</p>
                    </div>
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-200 dark:hover:bg-yellow-800"
                        onClick={() => navigate('/login')}
                      >
                        Go to Login
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John" 
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Doe" 
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="johndoe" 
                          {...field}
                          className="pl-10"
                          disabled={isSubmitting}
                        />
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="email" 
                          placeholder="john@example.com" 
                          {...field}
                          className="pl-10"
                          disabled={isSubmitting}
                        />
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                    {form.formState.errors.email?.message?.includes('already registered') && (
                      <p className="text-sm text-blue-600 mt-1">
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-sm text-blue-600 underline"
                          onClick={() => navigate('/login')}
                        >
                          Go to login page
                        </Button>
                      </p>
                    )}
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          {...field}
                          className="pl-10 pr-10"
                          disabled={isSubmitting}
                        />
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          {...field}
                          className="pl-10 pr-10"
                          disabled={isSubmitting}
                        />
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Already have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto text-eduBlue-500"
                onClick={() => navigate('/login')}
              >
                Sign in here
              </Button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
