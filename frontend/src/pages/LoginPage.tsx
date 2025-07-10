import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Eye, EyeOff, Mail } from 'lucide-react';
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

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRegisterMessage, setShowRegisterMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, user, loading } = useAuth();
  
  // Check if user is already logged in
  useEffect(() => {
    console.log('LoginPage useEffect - user:', user, 'loading:', loading);
    if (user && !loading) {
      console.log('User detected, redirecting based on role:', user.role);
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'user' || user.role === 'student') {
        navigate('/student-dashboard', { replace: true });
      } else {
        navigate('/visitor', { replace: true });
      }
    }
  }, [user, loading, navigate]);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      setShowRegisterMessage(false); // Reset the message on new attempt
      setShowSuccessMessage(false); // Reset success message
      
      console.log('Attempting login with:', data.email);
      await login({
        email: data.email,
        password: data.password,
      });
      
      console.log('Login successful, user state should be updated');
      
      // Login successful - show success message and redirect immediately
      setShowSuccessMessage(true);
      
      // Use a shorter timeout and force redirect
      setTimeout(() => {
        console.log('Timeout redirect triggered');
        // Force redirect based on user role (the useEffect should also handle this)
        if (user?.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/student-dashboard', { replace: true });
        }
      }, 1000);
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      // Check for authentication errors that might indicate non-existent account
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          const errorMessage = error.response?.data?.message || '';
          
          // If it's an "Invalid credentials" error, we'll provide helpful guidance
          if (errorMessage.toLowerCase().includes('invalid credentials')) {
            setShowRegisterMessage(true);
            
            // Automatically redirect to registration after showing the message
            setTimeout(() => {
              navigate('/register');
            }, 3000);
            return;
          }
        }
      }
      
      // For other errors, let AuthContext handle the display
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back, Bright Mind!</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Enter your credentials to access your student dashboard and keep learning strong. We're excited to have you again!
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
                      Login Successful!
                    </h3>
                    <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                      <p>Welcome back! Redirecting to your dashboard...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {showRegisterMessage && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Account Not Found
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>You don't have an account. Please register first.</p>
                      <p className="mt-1">Redirecting to registration page in a few seconds...</p>
                    </div>
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-300 text-red-800 hover:bg-red-100 dark:border-red-600 dark:text-red-200 dark:hover:bg-red-800"
                        onClick={() => navigate('/register')}
                      >
                        Register Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          placeholder="you@example.com" 
                          {...field}
                          className="pl-10"
                          disabled={isSubmitting}
                        />
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Password</FormLabel>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-sm text-eduBlue-500"
                        onClick={() => navigate('/forgot-password')}
                        type="button"
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          {...field}
                          className="pr-10"
                          disabled={isSubmitting}
                        />
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

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Don't have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto text-eduBlue-500"
                onClick={() => navigate('/register')}
              >
                Sign up here
              </Button>
            </p>
          </div>

          {/* Demo credentials for testing */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Demo Credentials:</h3>
              <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <p><strong>Admin:</strong> admin@eduknit.com / Admin123!</p>
                <p><strong>User:</strong> user@eduknit.com / User123!</p>
                <p><strong>Visitor:</strong> visitor@eduknit.com / Visitor123!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
