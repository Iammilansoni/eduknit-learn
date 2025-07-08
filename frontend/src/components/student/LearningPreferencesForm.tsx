import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
import { learningPreferencesSchema } from '@/lib/validations/student-profile';
import type { LearningPreferencesFormData } from '@/lib/validations/student-profile';
import { Save, Loader2, BookOpen, Clock, Target } from 'lucide-react';

interface LearningPreferencesFormProps {
  initialData?: Partial<LearningPreferencesFormData>;
}

const LearningPreferencesForm: React.FC<LearningPreferencesFormProps> = ({ initialData }) => {
  const updateProfile = useUpdateStudentProfile();

  const form = useForm<LearningPreferencesFormData>({
    resolver: zodResolver(learningPreferencesSchema),
    defaultValues: {
      preferredLearningStyle: initialData?.preferredLearningStyle || undefined,
      learningStyle: initialData?.learningStyle || undefined,
      preferredLanguages: initialData?.preferredLanguages || [],
      studyTimePreference: initialData?.studyTimePreference || undefined,
      difficultyLevel: initialData?.difficultyLevel || undefined,
      goals: initialData?.goals || [],
      interests: initialData?.interests || [],
      availabilityHours: initialData?.availabilityHours || undefined,
      preferredTimeSlots: initialData?.preferredTimeSlots || [],
      notificationPreferences: initialData?.notificationPreferences || {
        email: true,
        sms: false,
        push: true,
        frequency: 'DAILY',
      },
    },
  });

  const onSubmit = async (data: LearningPreferencesFormData) => {
    try {
      await updateProfile.mutateAsync({
        learningPreferences: data
      });
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const learningGoals = [
    'Career Advancement',
    'Skill Development',
    'Academic Achievement',
    'Personal Interest',
    'Certification',
    'Job Transition',
    'Entrepreneurship',
    'Professional Development'
  ];

  const subjectInterests = [
    'Programming',
    'Web Development',
    'Data Science',
    'Artificial Intelligence',
    'Machine Learning',
    'Cybersecurity',
    'Cloud Computing',
    'Mobile Development',
    'Design',
    'Business',
    'Marketing',
    'Finance',
    'Project Management'
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
    'Hindi'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Preferences</CardTitle>
        <CardDescription>
          Customize your learning experience and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="learningStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learning Style</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your learning style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="VISUAL">Visual</SelectItem>
                        <SelectItem value="AUDITORY">Auditory</SelectItem>
                        <SelectItem value="KINESTHETIC">Kinesthetic</SelectItem>
                        <SelectItem value="READING_WRITING">Reading/Writing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studyTimePreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Study Time Preference</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="When do you prefer to study?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MORNING">Morning</SelectItem>
                        <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                        <SelectItem value="EVENING">Evening</SelectItem>
                        <SelectItem value="NIGHT">Night</SelectItem>
                        <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="difficultyLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Difficulty Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your preferred difficulty level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                      <SelectItem value="EXPERT">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preferred Languages */}
            <FormField
              control={form.control}
              name="preferredLanguages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Languages</FormLabel>
                  <FormDescription className="mb-3">
                    Select the languages you prefer for course content
                  </FormDescription>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {languages.map((language) => (
                      <div key={language} className="flex items-center space-x-2">
                        <Checkbox
                          id={`language-${language}`}
                          checked={field.value?.includes(language) || false}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            if (checked) {
                              field.onChange([...current, language]);
                            } else {
                              field.onChange(current.filter((l) => l !== language));
                            }
                          }}
                        />
                        <Label htmlFor={`language-${language}`} className="text-sm">
                          {language}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Learning Goals */}
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Learning Goals</FormLabel>
                  <FormDescription className="mb-3">
                    What are your main learning objectives?
                  </FormDescription>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {learningGoals.map((goal) => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox
                          id={`goal-${goal}`}
                          checked={field.value?.includes(goal) || false}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            if (checked) {
                              field.onChange([...current, goal]);
                            } else {
                              field.onChange(current.filter((g) => g !== goal));
                            }
                          }}
                        />
                        <Label htmlFor={`goal-${goal}`} className="text-sm">
                          {goal}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject Interests */}
            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Interests</FormLabel>
                  <FormDescription className="mb-3">
                    What subjects are you most interested in learning?
                  </FormDescription>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {subjectInterests.map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <Checkbox
                          id={`interest-${interest}`}
                          checked={field.value?.includes(interest) || false}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            if (checked) {
                              field.onChange([...current, interest]);
                            } else {
                              field.onChange(current.filter((i) => i !== interest));
                            }
                          }}
                        />
                        <Label htmlFor={`interest-${interest}`} className="text-sm">
                          {interest}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={updateProfile.isPending}
                className="w-full md:w-auto"
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LearningPreferencesForm;
