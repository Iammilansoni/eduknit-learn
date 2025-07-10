import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Video, 
  Users, 
  BarChart3, 
  Settings,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextUtils';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
}

const AdminNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      description: 'Overview and statistics'
    },
    {
      title: 'Courses',
      path: '/admin/courses',
      icon: <BookOpen className="h-5 w-5" />,
      description: 'Manage course content'
    },
    {
      title: 'Modules',
      path: '/admin/modules',
      icon: <FileText className="h-5 w-5" />,
      description: 'Organize course modules'
    },
    {
      title: 'Users',
      path: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      description: 'Manage user accounts'
    },
    {
      title: 'Analytics',
      path: '/admin/analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'View platform analytics',
      badge: 'New'
    },
    {
      title: 'Settings',
      path: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
      description: 'Platform configuration'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span className="font-semibold">EduKnit</span>
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <span className="text-sm font-medium text-gray-600">Admin Panel</span>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className="flex items-center space-x-2 px-3 py-2"
              >
                {item.icon}
                <span className="hidden sm:inline">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
            {/* Sign Out Button */}
            <Button
              variant="secondary"
              size="sm"
              className="ml-4"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
            >
              Sign Out
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation; 