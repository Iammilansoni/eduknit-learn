import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextUtils';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'student' | 'visitor';
  allowedRoles?: ('admin' | 'user' | 'student' | 'visitor')[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
  fallbackPath = '/login'
}) => {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // If authenticated but email not verified, show verification required message
  if (user && !user.isEmailVerified) {
    return <Navigate to="/verify-email-required" replace />;
  }

  // Check role authorization
  const hasAccess = () => {
    if (!user) return false;
    
    // If allowedRoles is specified, check if user's role is in the array
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.includes(user.role as any);
    }
    
    // If requiredRole is specified, check exact match
    if (requiredRole) {
      return user.role === requiredRole;
    }
    
    // If no role restrictions, allow access
    return true;
  };

  // If user doesn't have access
  if (!hasAccess()) {
    // Redirect based on user's actual role
    let redirectPath = '/not-authorized';
    
    if (user?.role === 'admin') {
      redirectPath = '/admin/dashboard';
    } else if (user?.role === 'user') {
      redirectPath = '/student-dashboard';
    } else if (user?.role === 'student') {
      redirectPath = '/student-dashboard';
    } else if (user?.role === 'visitor') {
      redirectPath = '/visitor';
    }

    return <Navigate to={redirectPath} replace />;
  }

  // If user is suspended, redirect to suspension page
  if (user && user.enrollmentStatus === 'suspended') {
    return <Navigate to="/account-suspended" replace />;
  }

  // If user is inactive, redirect to activation page
  if (user && user.enrollmentStatus === 'inactive') {
    return <Navigate to="/account-inactive" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 