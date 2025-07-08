import React, { useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useUploadProfilePhoto, useDeleteProfilePhoto } from '@/hooks/use-student-profile';
import { useProfilePhoto } from '@/hooks/use-profile-photo';
import ProfileAvatar from '@/components/common/ProfileAvatar';
import { 
  Camera, 
  User, 
  Shield, 
  Upload,
  X,
  Check,
  Trash2,
  Calendar,
  CheckCircle,
  AlertCircle,
  ImageIcon,
  RotateCcw,
  Crop,
  Edit3,
  Eye,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfileCardProps {
  currentUser: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    role?: string;
    enrollmentStatus?: string;
    createdAt?: string;
  };
  profileData: {
    profilePhoto?: {
      url?: string;
      isCustom?: boolean;
      source?: string;
    };
    [key: string]: unknown;
  };
  completeness: number;
  className?: string;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ 
  currentUser, 
  profileData, 
  completeness,
  className 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use the new profile photo hook
  const { isCustomPhoto, forceRefresh } = useProfilePhoto();

  const uploadPhotoMutation = useUploadProfilePhoto();
  const deletePhotoMutation = useDeleteProfilePhoto();

  const validateFile = useCallback((file: File): string | null => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, GIF, or WebP)';
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB';
    }

    // Validate dimensions (optional - can be expanded)
    return null;
  }, []);

  const createPreview = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      setImageError(null);
    };
    reader.onerror = () => {
      setImageError('Failed to load image preview');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      toast({
        title: 'Invalid file',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    createPreview(file);
    setShowPreview(true);
    setShowUploadDialog(true);
  }, [validateFile, createPreview, toast]);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      await uploadPhotoMutation.mutateAsync(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Force immediate refresh of profile photo
      await forceRefresh();
      
      toast({
        title: 'Success!',
        description: 'Profile photo updated successfully',
      });
      
      // Reset states
      setTimeout(() => {
        setShowUploadDialog(false);
        setShowPreview(false);
        setPreviewUrl(null);
        setSelectedFile(null);
        setUploadProgress(0);
      }, 100);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload profile photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadDialog(false);
    setShowPreview(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadProgress(0);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setShowPreview(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    try {
      await deletePhotoMutation.mutateAsync();
      
      // Force immediate refresh of profile photo
      await forceRefresh();
      
      setShowDeleteDialog(false);
      toast({
        title: 'Success!',
        description: 'Profile photo deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete profile photo. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEnrollmentStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'INSTRUCTOR': return 'bg-blue-100 text-blue-800';
      case 'STUDENT': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={cn("relative", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Profile</CardTitle>
            <CardDescription>
              Manage your profile information and photo
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <span className={cn("text-sm font-medium", getCompletionColor(completeness))}>
              {completeness}% Complete
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            {/* Show preview image when file is selected, otherwise show ProfileAvatar */}
            {showPreview && previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl ring-2 ring-gray-100"
                />
                {/* Preview Actions Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="h-9 w-9 p-0 bg-white/90 hover:bg-white text-gray-700 shadow-lg"
                    >
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={handleCancel}
                      className="h-9 w-9 p-0 shadow-lg"
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {/* Preview Indicator */}
                <div className="absolute -bottom-1 -right-1">
                  <div className="bg-orange-500 text-white rounded-full p-1.5 shadow-lg">
                    <Eye className="h-3 w-3" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <ProfileAvatar
                  currentUser={currentUser}
                  size="lg"
                  className="w-28 h-28 border-4 border-white shadow-xl ring-2 ring-gray-100 transition-all duration-300 group-hover:shadow-2xl"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={triggerFileInput}
                      className="h-9 w-9 p-0 bg-white/90 hover:bg-white text-gray-700 shadow-lg"
                      title="Upload or change photo"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    {isCustomPhoto && (
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => setShowDeleteDialog(true)}
                        className="h-9 w-9 p-0 shadow-lg"
                        title="Remove photo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Photo Source Indicator */}
                <div className="absolute -bottom-1 -right-1">
                  {isCustomPhoto ? (
                    <div className="bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                      <ImageIcon className="h-3 w-3" />
                    </div>
                  ) : (
                    <div className="bg-blue-500 text-white rounded-full p-1.5 shadow-lg">
                      <User className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {/* Upload Button - Always Visible on Mobile, more prominent */}
                <button
                  onClick={triggerFileInput}
                  className="absolute -bottom-2 -right-2 lg:hidden bg-eduBlue-600 hover:bg-eduBlue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
                  title="Upload photo"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Photo Actions - Only show when previewing */}
          {showPreview && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Save Photo</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            </div>
          )}

          {/* Photo Source Info */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {showPreview 
                ? 'Preview - Click "Save Photo" to upload'
                : isCustomPhoto 
                  ? 'Hover on image to change or remove photo' 
                  : 'Hover on image to upload a custom photo'
              }
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* User Information */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">
              {currentUser.firstName} {currentUser.lastName}
            </h3>
            <p className="text-sm text-gray-600">@{currentUser.username}</p>
            <p className="text-sm text-gray-500">{currentUser.email}</p>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap justify-center gap-2">
            <Badge className={getRoleColor(currentUser.role)}>
              <User className="h-3 w-3 mr-1" />
              {currentUser.role}
            </Badge>
            <Badge className={getEnrollmentStatusColor(currentUser.enrollmentStatus)}>
              {currentUser.enrollmentStatus === 'ACTIVE' ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {currentUser.enrollmentStatus}
            </Badge>
          </div>

          {/* Member Since */}
          <div className="flex items-center justify-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              Member since {new Date(currentUser.createdAt || '').toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </span>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Profile Completeness</span>
            <span className={cn("text-sm font-semibold", getCompletionColor(completeness))}>
              {completeness}%
            </span>
          </div>
          <Progress value={completeness} className="h-2" />
          <p className="text-xs text-gray-600">
            {completeness >= 80 
              ? 'Great! Your profile is well-completed.' 
              : completeness >= 60 
                ? 'Good progress! Consider adding more details.' 
                : 'Complete your profile to unlock all features.'
            }
          </p>
        </div>
      </CardContent>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Profile Photo</span>
            </DialogTitle>
            <DialogDescription>
              Preview your photo before uploading. You can always change it later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview Section */}
            {previewUrl && !imageError && (
              <div className="flex justify-center">
                <div className="relative group">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-eduBlue-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black bg-opacity-10">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                    <Check className="h-3 w-3" />
                  </div>
                </div>
              </div>
            )}

            {/* Image Error */}
            {imageError && (
              <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{imageError}</span>
              </div>
            )}

            {/* Quick Actions for Preview */}
            {previewUrl && !isUploading && !imageError && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  className="flex items-center space-x-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Choose Different</span>
                </Button>
              </div>
            )}

            {/* File Info */}
            {selectedFile && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">File name:</span>
                  <span className="text-gray-600 truncate max-w-40">{selectedFile.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">File size:</span>
                  <span className="text-gray-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">File type:</span>
                  <span className="text-gray-600">{selectedFile.type}</span>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Drag and Drop Area */}
            {!previewUrl && (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragOver 
                    ? 'border-eduBlue-400 bg-eduBlue-50 scale-105' 
                    : 'border-gray-300 hover:border-eduBlue-300 hover:bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-3">
                  <div className={`transition-colors duration-200 ${dragOver ? 'text-eduBlue-500' : 'text-gray-400'}`}>
                    {dragOver ? (
                      <Download className="h-12 w-12 mx-auto animate-bounce" />
                    ) : (
                      <Upload className="h-12 w-12 mx-auto" />
                    )}
                  </div>
                  <div>
                    <p className="text-base text-gray-700 font-medium">
                      {dragOver ? 'Drop your image here' : 'Upload your profile photo'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Drag and drop an image here, or{' '}
                      <button
                        onClick={triggerFileInput}
                        className="text-eduBlue-600 hover:text-eduBlue-700 font-medium underline underline-offset-2"
                      >
                        browse files
                      </button>
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Supported formats: JPEG, PNG, GIF, WebP</p>
                    <p>Maximum file size: 5MB</p>
                    <p>Recommended: Square images work best</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleCancelUpload}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-eduBlue-600 hover:bg-eduBlue-700"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              <span>Delete Profile Photo</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your profile photo? This action cannot be undone.
              Your profile will show a default avatar instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePhoto}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default UserProfileCard;
