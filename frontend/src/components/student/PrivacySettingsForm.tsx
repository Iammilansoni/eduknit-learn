import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useUpdateStudentProfile } from '@/hooks/use-student-profile';
import { privacySchema } from '@/lib/validations/student-profile';
import type { PrivacyFormData } from '@/lib/validations/student-profile';
import { Save, Loader2, Shield, Eye, EyeOff, Download, Trash2, AlertTriangle } from 'lucide-react';

interface PrivacySettingsFormProps {
  initialData?: Partial<PrivacyFormData>;
}

const PrivacySettingsForm: React.FC<PrivacySettingsFormProps> = ({ initialData }) => {
  const updateProfile = useUpdateStudentProfile();

  const form = useForm<PrivacyFormData>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      profileVisibility: initialData?.profileVisibility || 'PUBLIC',
      allowMessaging: initialData?.allowMessaging ?? true,
      allowConnectionRequests: initialData?.allowConnectionRequests ?? true,
      showProgress: initialData?.showProgress ?? true,
      showAchievements: initialData?.showAchievements ?? true,
      dataProcessingConsent: initialData?.dataProcessingConsent ?? false,
      marketingEmails: initialData?.marketingEmails ?? false,
      marketingConsent: initialData?.marketingConsent ?? false,
    },
  });

  const onSubmit = async (data: PrivacyFormData) => {
    try {
      await updateProfile.mutateAsync({
        privacy: data
      });
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleDataExport = () => {
    // In a real implementation, this would trigger a data export request
    console.log('Data export requested');
  };

  const handleAccountDeletion = () => {
    // In a real implementation, this would trigger account deletion process
    console.log('Account deletion requested');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy & Security Settings
        </CardTitle>
        <CardDescription>
          Manage your privacy preferences and data settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Visibility Section */}
            <div className="space-y-4">
              <h4 className="text-md font-medium">Profile Visibility</h4>
              
              <FormField
                control={form.control}
                name="profileVisibility"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Public Profile
                      </FormLabel>
                      <FormDescription>
                        Allow other users to view your profile information
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === 'PUBLIC'}
                        onCheckedChange={(checked) => field.onChange(checked ? 'PUBLIC' : 'PRIVATE')}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showProgress"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Show Learning Progress
                      </FormLabel>
                      <FormDescription>
                        Display your course progress and completion status
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showAchievements"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Show Achievements
                      </FormLabel>
                      <FormDescription>
                        Display your badges, certificates, and achievements
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Communication Preferences */}
            <div className="space-y-4">
              <h4 className="text-md font-medium">Communication Preferences</h4>
              
              <FormField
                control={form.control}
                name="allowMessaging"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Allow Direct Messages
                      </FormLabel>
                      <FormDescription>
                        Allow other users to send you direct messages
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketingEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Marketing Emails
                      </FormLabel>
                      <FormDescription>
                        Receive promotional emails and course recommendations
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Data Processing */}
            <div className="space-y-4">
              <h4 className="text-md font-medium">Data Processing</h4>
              
              <FormField
                control={form.control}
                name="dataProcessingConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Data Processing Consent
                      </FormLabel>
                      <FormDescription>
                        Allow us to process your data to improve our services
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Data Management */}
            <div className="space-y-4">
              <h4 className="text-md font-medium">Data Management</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your personal data and account settings
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDataExport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export My Data
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Delete Account
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleAccountDeletion}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
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

export default PrivacySettingsForm;
