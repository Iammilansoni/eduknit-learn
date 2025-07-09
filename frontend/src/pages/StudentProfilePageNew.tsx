import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContextUtils';
import { useStudentProfile, useEnrolledPrograms } from '@/hooks/use-student-profile';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User,
  Eye,
  Shield,
  Mail,
  MapPin,
  GraduationCap,
  Settings,
  BookOpen,
  Clock,
  Calendar,
  Trophy,
  TrendingUp,
  Camera,
} from 'lucide-react';
import {
  PersonalInfoForm,
  AcademicInfoForm,
  PrivacySecuritySettings,
  ProfilePhotoHeader,
  ProfilePhotoUpload
} from '@/components/student';

const StudentProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // API hooks
  const { data: profileData, isLoading, error } = useStudentProfile();
  const { data: enrolledProgramsData, isLoading: enrolledProgramsLoading } = useEnrolledPrograms();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900">Error loading profile</h2>
            <p className="mt-2 text-gray-600">Please try refreshing the page</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const profile = profileData?.data?.profile;
  const profileUser = profileData?.data?.user;
  const completeness = profileData?.data?.completeness || 0;
  const enrolledPrograms = enrolledProgramsData?.data?.enrolledPrograms || [];

  // Calculate enrollment statistics
  const enrollmentStats = {
    total: enrolledPrograms.length,
    active: enrolledPrograms.filter((p) => p.enrollment.status === 'active').length,
    completed: enrolledPrograms.filter((p) => p.enrollment.status === 'completed').length,
    averageProgress: enrolledPrograms.length > 0 
      ? Math.round(enrolledPrograms.reduce((acc: number, p) => acc + (p.progress?.totalProgress || 0), 0) / enrolledPrograms.length)
      : 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-7xl p-6 space-y-6">
        
        {/* Header Section */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                {/* Profile Photo Section */}
                <div className="flex-shrink-0">
                  <ProfilePhotoHeader currentUser={user} size="lg" />
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <CardTitle className="text-2xl">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.username || 'Student'}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {user?.email}
                  </CardDescription>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <Badge variant="secondary">Profile {completeness}% Complete</Badge>
                    {profile?.address?.city && profile?.address?.country && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {profile.address.city}, {profile.address.country}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Profile Tabs - Reduced from 6 to 3 */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="text-sm font-medium">
                  <Eye className="h-4 w-4 mr-2" />
                  Overview & Programs
                </TabsTrigger>
                <TabsTrigger value="profile" className="text-sm font-medium">
                  <User className="h-4 w-4 mr-2" />
                  Profile Information
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-sm font-medium">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings & Privacy
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            {/* Overview Tab - Contains basic info and programs */}
            <TabsContent value="overview" className="p-6">
              <div className="space-y-8">
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Programs</p>
                          <p className="text-2xl font-bold">{enrollmentStats.total}</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Active</p>
                          <p className="text-2xl font-bold text-green-600">{enrollmentStats.active}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Completed</p>
                          <p className="text-2xl font-bold text-blue-600">{enrollmentStats.completed}</p>
                        </div>
                        <Trophy className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Avg. Progress</p>
                          <p className="text-2xl font-bold text-purple-600">{enrollmentStats.averageProgress}%</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <div className="text-purple-600 font-bold text-sm">%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Enrolled Programs */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center">
                      <BookOpen className="h-6 w-6 mr-2" />
                      My Enrolled Programs
                    </h2>
                    {enrolledProgramsLoading && (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-600">Loading...</span>
                      </div>
                    )}
                  </div>
                  
                  {enrolledPrograms.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Programs Enrolled</h3>
                        <p className="text-gray-600 mb-4">You haven't enrolled in any programs yet.</p>
                        <Button>Browse Programs</Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {enrolledPrograms.map((program) => (
                        <Card key={program.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg">{program.programme.title}</CardTitle>
                                <CardDescription className="line-clamp-2 mt-1">
                                  {program.programme.description}
                                </CardDescription>
                              </div>
                              <Badge className={getStatusColor(program.enrollment.status)}>
                                {program.enrollment.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span className="font-medium">{program.progress.totalProgress}%</span>
                              </div>
                              <Progress value={program.progress.totalProgress} className="h-2" />
                            </div>

                            {/* Program Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <div>
                                  <p className="text-gray-600">Enrolled</p>
                                  <p className="font-medium">{formatDate(program.enrollment.enrollmentDate)}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <div>
                                  <p className="text-gray-600">Time Spent</p>
                                  <p className="font-medium">{formatDuration(program.progress.timeSpent)}</p>
                                </div>
                              </div>
                            </div>

                            {/* Program Category and Level */}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="text-xs">
                                  {program.programme.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {program.programme.level}
                                </Badge>
                              </div>
                              <Button variant="outline" size="sm">
                                Continue Learning
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Profile Tab - Contains personal, academic, and professional info */}
            <TabsContent value="profile" className="p-6">
              <div className="space-y-8">
                {/* Personal Information Section */}
                <div>
                  <div className="flex items-center mb-6">
                    <User className="h-6 w-6 mr-2" />
                    <h3 className="text-xl font-semibold">Personal Information</h3>
                  </div>
                  <PersonalInfoForm initialData={{
                    firstName: profileUser?.firstName,
                    lastName: profileUser?.lastName,
                    contactInfo: profileData?.data?.profile?.contactInfo,
                    address: profileData?.data?.profile?.address,
                  }} />
                </div>

                {/* Academic Information Section */}
                <div className="border-t pt-8">
                  <div className="flex items-center mb-6">
                    <GraduationCap className="h-6 w-6 mr-2" />
                    <h3 className="text-xl font-semibold">Academic Information</h3>
                  </div>
                  <AcademicInfoForm initialData={profileData?.data?.profile?.academicInfo} />
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab - Contains privacy and security settings only */}
            <TabsContent value="settings" className="p-6">
              <div className="space-y-8">
                {/* Privacy & Security Settings Section */}
                <div>
                  <div className="flex items-center mb-6">
                    <Shield className="h-6 w-6 mr-2" />
                    <h3 className="text-xl font-semibold">Privacy & Security</h3>
                  </div>
                  <PrivacySecuritySettings />
                </div>
              </div>
            </TabsContent>
            
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfilePage;
