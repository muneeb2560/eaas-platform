"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/providers/SupabaseProvider';
import { useToast } from '@/lib/hooks/useToast';

export function useSignOut() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { signOut } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const isDevelopmentMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';

  const handleSignOut = async () => {
    // Prevent multiple simultaneous sign out attempts
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    
    try {
      if (isDevelopmentMode) {
        // Development mode - clear localStorage and let the provider handle redirect
        localStorage.removeItem('dev-auth-user');
        localStorage.removeItem('dev-user-profile');
        showInfo('Signed Out', 'You have been signed out (development mode).');
        
        // Call the provider's signOut function to handle state and redirection
        await signOut();
      } else {
        // Production mode - let the provider handle everything
        await signOut();
        showSuccess('Signed Out', 'You have been signed out successfully.');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      showError('Sign Out Failed', 'Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  return {
    handleSignOut,
    isSigningOut
  };
}