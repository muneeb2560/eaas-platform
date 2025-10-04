"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface AuthResult {
  data: {
    user: User | null;
    session: Session | null;
  } | null;
  error: AuthError | Error | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Create supabase client once and memoize it
  const supabase = React.useMemo(() => createClient(), []);

  // Check if we're in development mode
  const isDevelopmentMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';

  useEffect(() => {
    if (isDevelopmentMode) {
      // Development mode - use mock authentication
      const storedUser = localStorage.getItem('dev-auth-user');
      const storedProfile = localStorage.getItem('dev-user-profile');
      
      if (storedUser) {
        try {
          let mockUser = JSON.parse(storedUser) as User;
          
          // Merge with stored profile data if available
          if (storedProfile) {
            const profileData = JSON.parse(storedProfile);
            mockUser = {
              ...mockUser,
              user_metadata: {
                ...mockUser.user_metadata,
                ...profileData.user_metadata,
              }
            };
          }
          
          const mockSession = {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'bearer',
            user: mockUser
          } as Session;
          
          setUser(mockUser);
          setSession(mockSession);
        } catch (error) {
          console.warn('Failed to parse stored user:', error);
          localStorage.removeItem('dev-auth-user');
          localStorage.removeItem('dev-user-profile');
        }
      }
      setLoading(false);
      return;
    }

    // Production mode - use real Supabase authentication
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        console.warn('Supabase connection failed:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, redirecting to dashboard');
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, redirecting to signin');
          router.push('/auth/signin');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase, isDevelopmentMode]);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    if (isDevelopmentMode) {
      // Development mode simulation
      const mockUser: User = {
        id: 'dev-user-' + Date.now(),
        email: email,
        user_metadata: { name: email.split('@')[0] },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: 'authenticated'
      };
      
      const mockSession: Session = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: mockUser
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('dev-auth-user', JSON.stringify(mockUser));
      
      // Update state
      setUser(mockUser);
      setSession(mockSession);
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
      
      return { data: { user: mockUser, session: mockSession }, error: null };
    }
    
    // Production mode
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error && data.session) {
        // Successful sign-in, redirect will be handled by onAuthStateChange
        return { data: { user: data.user, session: data.session }, error: null };
      }
      
      return { data: null, error };
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Unknown auth error');
      return { data: null, error: authError };
    }
  };

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    if (isDevelopmentMode) {
      // Development mode simulation
      const mockUser: User = {
        id: 'dev-user-' + Date.now(),
        email: email,
        user_metadata: { name: email.split('@')[0] },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: 'authenticated'
      };
      
      // Simulate email verification process
      try {
        const response = await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            userId: mockUser.id,
            userName: email.split('@')[0]
          }),
        });
        
        const emailResult = await response.json();
        if (emailResult.success) {
          console.log('✅ Verification email sent successfully');
        }
      } catch (error) {
        console.error('Failed to send verification email:', error);
      }
      
      return { data: { user: mockUser, session: null }, error: null };
    }
    
    // Production mode
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      return { 
        data: data.user ? { user: data.user, session: data.session } : null, 
        error 
      };
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Unknown auth error');
      return { data: null, error: authError };
    }
  };

  const signInWithGoogle = async (): Promise<AuthResult> => {
    if (isDevelopmentMode) {
      // Development mode simulation
      alert('Development Mode: Google OAuth simulation. In production, this would redirect to Google.');
      
      const mockGoogleUser: User = {
        id: 'google-dev-user-456',
        email: 'google-user@example.com',
        user_metadata: { 
          name: 'Google Dev User',
          avatar_url: 'https://via.placeholder.com/100',
          provider: 'google'
        },
        app_metadata: { provider: 'google' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: 'authenticated'
      };
      
      const mockGoogleSession: Session = {
        access_token: 'mock-google-token',
        refresh_token: 'mock-google-refresh',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: mockGoogleUser
      };
      
      // Store in localStorage
      localStorage.setItem('dev-auth-user', JSON.stringify(mockGoogleUser));
      
      // Update state
      setUser(mockGoogleUser);
      setSession(mockGoogleSession);
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
      
      return { data: { user: mockGoogleUser, session: mockGoogleSession }, error: null };
    }
    
    // Production mode
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' 
            ? `${window.location.origin}/auth/callback`
            : '/auth/callback',
        },
      });
      
      // OAuth will redirect, so we return success state
      return { data: { user: null, session: null }, error };
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Google sign-in failed');
      return { data: null, error: authError };
    }
  };

  const signOut = async (): Promise<void> => {
    if (isDevelopmentMode) {
      // Development mode
      localStorage.removeItem('dev-auth-user');
      setUser(null);
      setSession(null);
      router.push('/auth/signin');
      return;
    }
    
    // Production mode
    try {
      await supabase.auth.signOut();
      // State update and redirect will be handled by onAuthStateChange
    } catch (error) {
      console.warn('Sign out failed:', error);
      // Fallback: clear local state and redirect
      setUser(null);
      setSession(null);
      router.push('/auth/signin');
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseProvider');
  }
  return context;
}