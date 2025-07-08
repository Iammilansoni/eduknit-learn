import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { professionalInfoSchema } from '@/lib/validations/student-profile';
import type { ProfessionalInfoFormData } from '@/lib/validations/student-profile';
import { Save, Loader2, Briefcase, X, Plus } from 'lucide-react';

interface ProfessionalInfoFormProps {
  initialData?: Partial<ProfessionalInfoFormData>;
}

const ProfessionalInfoForm: React.FC<ProfessionalInfoFormProps> = ({ initialData }) => {
  const updateProfile = useUpdateStudentProfile();
  const [skillInput, setSkillInput] = React.useState('');
  const [interestInput, setInterestInput] = React.useState('');

  const form = useForm<ProfessionalInfoFormData>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: {
      currentPosition: initialData?.currentPosition || '',
      company: initialData?.company || '',
      industry: initialData?.industry || '',
      experience: initialData?.experience || undefined,
      skills: initialData?.skills || [],
      interests: initialData?.interests || [],
    },
  });

  const onSubmit = async (data: ProfessionalInfoFormData) => {
    try {
      await updateProfile.mutateAsync({
        professionalInfo: data
      });
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = form.getValues('skills') || [];
      form.setValue('skills', [...currentSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    const currentSkills = form.getValues('skills') || [];
    form.setValue('skills', currentSkills.filter((_, i) => i !== index));
  };

  const addInterest = () => {
    if (interestInput.trim()) {
      const currentInterests = form.getValues('interests') || [];
      form.setValue('interests', [...currentInterests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (index: number) => {
    const currentInterests = form.getValues('interests') || [];
    form.setValue('interests', currentInterests.filter((_, i) => i !== index));
  };

  const skills = form.watch('skills') || [];
  const interests = form.watch('interests') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Information</CardTitle>
        <CardDescription>
          Share your work experience and professional background
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Position</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          placeholder="Software Engineer, Student, etc."
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company/Organization</FormLabel>
                    <FormControl>
                      <Input placeholder="Your current workplace" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="Technology, Healthcare, Finance, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5-10">5-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Skills Section */}
            <div className="space-y-4">
              <FormLabel>Skills</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g., JavaScript, React, Python)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {skill}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0 hover:bg-transparent"
                      onClick={() => removeSkill(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <FormDescription>
                Add technical skills, programming languages, tools, etc.
              </FormDescription>
            </div>

            {/* Interests Section */}
            <div className="space-y-4">
              <FormLabel>Interests</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an interest (e.g., Web Development, AI, Design)"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                />
                <Button type="button" onClick={addInterest} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {interest}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0 hover:bg-transparent"
                      onClick={() => removeInterest(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <FormDescription>
                Add areas of interest, learning goals, or career aspirations
              </FormDescription>
            </div>

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

export default ProfessionalInfoForm;
