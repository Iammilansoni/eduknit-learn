import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi as studentAPI } from '@/services/studentApi';
import { useToast } from '@/hooks/use-toast'; // Still needed for useUpdateStudentProfile

export function useStudentProfile() {
  return useQuery({
    queryKey: ['student-profile'],
    queryFn: () => studentAPI.getProfile(),
  });
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Parameters<typeof studentAPI.updateProfile>[0]) =>
      studentAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });
}

export function useUploadProfilePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => studentAPI.uploadProfilePhoto(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      // Toast message will be shown in the component
    },
    onError: () => {
      // Error toast will be shown in the component
    },
  });
}

export function useDeleteProfilePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => studentAPI.deleteProfilePhoto(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      // Toast message will be shown in the component
    },
    onError: () => {
      // Error toast will be shown in the component
    },
  });
}

export function useStudentEnrollments(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['student-enrollments', params],
    queryFn: async () => {
      const response = await studentAPI.getEnrollments();
      // The backend returns: { success: true, data: { enrollments: [...], pagination: {...} } }
      if (response && response.data && response.data.enrollments) {
        return response.data;
      }
      // Fallback for different response structures
      if (Array.isArray(response)) return { enrollments: response, pagination: {} };
      if (response && response.data && Array.isArray(response.data)) {
        return { enrollments: response.data, pagination: {} };
      }
      return { enrollments: [], pagination: {} };
    },
  });
}

export function useEnrollmentDetails(enrollmentId: string) {
  return useQuery({
    queryKey: ['enrollment-details', enrollmentId],
    queryFn: () => studentAPI.getEnrollmentDetails(enrollmentId),
    enabled: !!enrollmentId,
  });
}

export function useUpdateLearningActivity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Parameters<typeof studentAPI.updateLearningActivity>[0]) =>
      studentAPI.updateLearningActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['student-analytics'] });
      toast({
        title: 'Success',
        description: 'Learning progress updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update learning progress',
        variant: 'destructive',
      });
    },
  });
}

export function useStudentAnalytics() {
  return useQuery({
    queryKey: ['student-analytics'],
    queryFn: () => studentAPI.getAnalytics(),
  });
}

export function useEnrolledPrograms(params?: {
  status?: string;
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['enrolled-programs', params],
    queryFn: () => studentAPI.getEnrolledPrograms(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}


