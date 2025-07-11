import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextUtils';
import { useToast } from '@/hooks/use-toast';
import { authApi as authAPI } from '@/services/authApi';

const EmailVerificationRequired = () => {
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleResendVerification = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "Email address not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsResending(true);
      
      const response = await authAPI.resendVerificationEmail(user.email);
      
      if (response.success) {
        toast({
          title: "Verification Email Sent",
          description: "Please check your email for the verification link.",
        });
      } else {
        throw new Error(response.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      let errorMessage = 'Failed to resend verification email. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/20">
              <Mail className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Email Verification Required
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Welcome to EduKnit Learn! To access your dashboard and all features, please verify your email address.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  We've sent a verification email to:
                </p>
                <p className="font-medium text-eduBlue-600 dark:text-eduBlue-400">
                  {user?.email}
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Mail className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Check your email
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>
                        Click the verification link in your email to activate your account.
                        If you don't see the email, check your spam folder.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full bg-eduBlue-600 hover:bg-eduBlue-700 text-white"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Need help? Contact our support team at support@eduknit.com
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmailVerificationRequired;
