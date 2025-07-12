import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Public Pages
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import OverviewPage from "./pages/OverviewPage";
import FeaturesPage from "./pages/FeaturesPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import ProgramsPage from "./pages/ProgramsPage";
import ProgramDetailPage from "./pages/ProgramDetailPage";
import CourseDetailPage from "./pages/courses/CourseDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerificationPage from "./pages/VerificationPage";
import ChatPage from "./pages/ChatPage";
import SupportPage from "./pages/SupportPage";
import BlogPage from "./pages/BlogPage";
import BlogPostDetail from "./components/blog/BlogPostDetail";

// Program Pages
import CommunicationSkillsPage from "./pages/programs/CommunicationSkillsPage";
import DigitalMarketingPage from "./pages/programs/DigitalMarketingPage";
import BasicsOfAIPage from "./pages/programs/BasicsOfAIPage";
import AIPromptCraftingPage from "./pages/programs/AIPromptCraftingPage";
import DataAnalyticsPage from "./pages/programs/DataAnalyticsPage";
import BioSkillsPage from "./pages/programs/BioSkillsPage";
import DecisionMakingPage from "./pages/programs/DecisionMakingPage";

// Dashboard Pages
import AdminPage from "./pages/AdminPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourseManagement from './pages/admin/AdminCourseManagement';
import AdminModuleManagement from './pages/admin/AdminModuleManagement';
import AdminLessonManagement from './pages/admin/AdminLessonManagement';
import AdminQuizManagement from './pages/admin/AdminQuizManagement';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import StudentDashboardPage from "./pages/StudentDashboardPage";
import StudentProfilePage from "./pages/StudentProfilePageNew";
import StudentAnalyticsPage from "./pages/StudentAnalyticsPage";
import MyCoursesPage from "./pages/courses/MyCoursesPage";
import LessonPage from "./pages/lessons/LessonPage";
import StudentQuizPage from "./pages/StudentQuizPage";
import IntegrationSettingsPage from "./pages/IntegrationSettingsPage";
import VisitorPage from "./pages/VisitorPage";
import NotAuthorizedPage from "./pages/NotAuthorizedPage";
import EmailVerificationRequired from "./pages/EmailVerificationRequired";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProgressTestPage from "./pages/ProgressTestPage";
import CalendarPage from './pages/dashboard/CalendarPage';
import AssignmentsPage from './pages/dashboard/AssignmentsPage';
import LiveSessionsPage from './pages/dashboard/LiveSessionsPage';
import HelpSupportPage from './pages/dashboard/HelpSupportPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import SettingsPage from './pages/dashboard/SettingsPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/programs/:slug" element={<ProgramDetailPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostDetail />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerificationPage />} />
            <Route path="/verification" element={<VerificationPage />} />
            <Route path="/verify-email" element={<VerificationPage />} />
            <Route path="/verify-email-required" element={<EmailVerificationRequired />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/courses" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminCourseManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/modules" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminModuleManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/modules/:moduleId/lessons" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLessonManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/lessons/:lessonId/quiz" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminQuizManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/analytics" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['student', 'user']}>
                  <StudentDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/profile" 
              element={
                <ProtectedRoute allowedRoles={['student', 'user']}>
                  <StudentProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/analytics" 
              element={
                <ProtectedRoute allowedRoles={['student', 'user']}>
                  <StudentAnalyticsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/my-courses" 
              element={
                <ProtectedRoute allowedRoles={['student', 'user']}>
                  <MyCoursesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student-dashboard/courses" 
              element={
                <ProtectedRoute allowedRoles={['student', 'user']}>
                  <MyCoursesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student-dashboard/courses/:courseId" 
              element={
                <ProtectedRoute allowedRoles={['student', 'user']}>
                  <CourseDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student-dashboard/lessons/:lessonId" 
              element={
                <ProtectedRoute allowedRoles={['student', 'user']}>
                  <LessonPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/lessons/:lessonId" 
              element={
                <ProtectedRoute allowedRoles={['student', 'user']}>
                  <LessonPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/lessons/:lessonId/quiz" 
              element={
                <ProtectedRoute allowedRoles={['student', 'user']}>
                  <StudentQuizPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/integrations" 
              element={
                <ProtectedRoute allowedRoles={['student', 'user']}>
                  <IntegrationSettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/visitor" 
              element={
                <ProtectedRoute requiredRole="visitor">
                  <VisitorPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Progress Testing Route */}
            <Route 
              path="/test/progress" 
              element={
                <ProtectedRoute allowedRoles={['student', 'user', 'admin']}>
                  <ProgressTestPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Error Pages */}
            <Route path="/not-authorized" element={<NotAuthorizedPage />} />
            
            {/* Legacy Route Redirects */}
            <Route path="/user/dashboard" element={<Navigate to="/student-dashboard" replace />} />
            
            {/* Program Routes */}
            <Route path="/programs/communication-skills" element={<CommunicationSkillsPage />} />
            <Route path="/programs/digital-marketing" element={<DigitalMarketingPage />} />
            <Route path="/programs/basics-of-ai" element={<BasicsOfAIPage />} />
            <Route path="/programs/ai-prompt-crafting" element={<AIPromptCraftingPage />} />
            <Route path="/programs/data-analytics" element={<DataAnalyticsPage />} />
            <Route path="/programs/bioskills" element={<BioSkillsPage />} />
            <Route path="/programs/decision-making" element={<DecisionMakingPage />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><StudentDashboardPage /></ProtectedRoute>} />
            <Route path="/dashboard/analytics" element={<ProtectedRoute><StudentAnalyticsPage /></ProtectedRoute>} />
            <Route path="/dashboard/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/dashboard/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
            <Route path="/dashboard/live-sessions" element={<ProtectedRoute><LiveSessionsPage /></ProtectedRoute>} />
            <Route path="/dashboard/help-support" element={<ProtectedRoute><HelpSupportPage /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><StudentProfilePage /></ProtectedRoute>} />
            <Route path="/student-dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            
            {/* Student Dashboard Routes - Add missing routes */}
            <Route path="/student-dashboard/analytics" element={<ProtectedRoute allowedRoles={['student', 'user']}><StudentAnalyticsPage /></ProtectedRoute>} />
            <Route path="/student-dashboard/calendar" element={<ProtectedRoute allowedRoles={['student', 'user']}><CalendarPage /></ProtectedRoute>} />
            <Route path="/student-dashboard/assignments" element={<ProtectedRoute allowedRoles={['student', 'user']}><AssignmentsPage /></ProtectedRoute>} />
            <Route path="/student-dashboard/live-sessions" element={<ProtectedRoute allowedRoles={['student', 'user']}><LiveSessionsPage /></ProtectedRoute>} />
            <Route path="/student-dashboard/help" element={<ProtectedRoute allowedRoles={['student', 'user']}><HelpSupportPage /></ProtectedRoute>} />
            
            <Route path="/admin/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
