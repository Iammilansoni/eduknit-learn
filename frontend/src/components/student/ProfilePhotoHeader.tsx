import React, { useState, useRef } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { studentApi as studentAPI } from '@/services/studentApi';
import { Upload, Trash2, Camera, Loader2, Plus, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfilePhotoHeaderProps {
  currentUser?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProfilePhotoHeader: React.FC<ProfilePhotoHeaderProps> = ({ 
  currentUser, 
  size = 'lg',
  className = ''
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Get current profile photo URL
  const { data: photoData, isLoading: isLoadingPhoto } = useQuery({
    queryKey: ['student-profile-photo'],
    queryFn: studentAPI.getProfilePhotoUrl,
  });

  // Debug logging (temporary)
  React.useEffect(() => {
    if (photoData) {
      console.log('ProfilePhotoHeader - Photo URL:', photoData.profilePhotoUrl);
      console.log('ProfilePhotoHeader - Has Custom Photo:', photoData.hasCustomPhoto);
      console.log('ProfilePhotoHeader - Source:', photoData.source);
    }
  }, [photoData]);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      return studentAPI.uploadProfilePhoto(file);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Profile photo uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile-photo'] });
      setPreviewUrl(null);
      setIsHovered(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to upload profile photo",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: studentAPI.deleteProfilePhoto,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Profile photo deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile-photo'] });
      setPreviewUrl(null);
      setIsHovered(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to delete profile photo",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please select a JPEG, PNG, or WebP image",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadMutation.mutate(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const getDisplayName = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    return currentUser?.username || currentUser?.email || 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const currentPhotoUrl = previewUrl || photoData?.profilePhotoUrl;
  const hasCustomPhoto = photoData?.hasCustomPhoto && !previewUrl;

  // Size configurations
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const buttonSizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10', 
    lg: 'h-12 w-12'
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const overlayIconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <TooltipProvider>
      <div className={`flex flex-col items-center space-y-3 ${className}`}>
        {/* Profile Photo Display with Hover Actions */}
        <div 
          className="relative group cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Avatar className={`${sizeClasses[size]} transition-all duration-200 ${isHovered ? 'ring-4 ring-blue-200 ring-opacity-50' : ''}`}>
            <AvatarImage 
              src={currentPhotoUrl} 
              alt={getDisplayName()}
              className="object-cover"
            />
            <AvatarFallback className={textSizeClasses[size]}>
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          {/* Loading indicator */}
          {(uploadMutation.isPending || deleteMutation.isPending || isLoadingPhoto) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
              <Loader2 className={`${overlayIconSize[size]} text-white animate-spin`} />
            </div>
          )}

          {/* Hover overlay with camera icon */}
          {isHovered && !uploadMutation.isPending && !deleteMutation.isPending && !isLoadingPhoto && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full transition-all duration-200">
              <Camera className={`${overlayIconSize[size]} text-white`} />
            </div>
          )}

          {/* Action buttons - positioned outside the avatar */}
          {isHovered && !uploadMutation.isPending && !deleteMutation.isPending && !isLoadingPhoto && (
            <>
              {/* Upload button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className={`absolute -top-2 -right-2 ${buttonSizeClasses[size]} rounded-full bg-blue-600 hover:bg-blue-700 border-2 border-white shadow-lg transition-all duration-200 transform hover:scale-110`}
                    onClick={handleUploadClick}
                  >
                    <Plus className={iconSizeClasses[size]} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{hasCustomPhoto ? 'Change photo' : 'Upload photo'}</p>
                </TooltipContent>
              </Tooltip>

              {/* Delete button - only show if there's a custom photo */}
              {hasCustomPhoto && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className={`absolute -bottom-2 -right-2 ${buttonSizeClasses[size]} rounded-full bg-red-600 hover:bg-red-700 border-2 border-white shadow-lg transition-all duration-200 transform hover:scale-110`}
                      onClick={handleDelete}
                    >
                      <X className={iconSizeClasses[size]} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove photo</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}
        </div>

        {/* Optional: Show upload hint text on hover for users without photos */}
        {isHovered && !hasCustomPhoto && !uploadMutation.isPending && !deleteMutation.isPending && (
          <p className="text-xs text-gray-500 animate-fade-in">
            Click to upload a photo
          </p>
        )}

        {/* Hidden File Input */}
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </TooltipProvider>
  );
};

export default ProfilePhotoHeader;
