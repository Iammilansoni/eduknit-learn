import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { contactInfoSchema } from '@/lib/validations/student-profile';
import type { ContactInfoFormData } from '@/lib/validations/student-profile';
import { Save, Loader2, Phone, Mail } from 'lucide-react';

interface ContactInfoFormProps {
  initialData?: Partial<ContactInfoFormData>;
}

const ContactInfoForm: React.FC<ContactInfoFormProps> = ({ initialData }) => {
  const updateProfile = useUpdateStudentProfile();

  const form = useForm<ContactInfoFormData>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      phoneNumber: initialData?.phoneNumber || '',
      alternateEmail: initialData?.alternateEmail || '',

    },
  });

  const onSubmit = async (data: ContactInfoFormData) => {
    try {
      await updateProfile.mutateAsync({
        contactInfo: data
      });
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>
          Manage your contact details and social media links
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          placeholder="+1 (555) 123-4567" 
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
                name="alternateEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternate Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          type="email"
                          placeholder="alternate@example.com"
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Additional email address for contact
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

export default ContactInfoForm;
