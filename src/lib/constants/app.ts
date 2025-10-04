// Application constants
export const APP_CONFIG = {
  name: 'EaaS Platform',
  description: 'Evaluation as a Service - AI Model Evaluation Platform',
  version: '1.0.0',
  author: 'EaaS Development Team',
  repository: 'https://github.com/your-org/eaas-platform',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    signIn: '/api/auth/signin',
    signUp: '/api/auth/signup',
    signOut: '/api/auth/signout',
    refresh: '/api/auth/refresh',
  },
  experiments: {
    list: '/api/experiments',
    create: '/api/experiments',
    get: (id: string) => `/api/experiments/${id}`,
    update: (id: string) => `/api/experiments/${id}`,
    delete: (id: string) => `/api/experiments/${id}`,
    run: (id: string) => `/api/experiments/${id}/run`,
  },
  rubrics: {
    list: '/api/rubrics',
    create: '/api/rubrics',
    get: (id: string) => `/api/rubrics/${id}`,
    update: (id: string) => `/api/rubrics/${id}`,
    delete: (id: string) => `/api/rubrics/${id}`,
    templates: '/api/rubrics/templates',
  },
  evaluations: {
    list: '/api/evaluations',
    get: (id: string) => `/api/evaluations/${id}`,
    results: (id: string) => `/api/evaluations/${id}/results`,
    cancel: (id: string) => `/api/evaluations/${id}/cancel`,
  },
  analytics: {
    overview: '/api/analytics/overview',
    trends: '/api/analytics/trends',
    comparisons: '/api/analytics/comparisons',
  },
  upload: {
    dataset: '/api/upload/dataset',
    validate: '/api/upload/validate',
  },
} as const;

// File upload constraints
export const UPLOAD_CONSTRAINTS = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['.csv', '.json', '.jsonl'],
  maxSamples: 10000,
} as const;

// Pagination defaults
export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultPage: 1,
} as const;

// UI constants
export const UI_CONSTANTS = {
  debounceDelay: 300,
  toastDuration: 5000,
  refreshInterval: 30000, // 30 seconds
  animationDuration: 300,
} as const;

// Evaluation constants
export const EVALUATION_LIMITS = {
  maxCriteria: 10,
  maxSamplesPerBatch: 1000,
  maxConcurrentEvaluations: 5,
  maxRetries: 3,
  timeoutMs: 300000, // 5 minutes
} as const;

// Status colors for UI
export const STATUS_COLORS = {
  draft: 'gray',
  running: 'blue',
  completed: 'green',
  failed: 'red',
  cancelled: 'yellow',
  queued: 'purple',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  theme: 'eaas_theme',
  sidebarCollapsed: 'eaas_sidebar_collapsed',
  tablePreferences: 'eaas_table_preferences',
  lastVisited: 'eaas_last_visited',
} as const;