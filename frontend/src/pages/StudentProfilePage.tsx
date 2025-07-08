import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContextUtils';
import { useStudentProfile, useUpdateStudentProfile, useUploadProfilePhoto, useDeleteProfilePhoto, useEnrolledPrograms } from '@/hooks/use-student-profile';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User,
  Edit, 
  X,
  Eye,
  Shield,
  Heart,
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
  Settings,
  BookOpen,
  Clock,
  Calendar,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import {
  PersonalInfoForm,
  AcademicInfoForm,
  ProfessionalInfoForm,
  PrivacySecurityForm,
  ProfileCompletionCard,
  UserProfileCard
} from '@/components/student';

const StudentProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);

  // API hooks
  const { data: profileData, isLoading, error } = useStudentProfile();
  const { data: enrolledProgramsData, isLoading: enrolledProgramsLoading } = useEnrolledPrograms();
  const updateProfileMutation = useUpdateStudentProfile();
  const uploadPhotoMutation = useUploadProfilePhoto();
  const deletePhotoMutation = useDeleteProfilePhoto();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eduBlue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">Failed to load profile</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const profile = profileData?.data?.profile || {};
  const profileUser = profileData?.data?.user || user;
  const completeness = profileData?.data?.completeness || 0;
  const enrolledPrograms = enrolledProgramsData?.data?.enrolledPrograms || [];
  const enrollmentStats: {
    total?: number;
    active?: number;
    completed?: number;
    paused?: number;
    averageProgress?: number;
    totalTimeSpent?: number;
    categories?: string[];
  } = enrolledProgramsData?.data?.statistics || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800';
      case 'DROPPED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* User Profile Card with Integrated Photo Upload */}
          <UserProfileCard
            currentUser={{
              firstName: profileUser?.firstName,
              lastName: profileUser?.lastName,
              username: profileUser?.username,
              email: profileUser?.email,
              role: profileUser?.role,
              enrollmentStatus: profileUser?.enrollmentStatus,
              createdAt: profileUser?.createdAt,
            }}
            profileData={profile as Record<string, unknown>}
            completeness={completeness}
            className="lg:w-1/3"
          />

          {/* Profile Completion Card */}
          <ProfileCompletionCard
            currentUser={{
              firstName: user?.firstName,
              lastName: user?.lastName,
              username: user?.username,
              email: user?.email,
            }}
            profileData={profile}
            completeness={completeness}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Main Profile Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="overview" className="text-xs">
                  <Eye className="h-4 w-4 mr-1" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="personal" className="text-xs">
                  <User className="h-4 w-4 mr-1" />
                  Personal Info
                </TabsTrigger>
                <TabsTrigger value="academic" className="text-xs">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Academic
                </TabsTrigger>
                <TabsTrigger value="professional" className="text-xs">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Professional
                </TabsTrigger>
                <TabsTrigger value="programs" className="text-xs">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Programs
                </TabsTrigger>
                <TabsTrigger value="privacy" className="text-xs">
                  <Shield className="h-4 w-4 mr-1" />
                  Privacy & Security
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="overview" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm">{profileUser?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm">{profile?.contactInfo?.phoneNumber || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Member since:</span>
                        <span className="text-sm">
                          {new Date(profileUser?.createdAt || '').toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Academic Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <GraduationCap className="h-5 w-5 mr-2" />
                        Academic Background
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Education:</span>
                        <span className="text-sm">{profile?.academicInfo?.educationLevel || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Institution:</span>
                        <span className="text-sm">{profile?.academicInfo?.institution || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Field:</span>
                        <span className="text-sm">{profile?.academicInfo?.fieldOfStudy || 'Not specified'}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Professional Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <Briefcase className="h-5 w-5 mr-2" />
                        Professional Background
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Position:</span>
                        <span className="text-sm">{profile?.professionalInfo?.currentPosition || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Company:</span>
                        <span className="text-sm">{profile?.professionalInfo?.company || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Experience:</span>
                        <span className="text-sm">{profile?.professionalInfo?.experience || 'Not specified'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="programs" className="p-6 space-y-6">
                {/* Enrollment Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Programs</p>
                          <p className="text-2xl font-bold">{enrollmentStats.total || 0}</p>
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
                          <p className="text-2xl font-bold text-green-600">{enrollmentStats.active || 0}</p>
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
                          <p className="text-2xl font-bold text-blue-600">{enrollmentStats.completed || 0}</p>
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
                          <p className="text-2xl font-bold text-purple-600">{enrollmentStats.averageProgress || 0}%</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <div className="text-purple-600 font-bold text-sm">%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Enrolled Programs List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">My Enrolled Programs</h3>
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
                      {enrolledPrograms.map((program: {
                        id: string;
                        enrollment: {
                          status: string;
                          enrollmentDate: string;
                          completionDate?: string;
                          certificateIssued: boolean;
                          grade?: string;
                        };
                        programme: {
                          id: string;
                          title: string;
                          description: string;
                          duration: string;
                          level: string;
                          category: string;
                          skills: string[];
                          tags: string[];
                          instructor?: {
                            firstName: string;
                            lastName: string;
                            email: string;
                            profilePicture?: string;
                          };
                          totalModules: number;
                        };
                        progress: {
                          totalProgress: number;
                          completedModules: string[];
                          completedLessons: string[];
                          timeSpent: number;
                          lastActivityDate?: string;
                          streak: number;
                        };
                        achievements: {
                          id: string;
                          title: string;
                          description: string;
                          earnedDate: string;
                          type: string;
                        }[];
                      }) => (
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

                            {/* Modules Progress */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Modules</span>
                                <span>
                                  {program.progress.completedModules.length} / {program.programme.totalModules || 0}
                                </span>
                              </div>
                              <div className="flex space-x-1">
                                {Array.from({ length: program.programme.totalModules || 0 }, (_, i) => (
                                  <div
                                    key={i}
                                    className={`h-2 flex-1 rounded ${
                                      i < program.progress.completedModules.length
                                        ? 'bg-green-500'
                                        : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
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
              </TabsContent>

              <TabsContent value="personal" className="p-6">
                <PersonalInfoForm initialData={{
                  firstName: profileUser?.firstName,
                  lastName: profileUser?.lastName,
                  contactInfo: profileData?.data?.profile?.contactInfo,
                  address: profileData?.data?.profile?.address,
                }} />
              </TabsContent>

              <TabsContent value="academic">
                <AcademicInfoForm initialData={profileData?.data?.profile?.academicInfo} />
              </TabsContent>

              <TabsContent value="professional">
                <ProfessionalInfoForm initialData={profileData?.data?.profile?.professionalInfo} />
              </TabsContent>

              <TabsContent value="privacy" className="p-6">
                <PrivacySecurityForm initialData={{
                  privacy: profileData?.data?.profile?.privacy,
                  learningPreferences: profileData?.data?.profile?.learningPreferences,
                }} />
              </TabsContent>
            </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfilePage;
