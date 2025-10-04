"use client";

// Re-export the useToast hook for convenience
export { useToast } from '@/lib/providers/ToastProvider';

// Toast utility types
export interface ToastPromiseOptions<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: Error) => string);
}

// Toast promise utility - to be used with the useToast hook
export const createToastPromise = (toast: ReturnType<typeof import('@/lib/providers/ToastProvider').useToast>) => {
  return async <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: ToastPromiseOptions<T>
  ) => {
    const { showInfo, showSuccess, showError, removeToast } = toast;

    const loadingToastId = `loading-${Date.now()}`;
    
    showInfo(loading, undefined, { id: loadingToastId });

    try {
      const result = await promise;
      removeToast(loadingToastId);
      const successMessage = typeof success === 'function' ? success(result) : success;
      showSuccess('Success', successMessage);
      return result;
    } catch (err) {
      removeToast(loadingToastId);
      const errorMessage = typeof error === 'function' && err instanceof Error 
        ? error(err) 
        : typeof error === 'string' 
        ? error 
        : 'An error occurred';
      showError('Error', errorMessage);
      throw err;
    }
  };
};