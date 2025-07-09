import React, { useState, useRef } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { studentAPI } from '@/services/api';
import { Camera, Loader2, Plus, X, Upload } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HoverProfilePhotoProps {
  currentUser?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTooltips?: boolean;
  clickToUpload?: boolean; // If true, clicking anywhere on the avatar triggers upload
}

const HoverProfilePhoto: React.FC<HoverProfilePhotoProps> = ({ 
  currentUser, 
  size = 'md',
  className = '',
  showTooltips = true,
  clickToUpload = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
        description: "Profile photo updated successfully",
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
        description: "Profile photo removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile-photo'] });
      setPreviewUrl(null);
      setIsHovered(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to remove profile photo",
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

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleAvatarClick = () => {
    if (clickToUpload) {
      fileInputRef.current?.click();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
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
  const sizeConfig = {
    xs: {
      avatar: 'h-8 w-8',
      text: 'text-xs',
      button: 'h-6 w-6',
      buttonIcon: 'h-2.5 w-2.5',
      overlayIcon: 'h-3 w-3',
      buttonOffset: '-top-1 -right-1'
    },
    sm: {
      avatar: 'h-12 w-12',
      text: 'text-sm',
      button: 'h-7 w-7',
      buttonIcon: 'h-3 w-3',
      overlayIcon: 'h-4 w-4',
      buttonOffset: '-top-1.5 -right-1.5'
    },
    md: {
      avatar: 'h-16 w-16',
      text: 'text-base',
      button: 'h-8 w-8',
      buttonIcon: 'h-3.5 w-3.5',
      overlayIcon: 'h-5 w-5',
      buttonOffset: '-top-2 -right-2'
    },
    lg: {
      avatar: 'h-24 w-24',
      text: 'text-lg',
      button: 'h-10 w-10',
      buttonIcon: 'h-4 w-4',
      overlayIcon: 'h-6 w-6',
      buttonOffset: '-top-2.5 -right-2.5'
    },
    xl: {
      avatar: 'h-32 w-32',
      text: 'text-xl',
      button: 'h-12 w-12',
      buttonIcon: 'h-5 w-5',
      overlayIcon: 'h-7 w-7',
      buttonOffset: '-top-3 -right-3'
    }
  };

  const config = sizeConfig[size];
  const isLoading = uploadMutation.isPending || deleteMutation.isPending || isLoadingPhoto;

  const content = (
    <div className={`relative inline-block ${className}`}>
      <div 
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleAvatarClick}
      >
        <Avatar className={`${config.avatar} transition-all duration-200 ${isHovered ? 'ring-2 ring-blue-400 ring-opacity-60' : ''}`}>
          <AvatarImage 
            src={currentPhotoUrl} 
            alt={getDisplayName()}
            className="object-cover"
          />
          <AvatarFallback className={config.text}>
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
            <Loader2 className={`${config.overlayIcon} text-white animate-spin`} />
          </div>
        )}

        {/* Hover overlay with camera icon */}
        {isHovered && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full transition-all duration-200">
            <Camera className={`${config.overlayIcon} text-white`} />
          </div>
        )}

        {/* Action buttons - positioned outside the avatar */}
        {isHovered && !isLoading && (
          <>
            {/* Upload button */}
            <Button
              size="sm"
              className={`absolute ${config.buttonOffset} ${config.button} rounded-full bg-blue-600 hover:bg-blue-700 border-2 border-white shadow-lg transition-all duration-200 transform hover:scale-110`}
              onClick={handleUploadClick}
            >
              <Plus className={config.buttonIcon} />
            </Button>

            {/* Delete button - only show if there's a custom photo */}
            {hasCustomPhoto && (
              <Button
                size="sm"
                className={`absolute -bottom-2 -right-2 ${config.button} rounded-full bg-red-600 hover:bg-red-700 border-2 border-white shadow-lg transition-all duration-200 transform hover:scale-110`}
                onClick={handleDelete}
              >
                <X className={config.buttonIcon} />
              </Button>
            )}
          </>
        )}
      </div>

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

  if (!showTooltips) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isLoading 
              ? "Processing..." 
              : hasCustomPhoto 
                ? "Change or remove photo" 
                : "Click to upload photo"
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HoverProfilePhoto;
