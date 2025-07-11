import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Lock, Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { authApi as authAPI } from '@/services/authApi';
import { useToast } from '@/hooks/use-toast';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password');

  // Debug state changes
  useEffect(() => {
    console.log('State changed - isTokenValid:', isTokenValid, 'token:', token);
  }, [isTokenValid, token]);

  useEffect(() => {
    console.log('ResetPasswordPage useEffect triggered');
    console.log('Current location:', location.pathname, location.search);
    
    // Get token from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const resetToken = urlParams.get('token');
    
    console.log('Reset token from URL:', resetToken);
    
    if (!resetToken) {
      console.log('No token found in URL');
      setIsTokenValid(false);
      toast({
        title: "Invalid Reset Link",
        description: "The password reset link is invalid or missing.",
        variant: "destructive",
      });
      return;
    }
    
    setToken(resetToken);
    
    // Validate token with backend
    const validateToken = async () => {
      try {
        console.log('Validating token:', resetToken);
        const response = await authAPI.validateResetToken(resetToken);
        console.log('Token validation response:', response);
        if (response.success) {
          setIsTokenValid(true);
          console.log('Token is valid');
        } else {
          setIsTokenValid(false);
          console.log('Token is invalid:', response.message);
          toast({
            title: "Invalid Reset Link",
            description: response.message || "The password reset link is invalid or has expired.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setIsTokenValid(false);
        toast({
          title: "Invalid Reset Link",
          description: "The password reset link is invalid or has expired.",
          variant: "destructive",
        });
      }
    };
    
    validateToken();
  }, [location.search, toast]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid reset token. Please request a new password reset.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await authAPI.resetPassword(token, data.password);
      
      if (response.success) {
        setIsResetComplete(true);
        
        toast({
          title: "Password Reset Successful",
          description: "Your password has been reset successfully. You can now log in with your new password.",
        });
      } else {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    
    const strength = {
      0: { text: 'Very Weak', color: 'text-red-500' },
      1: { text: 'Weak', color: 'text-red-500' },
      2: { text: 'Fair', color: 'text-yellow-500' },
      3: { text: 'Good', color: 'text-blue-500' },
      4: { text: 'Strong', color: 'text-green-500' },
      5: { text: 'Very Strong', color: 'text-green-600' },
    };
    
    return { score, ...strength[score] };
  };

  const passwordStrength = getPasswordStrength(password || '');

  if (isTokenValid === false) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                Invalid Reset Link
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                The password reset link is invalid or has expired.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      This might happen if the reset link has expired (links expire after 1 hour) 
                      or has already been used. Please request a new password reset.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => navigate('/forgot-password')}
                      className="w-full bg-eduBlue-600 hover:bg-eduBlue-700 text-white"
                    >
                      Request New Reset Link
                    </Button>

                    <Button
                      onClick={() => navigate('/login')}
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (isResetComplete) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                Password Reset Complete
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Your password has been successfully reset.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      You can now log in to your account using your new password.
                    </p>
                  </div>

                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full bg-eduBlue-600 hover:bg-eduBlue-700 text-white"
                  >
                    Continue to Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (isTokenValid === null) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Reset Your Password
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Enter your new password below.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-center">Create New Password</CardTitle>
              <CardDescription className="text-center">
                Choose a strong password for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your new password"
                      {...register('password')}
                      className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {password && (
                    <div className="text-xs">
                      <span className={passwordStrength.color}>
                        Password strength: {passwordStrength.text}
                      </span>
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      {...register('confirmPassword')}
                      className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Password Requirements:
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• At least one uppercase letter</li>
                    <li>• At least one lowercase letter</li>
                    <li>• At least one number</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-eduBlue-600 hover:bg-eduBlue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-eduBlue-600 hover:text-eduBlue-500 dark:text-eduBlue-400 dark:hover:text-eduBlue-300"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;
