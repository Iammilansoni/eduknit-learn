import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContextUtils';
import { useStudentProfile, useEnrolledPrograms } from '@/hooks/use-student-profile';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User,
  MapPin,
} from 'lucide-react';
import {
  PersonalInfoForm,
  AcademicInfoForm,
  ProfilePhotoHeader,
  ProfilePhotoUpload,
  ProfileInfoForm
} from '@/components/student';

const StudentProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

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

  const profile = profileData?.profile;
  const profileUser = profileData?.user;
  const completeness = profileData?.completeness || 0;
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

        {/* Main Profile Tabs - Reduced to 2 */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="profile" className="text-sm font-medium">
                  <User className="h-4 w-4 mr-2" />
                  Profile Information
                </TabsTrigger>
              </TabsList>
            </CardHeader>


            {/* Profile Tab - Contains personal, academic, and professional info */}
            <TabsContent value="profile" className="p-6">
              <ProfileInfoForm initialData={{
                firstName: profileUser?.firstName,
                lastName: profileUser?.lastName,
                contactInfo: profileData?.data?.profile?.contactInfo,
                address: profileData?.data?.profile?.address,
                academicInfo: profileData?.data?.profile?.academicInfo,
              }} />
            </TabsContent>


            
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfilePage;
