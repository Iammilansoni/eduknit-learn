import React, { useState, ReactNode } from "react";
import axios from "axios";
import api, { ApiResponse, User, RegisterData, LoginCredentials } from "../services/api";
import { useToast } from "../hooks/use-toast";
import { AuthContext } from "./AuthContextContext";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (formData: RegisterData) => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  // ...other methods...
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
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
        
        // Then verify with backend - backend will check HTTP-only cookies
        const response = await api.get<ApiResponse<User>>("/auth/me");
        if (response.data.success && response.data.data) {
          setUser(response.data.data);
          localStorage.setItem("user", JSON.stringify(response.data.data));
        } else {
          // Not authenticated, clear any stored user data
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (error) {
        // If 401, user is simply not authenticated - this is normal
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          // Silently handle - user is not logged in
          localStorage.removeItem("user");
          setUser(null);
        } else {
          console.error("Auth check error:", error);
          localStorage.removeItem("user");
          setUser(null);
        }
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
      setLoading(true);

      const response = await api.post<ApiResponse<User>>("/auth/login", credentials);

      if (response.data.success && response.data.data) {
        setUser(response.data.data);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        setAuthChecked(true); // Mark auth as checked since we just logged in
        
        // Note: Tokens are handled via HTTP-only cookies by the backend
        // No need to store tokens in localStorage for security

        toast.toast({
          title: "Login Successful!",
          description: "Welcome back! Redirecting to your dashboard...",
        });

        // Note: Navigation should be handled by the calling component
        // Return success to let the component handle navigation
        return; // Successfully completed - don't throw error
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed";
      
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          const data = error.response.data as Record<string, unknown>;
          if (typeof data.error === 'object' && data.error && 'message' in data.error) {
            errorMessage = String(data.error.message);
          } else if (typeof data.message === 'string') {
            errorMessage = data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      const res = await api.post<ApiResponse<User>>("/auth/register", formData);

      if (res.data.success) {
        // Registration was successful - do not auto-login until email is verified
        // Clear any existing user data
        setUser(null);
        localStorage.removeItem("user");
        
        toast.toast({
          title: "Registration Successful!",
          description: res.data.message || "Please check your email to verify your account.",
        });

        // Note: Navigation should be handled by the calling component
        // Return success to let the component handle navigation
      } else {
        throw new Error(res.data.message || "Registration failed");
      }
    } catch (err) {
      let message = "Registration failed.";
      let isEmailConflict = false;
      
      if (axios.isAxiosError(err)) {
        // Check if this is an email conflict (409 status)
        isEmailConflict = err.response?.status === 409;
        
        if (err.response?.data) {
          const data = err.response.data as Record<string, unknown>;
          // Check for error message in different possible locations
          if (typeof data.error === 'object' && data.error && 'message' in data.error) {
            message = String(data.error.message);
          } else if (typeof data.message === 'string') {
            message = data.message;
          } else if (Array.isArray(data.errors)) {
            message = data.errors.map((e: unknown) => 
              typeof e === 'object' && e && 'message' in e ? String(e.message) : String(e)
            ).join(', ');
          }
        } else if (err.message) {
          message = err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      
      // Only show toast for non-conflict errors (RegisterPage handles conflict UI)
      if (!isEmailConflict) {
        // Log the full error to help with debugging
        console.error("Registration error details:", err);
        if (axios.isAxiosError(err) && err.response?.data) {
          console.error("Response data:", err.response.data);
          console.error("Error object:", err.response.data.error);
        }
        
        toast.toast({ 
          title: "Registration Error", 
          description: message,
          variant: "destructive"
        });
      }
      
      throw err; // Re-throw so calling component can handle it
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setAuthChecked(true); // Mark as checked so we don't trigger auth check again
      localStorage.removeItem("user");
      // HTTP-only cookies are cleared by the backend

      toast.toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });

      // Note: Navigation should be handled by the calling component
      // Components should handle their own navigation after logout
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Do NOT export useAuth from this file. Only export AuthProvider and AuthContextType.
