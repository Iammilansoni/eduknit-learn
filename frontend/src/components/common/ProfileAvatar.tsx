import React, { useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfilePhoto } from '@/hooks/use-profile-photo';

interface ProfileAvatarProps {
  currentUser?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
}

export interface ProfileAvatarRef {
  refresh: () => void;
}

const ProfileAvatar = forwardRef<ProfileAvatarRef, ProfileAvatarProps>(({ 
  currentUser, 
  size = 'md', 
  className = '',
  showFallback = true 
}, ref) => {
  const { profilePhotoUrl, photoSource, isCustomPhoto, forceRefresh } = useProfilePhoto();

  // Expose refresh method
  useImperativeHandle(ref, () => ({
    refresh: () => {
      forceRefresh();
    }
  }), [forceRefresh]);

  const getDisplayName = useCallback(() => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    return currentUser?.username || currentUser?.email || 'User';
  }, [currentUser]);

  const getInitials = useCallback(() => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, [getDisplayName]);

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8';
      case 'md': return 'h-10 w-10';
      case 'lg': return 'h-16 w-16';
      case 'xl': return 'h-24 w-24';
      default: return 'h-10 w-10';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'md': return 'text-sm';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-sm';
    }
  };

  return (
    <Avatar className={`${getSizeClass()} ${className}`}>
      {/* Show custom photo only if available and loaded successfully */}
      {isCustomPhoto && profilePhotoUrl && (
        <AvatarImage 
          src={profilePhotoUrl} 
          alt={getDisplayName()}
          className="object-cover"
          onError={(e) => {
            console.log('ProfileAvatar - Custom image failed to load, showing initials fallback');
          }}
          onLoad={() => {
            console.log('ProfileAvatar - Custom image loaded successfully');
          }}
        />
      )}
      
      {/* Always show initials as fallback - this is the default when no custom photo */}
      <AvatarFallback className={getTextSize()}>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
});

ProfileAvatar.displayName = 'ProfileAvatar';

export default ProfileAvatar;
