"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/providers/SupabaseProvider';
import { useToast } from '@/lib/hooks/useToast';
import { useSignOut } from '@/lib/hooks/useSignOut';
import { useNotifications } from '@/lib/providers/NotificationProvider';
import { useRouter } from 'next/navigation';

interface SettingsProps {
  className?: string;
}

export function Settings({ className = '' }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { addNotification, clearAll } = useNotifications();
  const { handleSignOut, isSigningOut } = useSignOut();
  const router = useRouter();

  const isDevelopmentMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const onSignOut = async () => {
    setIsOpen(false);
    await handleSignOut();
  };

  const handleClearNotifications = () => {
    clearAll();
    showSuccess('Notifications Cleared', 'All notifications have been cleared.');
    setIsOpen(false);
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      if (isDevelopmentMode) {
        // Development mode - export localStorage data
        const userData = localStorage.getItem('dev-user-profile');
        const authData = localStorage.getItem('dev-auth-user');
        const experimentsData = localStorage.getItem('experiments');
        
        const exportData = {
          profile: userData ? JSON.parse(userData) : null,
          auth: authData ? JSON.parse(authData) : null,
          experiments: experimentsData ? JSON.parse(experimentsData) : [],
          exportDate: new Date().toISOString(),
          mode: 'development'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showSuccess('Data Exported', 'Your data has been exported successfully.');
      } else {
        // Production mode - API call for data export
        const response = await fetch('/api/user/export-data', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to export data');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showSuccess('Data Exported', 'Your data has been exported successfully.');
      }
    } catch (error) {
      console.error('Export data error:', error);
      showError('Export Failed', 'Failed to export data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleClearCache = () => {
    if (isDevelopmentMode) {
      // Development mode - clear specific cache items but keep auth and profile
      const cacheKeys = [
        'experiments',
        'analytics-cache',
        'dashboard-cache',
        'rubrics-cache',
        'upload-cache',
        'temp-data',
        'form-cache',
        'search-cache'
      ];
      
      let clearedCount = 0;
      cacheKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          clearedCount++;
        }
      });
      
      showSuccess('Cache Cleared', `Application cache has been cleared (${clearedCount} items removed in development mode).`);
    } else {
      // Production mode - clear browser cache and service worker cache
      let cachesClearedCount = 0;
      
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name).then(success => {
              if (success) cachesClearedCount++;
            });
          });
          
          // Also clear sessionStorage (but keep localStorage auth data)
          const sessionKeys = Object.keys(sessionStorage);
          sessionKeys.forEach(key => {
            if (!key.includes('auth') && !key.includes('user')) {
              sessionStorage.removeItem(key);
            }
          });
          
          showSuccess('Cache Cleared', `Browser cache has been cleared (${names.length} cache stores + session data).`);
        }).catch(() => {
          showSuccess('Cache Cleared', 'Cache clearing attempted (some items may require browser restart).');
        });
      } else {
        showSuccess('Cache Cleared', 'Cache API not supported in this browser.');
      }
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Settings Button */}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        disabled={isLoading || isSigningOut}
      >
        {(isLoading || isSigningOut) ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            {isDevelopmentMode && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-900/20 text-yellow-300 border border-yellow-500/30">
                  🚧 Development Mode
                </span>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Profile Settings */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  router.push('/profile');
                }
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700/50 flex items-center space-x-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile Settings</span>
            </button>

            {/* Clear Notifications */}
            <button
              onClick={handleClearNotifications}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700/50 flex items-center space-x-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12a3 3 0 00-6 0v8" />
              </svg>
              <span>Clear Notifications</span>
            </button>

            {/* Export Data */}
            <button
              onClick={handleExportData}
              disabled={isLoading}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700/50 flex items-center space-x-3 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Data</span>
            </button>

            {/* Clear Cache */}
            <button
              onClick={handleClearCache}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700/50 flex items-center space-x-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear Cache</span>
            </button>

            <div className="border-t border-gray-600 my-2"></div>

            {/* Sign Out */}
            <button
              onClick={onSignOut}
              disabled={isLoading || isSigningOut}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 flex items-center space-x-3 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}