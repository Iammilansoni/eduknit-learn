import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextUtils';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield,
  ArrowLeft,
  Home,
  User,
  Settings
} from 'lucide-react';

const NotAuthorizedPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getRedirectPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'user':
        return '/student-dashboard';
      case 'visitor':
        return '/visitor';
      default:
        return '/';
    }
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            {/* Icon */}
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-12 w-12 text-red-600" />
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Access Denied
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Sorry, you don't have permission to access this page. 
              {user && (
                <span className="block mt-2">
                  You are currently logged in as a <Badge className="ml-1">{user.role}</Badge>
                </span>
              )}
            </p>

            {/* User Info Card */}
            {user && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Your Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-left">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Username:</span>
                      <span className="text-sm font-medium">@{user.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="text-sm font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Role:</span>
                      <Badge variant="secondary">{user.role}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <Badge 
                        variant={user.enrollmentStatus === 'active' ? 'default' : 'destructive'}
                      >
                        {user.enrollmentStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate(getRedirectPath())}
                  className="flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go to Your Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex items-center"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>

              {user && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-4">
                    Need different access? Contact your administrator or try a different account.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={logout}
                      className="flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/login')}
                      className="flex items-center"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Switch Account
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Help Section */}
            <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                If you believe you should have access to this page, please contact support.
              </p>
              <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotAuthorizedPage; 