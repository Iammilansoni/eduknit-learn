import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
import { z } from 'zod';
import { Save, Loader2, User, Phone, Mail, MapPin, GraduationCap, Globe } from 'lucide-react';

const profileInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  phoneNumber: z.string().optional().refine(
    (val) => !val || val === '' || val.length >= 10,
    { message: 'Phone number must be at least 10 digits' }
  ),
  alternateEmail: z.string().optional().refine(
    (val) => !val || val === '' || z.string().email().safeParse(val).success,
    { message: 'Invalid email format' }
  ),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
  educationLevel: z.enum(['HIGH_SCHOOL', 'UNDERGRADUATE', 'GRADUATE', 'POSTGRADUATE', 'OTHER']).optional(),
  institution: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  graduationYear: z.number().min(1900).max(new Date().getFullYear() + 10).optional(),
  currentlyStudying: z.boolean().optional(),
});

export type ProfileInfoFormData = z.infer<typeof profileInfoSchema>;

interface ProfileInfoFormProps {
  initialData?: {
    firstName?: string;
    lastName?: string;
    contactInfo?: {
      phoneNumber?: string;
      alternateEmail?: string;
    };
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      timezone?: string;
    };
    academicInfo?: {
      educationLevel?: 'HIGH_SCHOOL' | 'UNDERGRADUATE' | 'GRADUATE' | 'POSTGRADUATE' | 'OTHER';
      institution?: string;
      fieldOfStudy?: string;
      graduationYear?: number;
      currentlyStudying?: boolean;
    };
  };
}

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({ initialData }) => {
  const updateProfile = useUpdateStudentProfile();

  const form = useForm<ProfileInfoFormData>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      phoneNumber: initialData?.contactInfo?.phoneNumber || '',
      alternateEmail: initialData?.contactInfo?.alternateEmail || '',
      address: {
        street: initialData?.address?.street || '',
        city: initialData?.address?.city || '',
        state: initialData?.address?.state || '',
        postalCode: initialData?.address?.postalCode || '',
        country: initialData?.address?.country || '',
        timezone: initialData?.address?.timezone || '',
      },
      educationLevel: initialData?.academicInfo?.educationLevel || undefined,
      institution: initialData?.academicInfo?.institution || '',
      fieldOfStudy: initialData?.academicInfo?.fieldOfStudy || '',
      graduationYear: initialData?.academicInfo?.graduationYear || undefined,
      currentlyStudying: initialData?.academicInfo?.currentlyStudying || false,
    },
  });

  const onSubmit = async (data: ProfileInfoFormData) => {
    try {
      // Prepare the data structure that matches backend expectations
      const submitData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
      };

      // Only include contactInfo if there's actual data
      if ((data.phoneNumber && data.phoneNumber.trim() !== '') || (data.alternateEmail && data.alternateEmail.trim() !== '')) {
        submitData.contactInfo = {};
        if (data.phoneNumber && data.phoneNumber.trim() !== '') {
          submitData.contactInfo.phoneNumber = data.phoneNumber;
        }
        if (data.alternateEmail && data.alternateEmail.trim() !== '') {
          submitData.contactInfo.alternateEmail = data.alternateEmail;
        }
      }

      // Only include address if there's actual data
      if (data.address && Object.values(data.address).some(value => value && value.trim() !== '')) {
        submitData.address = data.address;
      }

      // Only include academicInfo if there's actual data
      if (data.educationLevel || data.institution || data.fieldOfStudy || data.graduationYear !== undefined || data.currentlyStudying !== undefined) {
        submitData.academicInfo = {};
        if (data.educationLevel) submitData.academicInfo.educationLevel = data.educationLevel;
        if (data.institution) submitData.academicInfo.institution = data.institution;
        if (data.fieldOfStudy) submitData.academicInfo.fieldOfStudy = data.fieldOfStudy;
        if (data.graduationYear !== undefined) submitData.academicInfo.graduationYear = data.graduationYear;
        if (data.currentlyStudying !== undefined) submitData.academicInfo.currentlyStudying = data.currentlyStudying;
      }

      await updateProfile.mutateAsync(submitData);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i + 10);

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
          Profile Information
        </CardTitle>
        <CardDescription>
          Manage your basic, contact, address, and academic information
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
                      <FormLabel>Phone Number <span className="text-xs text-gray-500">(Optional)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number (optional)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Include country code (e.g., +1-555-123-4567). Optional but helpful for support.
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
                      <FormLabel>Alternate Email <span className="text-xs text-gray-500">(Optional)</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter alternate email (optional)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional backup email address for account recovery
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

            <Separator />

            {/* Academic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center mb-6">
                <GraduationCap className="h-6 w-6 mr-2" />
                <h3 className="text-xl font-semibold">Academic Information</h3>
              </div>
              <FormField
                control={form.control}
                name="educationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your education level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                        <SelectItem value="UNDERGRADUATE">Undergraduate</SelectItem>
                        <SelectItem value="GRADUATE">Graduate</SelectItem>
                        <SelectItem value="POSTGRADUATE">Postgraduate</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="University/School name"
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
                  name="fieldOfStudy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field of Study</FormLabel>
                      <FormControl>
                        <Input placeholder="Computer Science, Business, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="graduationYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Graduation Year</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
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
                  name="currentlyStudying"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Currently Studying
                        </FormLabel>
                        <FormDescription>
                          Check if you are currently enrolled in this program
                        </FormDescription>
                      </div>
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

export default ProfileInfoForm; 