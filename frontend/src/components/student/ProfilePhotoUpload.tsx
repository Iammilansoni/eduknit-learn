import React, { useState, useRef } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { studentAPI } from '@/services/api';
import { Upload, Trash2, Camera, Loader2 } from 'lucide-react';

interface ProfilePhotoUploadProps {
  currentUser?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
  };
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({ currentUser }) => {
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
        description: "Profile photo uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile-photo'] });
      setPreviewUrl(null);
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
  const isGravatar = photoData?.data?.isGravatar && !previewUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Photo</CardTitle>
        <CardDescription>
          Upload a profile picture or use your Gravatar image
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Photo Display */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage 
                src={currentPhotoUrl} 
                alt={getDisplayName()}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            {(uploadMutation.isPending || isLoadingPhoto) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Photo Status */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isGravatar && "Using Gravatar image"}
              {hasCustomPhoto && "Custom profile photo"}
              {!currentPhotoUrl && "No profile photo"}
            </p>
            {isGravatar && (
              <p className="text-xs text-gray-500 mt-1">
                Change your Gravatar at{" "}
                <a 
                  href="https://gravatar.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  gravatar.com
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleUploadClick}
            disabled={uploadMutation.isPending}
            className="flex-1"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </>
            )}
          </Button>

          {hasCustomPhoto && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
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

        {/* Upload Guidelines */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Maximum file size: 5MB</p>
          <p>• Supported formats: JPEG, PNG, WebP</p>
          <p>• Recommended size: 400x400 pixels</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePhotoUpload;
