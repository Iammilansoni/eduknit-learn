import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, User, Mail, MapPin, GraduationCap, Briefcase, Settings, TrendingUp } from 'lucide-react';

interface ProfileCompletionCardProps {
  currentUser?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
  };
  profileData?: {
    contactInfo?: {
      phoneNumber?: string;
      alternateEmail?: string;
      socialMedia?: Record<string, string>;
    };
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
    };
    academicInfo?: {
      educationLevel?: string;
      institution?: string;
      fieldOfStudy?: string;
    };
    professionalInfo?: {
      currentPosition?: string;
      company?: string;
      experience?: string;
    };
    learningPreferences?: {
      preferredLearningStyle?: string;
      goals?: string[];
      interests?: string[];
    };
    privacy?: {
      profileVisibility?: string;
      dataProcessingConsent?: boolean;
    };
  };
  completeness: number;
  onTabChange?: (tab: string) => void;
}

const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({ 
  currentUser, 
  profileData,
  completeness, 
  onTabChange 
}) => {
  // Enhanced profile completion sections with better completion detection
  const sections = [
    {
      key: 'personal',
      label: 'Personal Information',
      icon: User,
      completed: !!(
        currentUser?.firstName && 
        currentUser?.lastName && 
        profileData?.contactInfo?.phoneNumber &&
        profileData?.address?.city
      ),
      onClick: () => onTabChange?.('personal'),
      weight: 25,
      details: [
        { label: 'Name', completed: !!(currentUser?.firstName && currentUser?.lastName) },
        { label: 'Contact', completed: !!profileData?.contactInfo?.phoneNumber },
        { label: 'Address', completed: !!profileData?.address?.city },
      ]
    },
    {
      key: 'academic',
      label: 'Academic Background',
      icon: GraduationCap,
      completed: !!(
        profileData?.academicInfo?.educationLevel && 
        profileData?.academicInfo?.institution
      ),
      onClick: () => onTabChange?.('academic'),
      weight: 25,
      details: [
        { label: 'Education Level', completed: !!profileData?.academicInfo?.educationLevel },
        { label: 'Institution', completed: !!profileData?.academicInfo?.institution },
        { label: 'Field of Study', completed: !!profileData?.academicInfo?.fieldOfStudy },
      ]
    },
    {
      key: 'professional',
      label: 'Professional Info',
      icon: Briefcase,
      completed: !!(
        profileData?.professionalInfo?.currentPosition && 
        profileData?.professionalInfo?.experience
      ),
      onClick: () => onTabChange?.('professional'),
      weight: 25,
      details: [
        { label: 'Current Position', completed: !!profileData?.professionalInfo?.currentPosition },
        { label: 'Company', completed: !!profileData?.professionalInfo?.company },
        { label: 'Experience', completed: !!profileData?.professionalInfo?.experience },
      ]
    },
    {
      key: 'privacy',
      label: 'Privacy & Learning',
      icon: Settings,
      completed: !!(
        profileData?.privacy?.profileVisibility && 
        profileData?.learningPreferences?.preferredLearningStyle
      ),
      onClick: () => onTabChange?.('privacy'),
      weight: 25,
      details: [
        { label: 'Privacy Settings', completed: !!profileData?.privacy?.profileVisibility },
        { label: 'Learning Style', completed: !!profileData?.learningPreferences?.preferredLearningStyle },
        { label: 'Goals & Interests', completed: !!(profileData?.learningPreferences?.goals?.length || profileData?.learningPreferences?.interests?.length) },
      ]
    }
  ];

  const completedSections = sections.filter(s => s.completed).length;
  const totalSections = sections.length;

  // Calculate more accurate completion percentage
  const detailedCompleteness = sections.reduce((acc, section) => {
    const completedDetails = section.details.filter(d => d.completed).length;
    const sectionCompleteness = (completedDetails / section.details.length) * section.weight;
    return acc + sectionCompleteness;
  }, 0);

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCompletionBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'outline';
  };

  return (
    <Card className="lg:w-2/3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Profile Completion
        </CardTitle>
        <CardDescription>
          Complete your profile to unlock all features and improve your learning experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Progress</span>
            <Badge variant={getCompletionBadgeVariant(completeness)} className={getCompletionColor(completeness)}>
              {Math.round(completeness)}% Complete
            </Badge>
          </div>
          <Progress value={completeness} className="h-3" />
          <div className="flex justify-between text-xs text-gray-600">
            <span>{completedSections} of {totalSections} sections completed</span>
            <span>{Math.round(detailedCompleteness)}% detailed completion</span>
          </div>
        </div>

        {/* Profile Sections with Details */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Profile Sections</h4>
          <div className="space-y-3">
            {sections.map((section) => {
              const SectionIcon = section.icon;
              const completedDetails = section.details.filter(d => d.completed).length;
              const sectionProgress = (completedDetails / section.details.length) * 100;
              
              return (
                <div key={section.key} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <button
                    onClick={section.onClick}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <div className="flex items-center gap-3">
                      <SectionIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={section.completed ? "default" : "outline"} className="text-xs">
                        {Math.round(sectionProgress)}%
                      </Badge>
                      {section.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {/* Section Details */}
                  <div className="space-y-2">
                    <Progress value={sectionProgress} className="h-1" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {section.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {detail.completed ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <Circle className="h-3 w-3 text-gray-400" />
                          )}
                          <span className={detail.completed ? 'text-green-600' : 'text-gray-500'}>
                            {detail.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Quick Actions</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Find the first incomplete section and navigate to it
                const incompleteSection = sections.find(s => !s.completed);
                if (incompleteSection) {
                  incompleteSection.onClick();
                }
              }}
            >
              Continue Setup
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionCard;
