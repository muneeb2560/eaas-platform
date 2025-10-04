"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from '@/components/common/NotificationBell';
import { Settings } from '@/components/common/Settings';
import { useNotifications } from '@/lib/providers/NotificationProvider';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

export function Header({ onMenuToggle, title }: HeaderProps) {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Mobile menu button */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          
          {title && (
            <h1 className="text-lg font-semibold text-white lg:hidden">
              {title}
            </h1>
          )}
        </div>

        {/* Desktop title */}
        {title && (
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold text-white">{title}</h1>
          </div>
        )}

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <NotificationBell
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={clearAll}
          />

          {/* Settings */}
          <Settings />
        </div>
      </div>
    </header>
  );
}