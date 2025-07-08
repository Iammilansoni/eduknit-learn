import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useUpdateStudentProfile } from '@/hooks/use-student-profile';
import { privacySchema, learningPreferencesSchema } from '@/lib/validations/student-profile';
import type { PrivacyFormData, LearningPreferencesFormData } from '@/lib/validations/student-profile';
import { Save, Loader2, Shield, Settings, Eye, EyeOff, Clock, Target, Bell, Users, Heart } from 'lucide-react';
import { z } from 'zod';

// Combined schema for privacy and learning preferences
const privacySecuritySchema = z.object({
  privacy: privacySchema,
  learningPreferences: learningPreferencesSchema,
});

type PrivacySecurityFormData = z.infer<typeof privacySecuritySchema>;

interface PrivacySecurityFormProps {
  initialData?: {
    privacy?: PrivacyFormData;
    learningPreferences?: LearningPreferencesFormData;
  };
}

const PrivacySecurityForm: React.FC<PrivacySecurityFormProps> = ({ initialData }) => {
  const updateProfile = useUpdateStudentProfile();

  const form = useForm<PrivacySecurityFormData>({
    resolver: zodResolver(privacySecuritySchema),
    defaultValues: {
      privacy: {
        profileVisibility: initialData?.privacy?.profileVisibility || 'PUBLIC',
        allowMessaging: initialData?.privacy?.allowMessaging ?? true,
        allowConnectionRequests: initialData?.privacy?.allowConnectionRequests ?? true,
        dataProcessingConsent: initialData?.privacy?.dataProcessingConsent ?? false,
        marketingConsent: initialData?.privacy?.marketingConsent ?? false,
        showProgress: initialData?.privacy?.showProgress ?? true,
        showAchievements: initialData?.privacy?.showAchievements ?? true,
        marketingEmails: initialData?.privacy?.marketingEmails ?? false,
      },
      learningPreferences: {
        preferredLearningStyle: initialData?.learningPreferences?.preferredLearningStyle || 'VISUAL',
        learningStyle: initialData?.learningPreferences?.learningStyle || 'VISUAL',
        goals: initialData?.learningPreferences?.goals || [],
        availabilityHours: initialData?.learningPreferences?.availabilityHours || 2,
        preferredTimeSlots: initialData?.learningPreferences?.preferredTimeSlots || [],
        studyTimePreference: initialData?.learningPreferences?.studyTimePreference || 'EVENING',
        difficultyLevel: initialData?.learningPreferences?.difficultyLevel || 'INTERMEDIATE',
        preferredLanguages: initialData?.learningPreferences?.preferredLanguages || ['English'],
        interests: initialData?.learningPreferences?.interests || [],
        notificationPreferences: {
          email: initialData?.learningPreferences?.notificationPreferences?.email ?? true,
          sms: initialData?.learningPreferences?.notificationPreferences?.sms ?? false,
          push: initialData?.learningPreferences?.notificationPreferences?.push ?? true,
          frequency: initialData?.learningPreferences?.notificationPreferences?.frequency || 'DAILY',
        },
      },
    },
  });

  const onSubmit = async (data: PrivacySecurityFormData) => {
    try {
      await updateProfile.mutateAsync({
        privacy: data.privacy,
        learningPreferences: data.learningPreferences,
      });
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const addGoal = () => {
    const currentGoals = form.getValues('learningPreferences.goals') || [];
    const newGoal = prompt('Enter your learning goal:');
    if (newGoal && newGoal.trim()) {
      form.setValue('learningPreferences.goals', [...currentGoals, newGoal.trim()]);
    }
  };

  const removeGoal = (index: number) => {
    const currentGoals = form.getValues('learningPreferences.goals') || [];
    const updatedGoals = currentGoals.filter((_, i) => i !== index);
    form.setValue('learningPreferences.goals', updatedGoals);
  };

  const addInterest = () => {
    const currentInterests = form.getValues('learningPreferences.interests') || [];
    const newInterest = prompt('Enter your interest:');
    if (newInterest && newInterest.trim()) {
      form.setValue('learningPreferences.interests', [...currentInterests, newInterest.trim()]);
    }
  };

  const removeInterest = (index: number) => {
    const currentInterests = form.getValues('learningPreferences.interests') || [];
    const updatedInterests = currentInterests.filter((_, i) => i !== index);
    form.setValue('learningPreferences.interests', updatedInterests);
  };

  const timeSlots = [
    '6:00 AM - 8:00 AM',
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM',
    '8:00 PM - 10:00 PM',
    '10:00 PM - 12:00 AM',
  ];

  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Russian',
    'Chinese',
    'Japanese',
    'Korean',
    'Arabic',
    'Hindi',
    'Other',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Privacy & Security Settings
        </CardTitle>
        <CardDescription>
          Manage your privacy preferences, data visibility, and learning experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Privacy Settings Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <h3 className="text-lg font-medium">Privacy Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="privacy.profileVisibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Visibility</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select profile visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PUBLIC">Public</SelectItem>
                          <SelectItem value="CONNECTIONS_ONLY">Connections Only</SelectItem>
                          <SelectItem value="PRIVATE">Private</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Who can see your profile information
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="privacy.allowMessaging"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Allow Messaging</FormLabel>
                          <FormDescription>
                            Let other users send you messages
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="privacy.allowConnectionRequests"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Allow Connection Requests</FormLabel>
                          <FormDescription>
                            Let other users send you connection requests
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="privacy.showProgress"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Show Learning Progress</FormLabel>
                          <FormDescription>
                            Display your learning progress on your profile
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="privacy.showAchievements"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Show Achievements</FormLabel>
                          <FormDescription>
                            Display your achievements and certificates
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Data Processing Consents */}
              <div className="space-y-4">
                <h4 className="text-md font-medium">Data Processing & Marketing</h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="privacy.dataProcessingConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Data Processing Consent</FormLabel>
                          <FormDescription>
                            Allow us to process your data for personalized learning recommendations
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="privacy.marketingConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Marketing Communications</FormLabel>
                          <FormDescription>
                            Receive marketing emails about new courses and features
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="privacy.marketingEmails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Marketing Emails</FormLabel>
                          <FormDescription>
                            Receive promotional emails and course recommendations
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Learning Preferences Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <h3 className="text-lg font-medium">Learning Preferences</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="learningPreferences.preferredLearningStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Learning Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select learning style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="VISUAL">Visual</SelectItem>
                          <SelectItem value="AUDITORY">Auditory</SelectItem>
                          <SelectItem value="KINESTHETIC">Kinesthetic</SelectItem>
                          <SelectItem value="READING_WRITING">Reading & Writing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="learningPreferences.difficultyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BEGINNER">Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                          <SelectItem value="ADVANCED">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="learningPreferences.studyTimePreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Study Time Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MORNING">Morning</SelectItem>
                          <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                          <SelectItem value="EVENING">Evening</SelectItem>
                          <SelectItem value="NIGHT">Night</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="learningPreferences.availabilityHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Hours per Day</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="24"
                          placeholder="2"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        How many hours can you dedicate to learning daily?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Learning Goals */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Learning Goals
                  </h4>
                  <Button type="button" variant="outline" size="sm" onClick={addGoal}>
                    Add Goal
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(form.watch('learningPreferences.goals') || []).map((goal, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeGoal(index)}>
                      {goal} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Interests
                  </h4>
                  <Button type="button" variant="outline" size="sm" onClick={addInterest}>
                    Add Interest
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(form.watch('learningPreferences.interests') || []).map((interest, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeInterest(index)}>
                      {interest} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-4">
                <h4 className="text-md font-medium flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Preferences
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="learningPreferences.notificationPreferences.email"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <FormDescription>
                              Receive notifications via email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="learningPreferences.notificationPreferences.push"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Push Notifications</FormLabel>
                            <FormDescription>
                              Receive push notifications in your browser
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="learningPreferences.notificationPreferences.frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notification Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                            <SelectItem value="DAILY">Daily</SelectItem>
                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                            <SelectItem value="NEVER">Never</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="submit"
                disabled={updateProfile.isPending}
                className="flex items-center space-x-2"
              >
                {updateProfile.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{updateProfile.isPending ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PrivacySecurityForm;
