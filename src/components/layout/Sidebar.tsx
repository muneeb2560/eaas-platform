"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/providers/SupabaseProvider';
import { useSignOut } from '@/lib/hooks/useSignOut';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { handleSignOut, isSigningOut } = useSignOut();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Experiments', href: '/experiments', icon: '🧪' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
    { name: 'Rubrics', href: '/rubrics', icon: '📋' },
    { name: 'Upload', href: '/upload', icon: '📁' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-white">EaaS</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              ✕
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User section */}
          {user && (
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              
              {/* Mode indicator */}
              <div className="mb-3">
                {process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co' ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-900/20 text-yellow-300 border border-yellow-500/30">
                    🚧 Dev Mode
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-900/20 text-green-300 border border-green-500/30">
                    ✅ Production
                  </span>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full text-xs"
              >
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}