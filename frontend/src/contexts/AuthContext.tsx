import React, { useState, ReactNode } from "react";
import axios from "axios";
import { useToast } from "../hooks/use-toast";
import { AuthContext } from "./AuthContextContext";
import { authApi, type AuthUser, type LoginCredentials, type RegisterData } from "../services/authApi";

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  register: (formData: RegisterData) => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendEmailVerification: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const toast = useToast();

  // Check if user is authenticated on app load
  React.useEffect(() => {
    if (authChecked) return; // Prevent multiple auth checks
    
    // Skip auth check on public pages
    const publicPages = [
      '/login',
      '/register', 
      '/forgot-password',
      '/reset-password',
      '/verify-email',
      '/verification',
      '/verify',
      '/',
      '/about',
      '/overview',
      '/features',
      '/testimonials',
      '/programs',
      '/chat',
      '/blog',
      '/support'
    ];
    
    const currentPath = window.location.pathname;
    const isPublicPage = publicPages.some(page => currentPath === page || currentPath.startsWith('/programs/') || currentPath.startsWith('/blog/'));
    
    if (isPublicPage) {
      setLoading(false);
      setAuthChecked(true);
      return;
    }
    
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // First check if we have user data in localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData); // Set user from localStorage immediately
          } catch (e) {
            localStorage.removeItem("user"); // Clear corrupted data
          }
        }
        
        // Then verify with backend using our authApi
        const userData = await authApi.getCurrentUser();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        // If error, user is not authenticated - this is normal
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [authChecked]);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('AuthContext login called with:', credentials.email);
      setLoading(true);

      const userData = await authApi.login(credentials);
      console.log('Login API response:', userData);
      
      // The API now returns the user object directly
      setUser(userData as AuthUser);
      localStorage.setItem("user", JSON.stringify(userData));
      setAuthChecked(true); // Mark auth as checked since we just logged in
      
      console.log('User state updated to:', userData);

      toast.toast({
        title: "Login Successful!",
        description: "Welcome back! Redirecting to your dashboard...",
      });

      return; // Successfully completed
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      console.log('Login finally block - setting loading to false');
      setLoading(false); // Always set loading to false
    }
  };

  const register = async (formData: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      await authApi.register(formData);

      // Registration was successful - do not auto-login until email is verified
      setUser(null);
      localStorage.removeItem("user");
      
      toast.toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account.",
      });
    } catch (error) {
      let message = "Registration failed.";
      let isEmailConflict = false;
      
      if (axios.isAxiosError(error)) {
        isEmailConflict = error.response?.status === 409;
        if (error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error.message) {
          message = error.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      // Only show toast for non-conflict errors (RegisterPage handles conflict UI)
      if (!isEmailConflict) {
        console.error("Registration error details:", error);
        
        toast.toast({ 
          title: "Registration Error", 
          description: message,
          variant: "destructive"
        });
      }
      
      throw error; // Re-throw so calling component can handle it
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setAuthChecked(true);
      localStorage.removeItem("user");

      toast.toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
    }
  };

  // Forgot password
  const forgotPassword = async (email: string) => {
    try {
      await authApi.forgotPassword({ email });
      toast.toast({
        title: "Reset Email Sent",
        description: "Please check your email for password reset instructions.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send reset email";
      toast.toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (token: string, password: string) => {
    try {
      await authApi.resetPassword({ token, password });
      toast.toast({
        title: "Password Reset Successful",
        description: "Your password has been reset. You can now log in with your new password.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reset password";
      toast.toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Verify email
  const verifyEmail = async (token: string) => {
    try {
      await authApi.verifyEmail(token);
      // After successful verification, get updated user data
      try {
        const userData = await authApi.getCurrentUser();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error("Error getting user after verification:", error);
      }
      
      toast.toast({
        title: "Email Verified",
        description: "Your email has been verified successfully!",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Email verification failed";
      toast.toast({
        title: "Verification Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Resend email verification
  const resendEmailVerification = async (email: string) => {
    try {
      await authApi.resendEmailVerification(email);
      toast.toast({
        title: "Verification Email Sent",
        description: "Please check your email for verification instructions.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to resend verification email";
      toast.toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to change password";
      toast.toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendEmailVerification,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Do NOT export useAuth from this file. Only export AuthProvider and AuthContextType.
