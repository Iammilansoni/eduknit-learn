import React, { useState, useRef } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { studentApi as studentAPI } from '@/services/studentApi';
import { Upload, Trash2, Camera, Loader2, Edit, CheckCircle2 } from 'lucide-react';
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
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Get current profile photo URL
  const { data: photoData, isLoading: isLoadingPhoto } = useQuery({
    queryKey: ['student-profile-photo'],
    queryFn: studentAPI.getProfilePhotoUrl,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => studentAPI.uploadProfilePhoto(file),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Profile photo uploaded successfully",
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1200);
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile-photo'] });
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
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1200);
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile-photo'] });
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
    <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
          <Camera className="h-5 w-5 text-blue-500 dark:text-blue-300" />
          Profile Photo
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Hover or tap your photo to upload or delete. Instantly updates everywhere.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enhanced Profile Photo Display with Hover */}
        <div className="flex flex-col items-center space-y-4">
          <div 
            className="relative group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            tabIndex={0}
            aria-label="Profile photo actions"
          >
            {/* Avatar with Loading State and Animation */}
            <motion.div
              className="relative"
              animate={isHovered ? { scale: 1.08, filter: 'blur(0.5px)' } : { scale: 1, filter: 'blur(0px)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Avatar className="h-36 w-36 shadow-lg ring-4 ring-blue-100 dark:ring-blue-900 transition-all duration-300 group-hover:brightness-90">
                <AvatarImage 
                  src={currentPhotoUrl} 
                  alt={getDisplayName()}
                  className="object-cover"
                />
                <AvatarFallback className={
                  currentPhotoUrl
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-semibold"
                    : "bg-gradient-to-br from-[#0078D4] to-[#005A9E] text-white text-4xl font-bold border border-blue-300 flex items-center justify-center shadow-md"
                }>
                  <span className="tracking-wide select-none">
                    {getInitials()}
                  </span>
                </AvatarFallback>
              </Avatar>
              {/* Success Animation */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center z-10"
                  >
                    <CheckCircle2 className="h-20 w-20 text-green-400 drop-shadow-lg animate-bounceIn" />
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-10">
                  <Loader2 className="h-10 w-10 text-white animate-spin" />
                </div>
              )}
            </motion.div>
            {/* Hover Overlay with Actions */}
            <AnimatePresence>
              {isHovered && !isLoading && !showSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center z-10"
                >
                  <div className="flex space-x-2">
                    {/* Upload Button */}
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      onClick={handleUploadClick}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                        className="bg-red-500/20 backdrop-blur-sm hover:bg-red-500/30 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400"
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
            <motion.div
              className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2 shadow-lg border-4 border-white dark:border-blue-900"
              initial={{ scale: 1 }}
              animate={isHovered ? { scale: 1.15, rotate: 10 } : { scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Edit className="h-5 w-5 text-white" />
            </motion.div>
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
            <p className="text-base font-semibold text-blue-900 dark:text-blue-200">
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
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  No photo uploaded — your initial will be used
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
            className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800"
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
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800"
            >
              <Trash2 className="h-4 w-4" />
              {isLoading ? 'Deleting...' : 'Remove'}
            </Button>
          )}
        </div>

        {/* Upload Guidelines */}
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 space-y-2 border border-blue-100 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">Photo Guidelines</h4>
          <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
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
