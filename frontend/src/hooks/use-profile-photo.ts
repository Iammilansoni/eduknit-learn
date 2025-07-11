import { useQuery, useQueryClient } from '@tanstack/react-query';
import { studentApi as studentAPI } from '@/services/studentApi';

export const useProfilePhoto = () => {
  const queryClient = useQueryClient();
  
  const {
    data: photoData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['student-profile-photo'],
    queryFn: studentAPI.getProfilePhotoUrl,
    staleTime: 0, // Always fresh - no cache
    gcTime: 0, // No garbage collection time
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 1,
    refetchInterval: false, // Don't auto-refetch
  });

  const forceRefresh = async () => {
    // First clear the cache completely
    queryClient.removeQueries({ queryKey: ['student-profile-photo'] });
    // Then refetch fresh data
    await refetch();
  };

  const profilePhotoUrl = photoData?.data?.profilePhotoUrl;
  const photoSource = photoData?.data?.source || 'initials';
  const isCustomPhoto = photoData?.data?.hasCustomPhoto || false;

  return {
    profilePhotoUrl,
    photoSource,
    isCustomPhoto,
    isLoading,
    error,
    forceRefresh,
    refetch
  };
};
