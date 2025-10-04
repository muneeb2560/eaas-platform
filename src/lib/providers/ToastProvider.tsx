"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast, ToastType, ToastContainer } from "@/components/ui/Toast";

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showSuccess: (title: string, message?: string, options?: Partial<Toast>) => void;
  showError: (title: string, message?: string, options?: Partial<Toast>) => void;
  showWarning: (title: string, message?: string, options?: Partial<Toast>) => void;
  showInfo: (title: string, message?: string, options?: Partial<Toast>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts(prev => {
      // Limit to 5 toasts maximum
      const newToasts = [newToast, ...prev].slice(0, 5);
      return newToasts;
    });
  }, [generateId]);

  const showSuccess = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    showToast({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    showToast({
      type: 'error',
      title,
      message,
      duration: 7000, // Errors stay longer by default
      ...options,
    });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    showToast({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    showToast({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAll,
    toasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}