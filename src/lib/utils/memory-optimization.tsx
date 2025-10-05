/**
 * Memory-optimized component loader
 * Provides lazy loading utilities for reducing initial bundle size
 */

import dynamic from 'next/dynamic';
import { ComponentType, Suspense } from 'react';

// Loading component for lazy-loaded components
const LoadingSpinner = () => (
  <div className=\"flex items-center justify-center p-8\">
    <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600\"></div>
    <span className=\"ml-2 text-sm text-gray-600\">Loading...</span>
  </div>
);

// Error boundary for lazy-loaded components
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className=\"flex items-center justify-center p-8\">
    <div className=\"text-red-600\">
      <p className=\"font-medium\">Failed to load component</p>
      <p className=\"text-sm\">{error.message}</p>
    </div>
  </div>
);

// Utility function to create lazy-loaded components with error handling
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    fallback?: ComponentType;
    ssr?: boolean;
    loading?: ComponentType;
  } = {}
) {
  const {
    fallback = ErrorFallback,
    ssr = false,
    loading = LoadingSpinner
  } = options;

  const LazyComponent = dynamic(importFn, {
    ssr,
    loading: () => <LoadingComponent />,
  });

  const LoadingComponent = loading;

  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<LoadingComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Pre-configured lazy components for common use cases
export const LazyCharts = {
  BarChart: createLazyComponent(
    () => import('@/components/charts/BarChart'),
    { ssr: false }
  ),
  LineChart: createLazyComponent(
    () => import('@/components/charts/LineChart'),
    { ssr: false }
  ),
  PieChart: createLazyComponent(
    () => import('@/components/charts/PieChart'),
    { ssr: false }
  ),
  AreaChart: createLazyComponent(
    () => import('@/components/charts/AreaChart'),
    { ssr: false }
  ),
};

// Lazy load heavy UI components
export const LazyUI = {
  DataTable: createLazyComponent(
    () => import('@/components/ui/DataTable'),
    { ssr: false }
  ),
  RichTextEditor: createLazyComponent(
    () => import('@/components/ui/RichTextEditor'),
    { ssr: false }
  ),
  FileUploader: createLazyComponent(
    () => import('@/components/ui/FileUploader'),
    { ssr: false }
  ),
};

// Memory optimization utilities
export const MemoryOptimizations = {
  // Preload component when hovering over trigger
  preloadOnHover: (importFn: () => Promise<any>) => {
    return {
      onMouseEnter: () => importFn(),
      onFocus: () => importFn(),
    };
  },

  // Preload component when it's about to be visible
  preloadOnIntersection: (importFn: () => Promise<any>, rootMargin = '50px') => {
    return (element: HTMLElement | null) => {
      if (!element || typeof IntersectionObserver === 'undefined') return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              importFn();
              observer.disconnect();
            }
          });
        },
        { rootMargin }
      );

      observer.observe(element);
      return () => observer.disconnect();
    };
  },

  // Cleanup function for memory management
  cleanup: () => {
    // Force garbage collection if available (Node.js)
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  },
};