import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
import { personalInfoSchema } from '@/lib/validations/student-profile';
import type { PersonalInfoFormData } from '@/lib/validations/student-profile';
import { Save, Loader2, User, Phone, Mail, MapPin, Linkedin, Twitter, Github, Globe } from 'lucide-react';

interface PersonalInfoFormProps {
  initialData?: {
    firstName?: string;
    lastName?: string;
    contactInfo?: {
      phoneNumber?: string;
      alternateEmail?: string;
      socialMedia?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
        portfolio?: string;
      };
    };
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      timezone?: string;
    };
  };
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ initialData }) => {
  const updateProfile = useUpdateStudentProfile();

  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      phoneNumber: initialData?.contactInfo?.phoneNumber || '',
      alternateEmail: initialData?.contactInfo?.alternateEmail || '',
      socialMedia: {
        linkedin: initialData?.contactInfo?.socialMedia?.linkedin || '',
        twitter: initialData?.contactInfo?.socialMedia?.twitter || '',
        github: initialData?.contactInfo?.socialMedia?.github || '',
        portfolio: initialData?.contactInfo?.socialMedia?.portfolio || '',
      },
      address: {
        street: initialData?.address?.street || '',
        city: initialData?.address?.city || '',
        state: initialData?.address?.state || '',
        postalCode: initialData?.address?.postalCode || '',
        country: initialData?.address?.country || '',
        timezone: initialData?.address?.timezone || '',
      },
    },
  });

  const onSubmit = async (data: PersonalInfoFormData) => {
    try {
      await updateProfile.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        contactInfo: {
          phoneNumber: data.phoneNumber,
          alternateEmail: data.alternateEmail,
          socialMedia: data.socialMedia,
        },
        address: data.address,
      });
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  // Common timezones
  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKST)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
    { value: 'Europe/Rome', label: 'Central European Time (CET)' },
    { value: 'Europe/Madrid', label: 'Central European Time (CET)' },
    { value: 'Europe/Amsterdam', label: 'Central European Time (CET)' },
    { value: 'Europe/Brussels', label: 'Central European Time (CET)' },
    { value: 'Europe/Vienna', label: 'Central European Time (CET)' },
    { value: 'Europe/Zurich', label: 'Central European Time (CET)' },
    { value: 'Europe/Stockholm', label: 'Central European Time (CET)' },
    { value: 'Europe/Oslo', label: 'Central European Time (CET)' },
    { value: 'Europe/Copenhagen', label: 'Central European Time (CET)' },
    { value: 'Europe/Helsinki', label: 'Eastern European Time (EET)' },
    { value: 'Europe/Warsaw', label: 'Central European Time (CET)' },
    { value: 'Europe/Prague', label: 'Central European Time (CET)' },
    { value: 'Europe/Budapest', label: 'Central European Time (CET)' },
    { value: 'Europe/Bucharest', label: 'Eastern European Time (EET)' },
    { value: 'Europe/Sofia', label: 'Eastern European Time (EET)' },
    { value: 'Europe/Athens', label: 'Eastern European Time (EET)' },
    { value: 'Europe/Istanbul', label: 'Turkey Time (TRT)' },
    { value: 'Europe/Moscow', label: 'Moscow Time (MSK)' },
    { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
    { value: 'Asia/Karachi', label: 'Pakistan Standard Time (PKT)' },
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
    { value: 'Asia/Dhaka', label: 'Bangladesh Standard Time (BST)' },
    { value: 'Asia/Bangkok', label: 'Indochina Time (ICT)' },
    { value: 'Asia/Singapore', label: 'Singapore Standard Time (SGT)' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong Time (HKT)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Seoul', label: 'Korea Standard Time (KST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST)' },
    { value: 'Australia/Melbourne', label: 'Australian Eastern Time (AEST)' },
    { value: 'Australia/Brisbane', label: 'Australian Eastern Time (AEST)' },
    { value: 'Australia/Perth', label: 'Australian Western Time (AWST)' },
    { value: 'Australia/Adelaide', label: 'Australian Central Time (ACST)' },
    { value: 'Pacific/Auckland', label: 'New Zealand Time (NZST)' },
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands',
    'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland',
    'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Greece', 'Turkey', 'Russia', 'Ukraine',
    'India', 'China', 'Japan', 'South Korea', 'Singapore', 'Hong Kong', 'Thailand', 'Malaysia',
    'Indonesia', 'Philippines', 'Vietnam', 'Australia', 'New Zealand', 'Brazil', 'Argentina',
    'Mexico', 'South Africa', 'Egypt', 'Nigeria', 'Kenya', 'Other'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Manage your basic profile information, contact details, and address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <h3 className="text-lg font-medium">Basic Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Contact Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <h3 className="text-lg font-medium">Contact Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Include country code (e.g., +1-555-123-4567)
                      </FormDescription>
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
                        <Input type="email" placeholder="Enter alternate email" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional backup email address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h4 className="text-md font-medium flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Social Media & Professional Links
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="socialMedia.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialMedia.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://twitter.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialMedia.github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialMedia.portfolio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          Portfolio/Website
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourportfolio.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Address Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <h3 className="text-lg font-medium">Address Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your state/province" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your postal code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timezones.map((timezone) => (
                            <SelectItem key={timezone.value} value={timezone.value}>
                              {timezone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Used for scheduling and time-based features
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

export default PersonalInfoForm;
