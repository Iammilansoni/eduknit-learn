# Frontend Integration Guide

This guide provides comprehensive instructions for integrating the EduKnit Learn Backend API with your React frontend application.

## 🔗 API Base Configuration

### Base URL
```typescript
// Development
const API_BASE_URL = 'http://localhost:5000/api';

// Production
const API_BASE_URL = 'https://api.eduknit.com/api';
```

## 📡 API Client Setup

### Axios Configuration
```typescript
// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      withCredentials: true, // Important for cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors and token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshResponse = await this.client.post('/auth/refresh');
            const { accessToken } = refreshResponse.data.data;
            
            localStorage.setItem('accessToken', accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

### TypeScript Interfaces
```typescript
// src/types/api.ts

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user' | 'visitor';
  isEmailVerified: boolean;
  enrollmentStatus: 'active' | 'inactive' | 'suspended';
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'user' | 'visitor';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}
```

## 🔐 Authentication Integration

### Authentication Service
```typescript
// src/services/authService.ts
import { apiClient } from './api';
import { User, RegisterData, LoginData, ApiResponse } from '../types/api';

export class AuthService {
  async register(data: RegisterData): Promise<ApiResponse<User>> {
    return apiClient.post<ApiResponse<User>>('/auth/register', data);
  }

  async login(data: LoginData): Promise<ApiResponse<User>> {
    return apiClient.post<ApiResponse<User>>('/auth/login', data);
  }

  async logout(): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/logout');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<ApiResponse<User>>('/auth/me');
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/reset-password', {
      token,
      newPassword,
    });
  }

  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    return apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
  }
}

export const authService = new AuthService();
```

### Authentication Context
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/api';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    if (response.success && response.data) {
      setUser(response.data);
    } else {
      throw new Error(response.error?.message || 'Login failed');
    }
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    if (response.success && response.data) {
      setUser(response.data);
    } else {
      throw new Error(response.error?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
    }
  };

  const forgotPassword = async (email: string) => {
    const response = await authService.forgotPassword(email);
    if (!response.success) {
      throw new Error(response.error?.message || 'Password reset failed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## 🎯 Usage Examples

### Login Component
```typescript
// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // Redirect to dashboard or home page
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### Protected Route Component
```typescript
// src/components/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'visitor';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### User Profile Component
```typescript
// src/components/UserProfile.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { User } from '../types/api';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await apiClient.get<{ data: User }>(`/user/${user?.id}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {profile.firstName} {profile.lastName}</p>
      <p>Email: {profile.email}</p>
      <p>Role: {profile.role}</p>
      <p>Status: {profile.enrollmentStatus}</p>
    </div>
  );
};
```

## 🔧 Error Handling

### Error Handler Hook
```typescript
// src/hooks/useErrorHandler.ts
import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: any) => {
    if (err.response?.data?.error?.message) {
      setError(err.response.data.error.message);
    } else if (err.message) {
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};
```

### Toast Notifications
```typescript
// src/components/Toast.tsx
import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  );
};
```

## 🌐 Environment Configuration

### Vite Environment Variables
```env
# .env.development
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=EduKnit Learn

# .env.production
VITE_API_URL=https://api.eduknit.com/api
VITE_APP_NAME=EduKnit Learn
```

### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

## 🧪 Testing Integration

### Mock API for Testing
```typescript
// src/tests/mocks/apiMock.ts
import { rest } from 'msw';

export const handlers = [
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          role: 'user',
        },
        message: 'Login successful',
      })
    );
  }),

  rest.get('/api/auth/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          role: 'user',
        },
      })
    );
  }),
];
```

## 📱 Mobile Considerations

### Responsive API Client
```typescript
// src/services/mobileApiClient.ts
import { apiClient } from './api';

class MobileApiClient extends ApiClient {
  constructor() {
    super();
    
    // Add mobile-specific headers
    this.client.defaults.headers.common['X-Platform'] = 'mobile';
    this.client.defaults.headers.common['X-App-Version'] = '1.0.0';
  }

  // Override timeout for mobile networks
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const mobileConfig = {
      ...config,
      timeout: 15000, // Longer timeout for mobile
    };
    return super.request(mobileConfig);
  }
}

export const mobileApiClient = new MobileApiClient();
```

## 🔒 Security Best Practices

1. **Never store sensitive data in localStorage**
   - Use HTTP-only cookies for tokens
   - Clear tokens on logout

2. **Validate all inputs**
   - Use TypeScript for type safety
   - Validate on both client and server

3. **Handle errors gracefully**
   - Don't expose sensitive information
   - Provide user-friendly error messages

4. **Implement proper loading states**
   - Show loading indicators
   - Disable forms during submission

5. **Use HTTPS in production**
   - Ensure all API calls use HTTPS
   - Configure CORS properly

## 🚀 Performance Optimization

1. **Implement request caching**
   - Cache user data
   - Use React Query or SWR

2. **Optimize bundle size**
   - Code splitting
   - Tree shaking

3. **Implement retry logic**
   - Retry failed requests
   - Exponential backoff

4. **Use optimistic updates**
   - Update UI immediately
   - Rollback on error

---

This integration guide provides a solid foundation for connecting your React frontend to the EduKnit Learn Backend API. For additional support or questions, please refer to the API documentation or contact the development team. 