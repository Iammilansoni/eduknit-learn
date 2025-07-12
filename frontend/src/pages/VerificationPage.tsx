
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { authApi } from '@/services/authApi';
import { useAuth } from '@/contexts/AuthContextUtils';
import { AxiosError } from 'axios';

const VerificationPage = () => {
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const verificationAttempted = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Prevent multiple verification attempts (handles React.StrictMode double calls)
    if (verificationAttempted.current) {
      console.log('Verification already attempted, skipping...');
      return;
    }
    
    const verifyEmail = async () => {
      try {
        // Get token from URL parameters
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        
        if (!token) {
          setVerificationState('error');
          setErrorMessage('Verification token is missing from the URL.');
          verificationAttempted.current = true;
          return;
        }

        console.log('Attempting email verification with token:', token.substring(0, 10) + '...');
        verificationAttempted.current = true;
        
        // Call the verification API
        await authApi.verifyEmail(token);
        console.log('Email verification successful!');
        
        setVerificationState('success');
        console.log('Email verification successful!');
        // Don't auto-reload or auto-redirect - let user control navigation
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationState('error');
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else if (error instanceof AxiosError) {
          const errorMessage = error.response?.data?.message || 'An error occurred during email verification.';
          const errorCode = error.response?.data?.code;
          
          // Handle different error scenarios based on backend response
          if (error.response?.status === 400) {
            if (errorCode === 'EXPIRED_TOKEN') {
              setErrorMessage('This verification link has expired. Please request a new verification email.');
            } else if (errorCode === 'INVALID_OR_USED_TOKEN') {
              setErrorMessage('This verification link has already been used or is invalid. If you have already verified your email, you can proceed to login.');
            } else {
              setErrorMessage(errorMessage);
            }
          } else if (error.response?.status === 200 && errorCode === 'ALREADY_VERIFIED_AND_SEEN') {
            // Handle the case where user already verified and seen the message
            setVerificationState('success');
            setErrorMessage(''); // Clear any error message
          } else {
            setErrorMessage(errorMessage);
          }
        } else {
          setErrorMessage('An error occurred during email verification.');
        }
      }
    };

    verifyEmail();
    
    // Cleanup function to prevent memory leaks
    return () => {
      // No cleanup needed for this effect
    };
  }, [location.search]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            {verificationState === 'loading' && (
              <div className="space-y-4">
                <Loader2 className="mx-auto h-12 w-12 text-eduBlue-500 animate-spin" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Verifying Your Email
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}

            {verificationState === 'success' && (
              <div className="space-y-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      🎉 Email Verification Successful!
                    </h2>
                    <div className="space-y-2">
                      <p className="text-lg text-gray-700 dark:text-gray-300">
                        Email verification successful! Now You can access the Website or student dashboard
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Your email has been verified successfully! Choose where you'd like to go next.
                      </p>
                    </div>
                  </div>
                <div className="space-y-3">
                  <Button 
                    onClick={handleGoHome}
                    className="w-full bg-eduBlue-600 hover:bg-eduBlue-700 text-white"
                  >
                    Go to Home Page
                  </Button>
                  <Button 
                    onClick={() => {
                      // Navigate based on user role if available
                      if (user?.role === 'admin') {
                        navigate('/admin/dashboard');
                      } else if (user?.role === 'user') {
                        navigate('/student-dashboard');
                      } else {
                        navigate('/login');
                      }
                    }}
                    variant="outline"
                    className="w-full border-eduOrange-500 text-eduOrange-600 hover:bg-eduOrange-50"
                  >
                    Access Dashboard
                  </Button>
                </div>
              </div>
            )}

            {verificationState === 'error' && (
              <div className="space-y-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Verification Failed
                  </h2>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {errorMessage}
                    </p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    This might happen if the verification link has expired or has already been used.
                  </p>
                </div>
                <div className="space-y-3">
                  <Button 
                    onClick={handleGoToLogin}
                    className="w-full bg-eduBlue-600 hover:bg-eduBlue-700 text-white"
                  >
                    Go to Login
                  </Button>
                  <Button 
                    onClick={handleGoHome}
                    variant="outline"
                    className="w-full"
                  >
                    Go to Home Page
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerificationPage;
