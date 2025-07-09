import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Home, 
  BarChart3, 
  User, 
  Settings, 
  LogOut,
  Calendar,
  FileText,
  Video,
  HelpCircle,
  BookOpen,
  Menu,
  X
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContextUtils';
import { studentAPI } from '@/services/api';

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon: Icon, label, active }) => {
  return (
    <Link to={to} className="w-full">
      <Button 
        variant="ghost" 
        className={cn(
          "w-full justify-start gap-3 font-normal h-10",
          active ? "bg-gray-100 dark:bg-gray-800 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
      >
        <Icon className={cn("h-4 w-4", active ? "text-eduBlue-500" : "text-gray-500")} />
        {label}
      </Button>
    </Link>
  );
};

interface DashboardSidebarProps {
  className?: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ className }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  
  // Query for profile photo to automatically update when changed
  const { data: photoData } = useQuery({
    queryKey: ['student-profile-photo'],
    queryFn: studentAPI.getProfilePhotoUrl,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  const links = [
    { to: '/student-dashboard', icon: Home, label: 'Dashboard' },
    { to: '/student-dashboard/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/student-dashboard/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/student-dashboard/assignments', icon: FileText, label: 'Assignments' },
    { to: '/student-dashboard/live-sessions', icon: Video, label: 'Live Sessions' },
    { to: '/student-dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/student-dashboard/help', icon: HelpCircle, label: 'Help & Support' },
  ];
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="fixed z-50 bottom-4 right-4 md:hidden">
        <Button 
          onClick={toggleSidebar} 
          size="icon" 
          className="h-10 w-10 rounded-full bg-eduBlue-500 text-white shadow-lg hover:bg-eduBlue-600"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      
      {/* Sidebar overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)} 
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen w-64 fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        className
      )}>
        {/* Logo and header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/uploads/logo.png" 
              alt="EduKnit Logo" 
              className="h-10 w-auto"
            />
            <span className="font-bold text-xl text-gray-900 dark:text-white">EduKnit</span>
          </Link>
        </div>
        
        {/* User profile */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center space-x-3">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage 
              src={photoData?.data?.profilePhotoUrl || user?.profilePicture} 
              alt={user?.firstName || user?.username || 'User'} 
              className="object-cover object-center h-full w-full rounded-full" 
            />
            <AvatarFallback className="bg-eduBlue-500 text-white">
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 
               user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-gray-900 dark:text-white truncate">
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || 'Guest User'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user?.email || 'Sign in to access all features'}
            </span>
          </div>
        </div>
        
        {/* Navigation links */}
        <nav className="flex-1 space-y-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === link.to || location.pathname.startsWith(link.to + '/')
                  ? 'bg-eduBlue-100 text-eduBlue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        
        {/* Account menu - Bottom left */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1 mt-auto">
          <SidebarLink 
            to="/student/profile"
            icon={User}
            label="My Profile"
            active={location.pathname === "/student/profile"}
          />
          <SidebarLink 
            to="/student-dashboard/settings"
            icon={Settings}
            label="Settings"
            active={location.pathname === "/student-dashboard/settings"}
          />
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 font-normal h-10 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 text-gray-500" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
