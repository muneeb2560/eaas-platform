"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/providers/SupabaseProvider';
import { useToast } from '@/lib/hooks/useToast';
import { useNotifications } from '@/lib/providers/NotificationProvider';
import { useRouter } from 'next/navigation';

interface ProfileFormData {
  displayName: string;
  email: string;
  avatar: string;
  bio: string;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    language: string;
  };
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const { addNotification } = useNotifications();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
    email: user?.email || '',
    avatar: user?.user_metadata?.avatar_url || '',
    bio: user?.user_metadata?.bio || '',
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      language: 'en',
    },
  });

  const isDevelopmentMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';

  // Load stored profile data in development mode
  useEffect(() => {
    if (isDevelopmentMode) {
      const storedProfile = localStorage.getItem('dev-user-profile');
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile);
          setFormData(prev => ({
            ...prev,
            displayName: profile.user_metadata?.name || prev.displayName,
            avatar: profile.user_metadata?.avatar_url || '',
            bio: profile.user_metadata?.bio || prev.bio,
            preferences: {
              ...prev.preferences,
              ...profile.user_metadata?.preferences,
            },
          }));
        } catch (error) {
          console.error('Error loading stored profile:', error);
        }
      }
    }
  }, [isDevelopmentMode]);

  // Auto-save notification preferences when they change
  const saveNotificationPreferences = async (newPreferences: typeof formData.preferences) => {
    try {
      if (isDevelopmentMode) {
        // Development mode - update localStorage
        const storedProfile = localStorage.getItem('dev-user-profile');
        const currentProfile = storedProfile ? JSON.parse(storedProfile) : { ...user };
        const updatedProfile = {
          ...currentProfile,
          user_metadata: {
            ...currentProfile.user_metadata,
            preferences: newPreferences,
          }
        };
        localStorage.setItem('dev-user-profile', JSON.stringify(updatedProfile));
        
        showSuccess('Preferences Updated', 'Notification settings have been saved.');
        addNotification({
          type: 'success',
          title: 'Notification Preferences Updated',
          message: 'Your notification settings have been saved successfully.',
        });
      } else {
        // Production mode - save via API
        const response = await fetch('/api/profile/update', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ preferences: newPreferences }),
        });

        if (!response.ok) {
          throw new Error('Failed to update preferences');
        }

        showSuccess('Preferences Updated', 'Notification settings have been saved.');
        addNotification({
          type: 'success',
          title: 'Notification Preferences Updated',
          message: 'Your notification settings have been saved successfully.',
        });
      }
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      showError('Update Failed', 'Failed to save notification preferences.');
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Invalid File', 'Please select an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('File Too Large', 'Image must be less than 5MB.');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      if (isDevelopmentMode) {
        // Development mode - convert to base64 and store locally
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64String = e.target?.result as string;
          
          // Update form data with new avatar
          const newFormData = { ...formData, avatar: base64String };
          setFormData(newFormData);
          
          // Save to localStorage
          const storedProfile = localStorage.getItem('dev-user-profile');
          const currentProfile = storedProfile ? JSON.parse(storedProfile) : { ...user };
          const updatedProfile = {
            ...currentProfile,
            user_metadata: {
              ...currentProfile.user_metadata,
              avatar_url: base64String,
            }
          };
          localStorage.setItem('dev-user-profile', JSON.stringify(updatedProfile));
          
          showSuccess('Photo Updated', 'Profile picture has been updated successfully.');
          addNotification({
            type: 'success',
            title: 'Profile Picture Updated',
            message: 'Your profile picture has been changed successfully.',
          });
        };
        reader.readAsDataURL(file);
      } else {
        // Production mode - upload to server/storage
        const formDataUpload = new FormData();
        formDataUpload.append('avatar', file);
        
        const response = await fetch('/api/profile/upload-avatar', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!response.ok) {
          throw new Error('Failed to upload avatar');
        }

        const result = await response.json();
        
        // Update form data with new avatar URL
        setFormData(prev => ({ ...prev, avatar: result.avatarUrl }));
        
        showSuccess('Photo Updated', 'Profile picture has been updated successfully.');
        addNotification({
          type: 'success',
          title: 'Profile Picture Updated',
          message: 'Your profile picture has been changed successfully.',
        });
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      showError('Upload Failed', 'Failed to update profile picture. Please try again.');
      addNotification({
        type: 'error',
        title: 'Photo Upload Failed',
        message: 'There was an error updating your profile picture.',
        action: {
          label: 'Retry',
          onClick: () => document.getElementById('photo-upload')?.click()
        }
      });
    } finally {
      setIsUploadingPhoto(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (isDevelopmentMode) {
        // Development mode - simulate profile update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update localStorage for development persistence
        const mockUserData = {
          ...user,
          user_metadata: {
            ...user?.user_metadata,
            name: formData.displayName,
            bio: formData.bio,
            preferences: formData.preferences,
          }
        };
        localStorage.setItem('dev-user-profile', JSON.stringify(mockUserData));
        
        showSuccess('Profile Updated', 'Your profile has been saved successfully.');
        addNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile information has been updated.',
        });
      } else {
        // Production mode - update via Supabase
        // This would integrate with your Supabase user management
        const response = await fetch('/api/profile/update', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to update profile');
        }

        showSuccess('Profile Updated', 'Your profile has been saved successfully.');
        addNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile information has been updated.',
        });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      showError('Update Failed', 'Failed to update profile. Please try again.');
      addNotification({
        type: 'error',
        title: 'Profile Update Failed',
        message: 'There was an error updating your profile.',
        action: {
          label: 'Retry',
          onClick: () => handleSave()
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      if (isDevelopmentMode) {
        // Development mode - simulate account deletion
        localStorage.removeItem('dev-auth-user');
        localStorage.removeItem('dev-user-profile');
        showInfo('Account Deleted', 'Your account has been deleted (development mode).');
        router.push('/auth/signin');
      } else {
        // Production mode - actual account deletion
        const response = await fetch('/api/auth/delete-account', {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete account');
        }

        await signOut();
        showInfo('Account Deleted', 'Your account has been permanently deleted.');
        router.push('/');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      showError('Deletion Failed', 'Failed to delete account. Please contact support.');
    }
  };

  const getAvatarUrl = () => {
    // First check form data avatar (uploaded or URL) - but only if it's not empty
    if (formData.avatar && formData.avatar.trim() !== '') {
      // If it's a base64 string (development mode upload), return as is
      if (formData.avatar.startsWith('data:')) {
        return formData.avatar;
      }
      // If it's a URL, return as is
      if (formData.avatar.startsWith('http')) {
        return formData.avatar;
      }
    }
    
    // Check user metadata for avatar - but only if it's not empty
    if (user?.user_metadata?.avatar_url && user.user_metadata.avatar_url.trim() !== '') {
      // If it's a base64 string, return as is
      if (user.user_metadata.avatar_url.startsWith('data:')) {
        return user.user_metadata.avatar_url;
      }
      // If it's a URL, return as is
      if (user.user_metadata.avatar_url.startsWith('http')) {
        return user.user_metadata.avatar_url;
      }
    }
    
    // Generate avatar placeholder with initials
    const displayName = formData.displayName || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
    const initials = displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3b82f6&color=ffffff&size=128`;
  };

  if (!user) {
    // Only redirect on client-side to avoid SSR issues
    if (typeof window !== 'undefined') {
      router.push('/auth/signin');
    }
    return null;
  }

  return (
    <DashboardLayout title="Profile">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <div className="flex items-center space-x-2">
            <p className="text-gray-300">
              Manage your account information and preferences
            </p>
            {isDevelopmentMode && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-900/20 text-yellow-300 border border-yellow-500/30">
                🚧 Dev Mode
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                <Button
                  variant={isEditing ? "outline" : "default"}
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false);
                      // Reset form data
                      setFormData({
                        displayName: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
                        email: user?.email || '',
                        avatar: user?.user_metadata?.avatar_url || '',
                        bio: user?.user_metadata?.bio || '',
                        preferences: {
                          emailNotifications: true,
                          pushNotifications: true,
                          language: 'en',
                        },
                      });
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  disabled={isLoading}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>

              <div className="space-y-4">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your display name"
                    />
                  ) : (
                    <p className="text-white py-2">{formData.displayName || 'Not set'}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-2">
                    <p className="text-white py-2">{formData.email}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-900/20 text-green-300 border border-green-500/30">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-white py-2">{formData.bio || 'No bio added yet.'}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Preferences */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Preferences</h2>
              
              <div className="space-y-4">
                {/* Notifications */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences.emailNotifications}
                        onChange={(e) => {
                          const newPreferences = {
                            ...formData.preferences,
                            emailNotifications: e.target.checked
                          };
                          setFormData(prev => ({
                            ...prev,
                            preferences: newPreferences
                          }));
                          saveNotificationPreferences(newPreferences);
                        }}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                      />
                      <span className="text-gray-300">Email notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences.pushNotifications}
                        onChange={(e) => {
                          const newPreferences = {
                            ...formData.preferences,
                            pushNotifications: e.target.checked
                          };
                          setFormData(prev => ({
                            ...prev,
                            preferences: newPreferences
                          }));
                          saveNotificationPreferences(newPreferences);
                        }}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                      />
                      <span className="text-gray-300">Push notifications</span>
                    </label>
                  </div>
                </div>

                {/* Theme */}
                {/* Theme section removed as requested */}
              </div>
            </Card>
          </div>

          {/* Avatar & Account Actions */}
          <div className="space-y-6">
            {/* Avatar */}
            <Card className="p-6 text-center">
              <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
              <div className="mb-4">
                <div className="relative inline-block">
                  <img
                    src={getAvatarUrl()}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto border-4 border-gray-600 object-cover"
                  />
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                {isDevelopmentMode 
                  ? 'Upload or use auto-generated avatar (dev mode)'
                  : 'Upload your profile picture'
                }
              </p>
              
              {/* Hidden file input */}
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              
              <div className="space-y-3">
                <Button
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  disabled={isUploadingPhoto}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isUploadingPhoto ? 'Uploading...' : 'Add Photo'}
                </Button>
                
                {(formData.avatar && formData.avatar.trim() !== '') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, avatar: '' }));
                      if (isDevelopmentMode) {
                        const storedProfile = localStorage.getItem('dev-user-profile');
                        const currentProfile = storedProfile ? JSON.parse(storedProfile) : { ...user };
                        const updatedProfile = {
                          ...currentProfile,
                          user_metadata: {
                            ...currentProfile.user_metadata,
                            avatar_url: '',
                          }
                        };
                        localStorage.setItem('dev-user-profile', JSON.stringify(updatedProfile));
                      }
                      showSuccess('Photo Removed', 'Profile picture has been removed. Auto-generated avatar will be displayed.');
                    }}
                    className="w-full text-red-400 border-red-500/50 hover:bg-red-900/20"
                    disabled={isUploadingPhoto}
                  >
                    Remove Photo
                  </Button>
                )}
              </div>
              
              {isEditing && (
                <div className="mt-4">
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                    placeholder="Or enter image URL"
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </Card>

            {/* Account Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    showInfo('Export Data', 'Data export feature coming soon!');
                    addNotification({
                      type: 'info',
                      title: 'Feature Coming Soon',
                      message: 'Data export will be available in a future update.',
                    });
                  }}
                >
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-400 border-red-500/50 hover:bg-red-900/20"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </div>
            </Card>

            {/* Account Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Account ID:</span>
                  <span className="text-white font-mono text-xs">
                    {user.id.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Member since:</span>
                  <span className="text-white">
                    {new Date(user.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account type:</span>
                  <span className="text-white">
                    {isDevelopmentMode ? 'Development' : 'Production'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}