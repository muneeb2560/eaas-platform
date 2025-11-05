"use client";

import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/providers/SupabaseProvider';
import { useToast } from '@/lib/hooks/useToast';

export function useSignOut() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { signOut } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const signingOutRef = useRef(false);

  const isDevelopmentMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';

  const handleSignOut = useCallback(async () => {
    if (signingOutRef.current) {
      return;
    }

    signingOutRef.current = true;
    setIsSigningOut(true);
    
    try {
      if (isDevelopmentMode) {
        localStorage.removeItem('dev-auth-user');
        localStorage.removeItem('dev-user-profile');
        showInfo('Signed Out', 'You have been signed out (development mode).');
        await signOut();
      } else {
        await signOut();
        showSuccess('Signed Out', 'You have been signed out successfully.');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      showError('Sign Out Failed', 'Failed to sign out. Please try again.');
    } finally {
      signingOutRef.current = false;
      setIsSigningOut(false);
    }
  }, [isDevelopmentMode, signOut, showSuccess, showError, showInfo]);

  return {
    handleSignOut,
    isSigningOut
  };
}