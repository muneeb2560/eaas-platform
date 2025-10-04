"use client";

import React, { useEffect, useState } from 'react';
import { Button } from './Button';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastComponentProps extends Toast {
  onRemove: (id: string) => void;
}

export function ToastComponent({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  action,
  onRemove 
}: ToastComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto remove after duration
    const removeTimer = setTimeout(() => {
      handleRemove();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(removeTimer);
    };
  }, [duration]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(id);
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "transform transition-all duration-300 ease-in-out";
    const visibilityStyles = isVisible && !isRemoving 
      ? "translate-x-0 opacity-100" 
      : "translate-x-full opacity-0";
    
    let colorStyles = "";
    switch (type) {
      case 'success':
        colorStyles = "bg-green-900/90 border-green-500/50 text-green-100";
        break;
      case 'error':
        colorStyles = "bg-red-900/90 border-red-500/50 text-red-100";
        break;
      case 'warning':
        colorStyles = "bg-yellow-900/90 border-yellow-500/50 text-yellow-100";
        break;
      case 'info':
        colorStyles = "bg-blue-900/90 border-blue-500/50 text-blue-100";
        break;
      default:
        colorStyles = "bg-gray-900/90 border-gray-500/50 text-gray-100";
    }

    return `${baseStyles} ${visibilityStyles} ${colorStyles}`;
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.73-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`
      max-w-md w-full backdrop-blur-sm border rounded-lg shadow-lg p-4 mb-3
      ${getToastStyles()}
    `}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">
            {title}
          </p>
          {message && (
            <p className="text-sm opacity-90 mt-1">
              {message}
            </p>
          )}
          {action && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={action.onClick}
                className="text-xs"
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-current hover:bg-white/10 w-6 h-6 p-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Toast Container
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastComponent 
          key={toast.id} 
          {...toast} 
          onRemove={onRemove} 
        />
      ))}
    </div>
  );
}