import React, { useState, useRef } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { studentAPI } from '@/services/api';
import { Upload, Trash2, Camera, Loader2 } from 'lucide-react';

interface ProfilePhotoHeaderProps {
  currentUser?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

const ProfilePhotoHeader: React.FC<ProfilePhotoHeaderProps> = ({ 
  currentUser, 
  size = 'lg' 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Get current profile photo URL
  const { data: photoData, isLoading: isLoadingPhoto } = useQuery({
    queryKey: ['student-profile-photo'],
    queryFn: studentAPI.getProfilePhotoUrl,
  });

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
      setShowActions(false);
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
      setShowActions(false);
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

  const currentPhotoUrl = previewUrl || photoData?.data?.profilePhotoUrl;
  const hasCustomPhoto = photoData?.data?.hasCustomPhoto && !previewUrl;

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

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Profile Photo Display */}
      <div 
        className="relative group cursor-pointer"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <Avatar className={sizeClasses[size]}>
          <AvatarImage 
            src={currentPhotoUrl} 
            alt={getDisplayName()}
            className="object-cover"
          />
          <AvatarFallback className={textSizeClasses[size]}>
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {(uploadMutation.isPending || isLoadingPhoto) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}

        {/* Hover overlay for actions */}
        {showActions && !uploadMutation.isPending && !isLoadingPhoto && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Camera className="h-6 w-6 text-white" />
          </div>
        )}
      </div>

      {/* Action Buttons - shown on hover or when actions are visible */}
      {showActions && (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleUploadClick}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Upload className="h-3 w-3" />
            )}
          </Button>

          {hasCustomPhoto && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
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
  );
};

export default ProfilePhotoHeader;
