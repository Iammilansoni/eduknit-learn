import React, { useState, useRef } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { studentApi as studentAPI } from '@/services/studentApi';
import { Upload, Trash2, Camera, Loader2, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isHovered, setIsHovered] = useState(false);
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
      // Invalidate auth context to update sidebar
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
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
      // Invalidate auth context to update sidebar
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
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
  const isLoading = uploadMutation.isPending || deleteMutation.isPending || isLoadingPhoto;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Profile Photo
        </CardTitle>
        <CardDescription>
          Hover over your photo to upload or delete. Changes will appear across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enhanced Profile Photo Display with Hover */}
        <div className="flex flex-col items-center space-y-4">
          <div 
            className="relative group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Avatar with Loading State */}
            <div className="relative">
              <Avatar className="h-32 w-32 transition-all duration-300 group-hover:brightness-75">
                <AvatarImage 
                  src={currentPhotoUrl} 
                  alt={getDisplayName()}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Hover Overlay with Actions */}
            <AnimatePresence>
              {isHovered && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center"
                >
                  <div className="flex space-x-2">
                    {/* Upload Button */}
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      onClick={handleUploadClick}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
                      title="Upload new photo"
                    >
                      <Upload className="h-5 w-5" />
                    </motion.button>
                    
                    {/* Delete Button - only show if there's a custom photo */}
                    {currentPhotoUrl && (
                      <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        onClick={handleDelete}
                        className="bg-red-500/20 backdrop-blur-sm hover:bg-red-500/30 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
                        title="Delete photo"
                      >
                        <Trash2 className="h-5 w-5" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Camera Icon Badge */}
            <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 shadow-lg">
              <Edit className="h-4 w-4 text-white" />
            </div>
          </div>

          {/* Hidden File Input */}
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Status Information */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {getDisplayName()}
            </p>
            {currentPhotoUrl ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {hasCustomPhoto ? 'Custom photo' : 'Using Gravatar'}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  No photo uploaded
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Alternative Action Buttons */}
        <div className="flex justify-center space-x-3">
          <Button
            onClick={handleUploadClick}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isLoading ? 'Uploading...' : 'Change Photo'}
          </Button>
          
          {currentPhotoUrl && (
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              {isLoading ? 'Deleting...' : 'Remove'}
            </Button>
          )}
        </div>

        {/* Upload Guidelines */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Photo Guidelines</h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Maximum file size: 5MB</li>
            <li>• Supported formats: JPEG, PNG, WebP</li>
            <li>• Recommended: Square images for best results</li>
            <li>• Your photo will appear in the sidebar and across the platform</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePhotoUpload;
