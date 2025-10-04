// Core application types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Experiment {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'running' | 'completed' | 'failed' | 'cancelled';
  rubric_id?: string;
  dataset_url?: string;
  results?: ExperimentResults;
  created_at: string;
  updated_at: string;
}

export interface ExperimentResults {
  overall_score: number;
  total_samples: number;
  completed_samples: number;
  detailed_scores: Record<string, number>;
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
    response_time?: number;
  };
}

export interface Rubric {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  criteria: RubricCriterion[];
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  scale_type: 'numerical' | 'categorical' | 'boolean';
  scale_options?: string[];
  min_value?: number;
  max_value?: number;
}

export interface EvaluationRun {
  id: string;
  experiment_id: string;
  rubric_id?: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  total_samples: number;
  completed_samples: number;
  average_score?: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface EvaluationResult {
  id: string;
  evaluation_run_id: string;
  sample_index: number;
  input_data: Record<string, unknown>;
  expected_output?: string;
  actual_output: string;
  overall_score: number;
  criterion_scores: Record<string, number>;
  feedback?: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form types
export interface CreateExperimentForm {
  name: string;
  description?: string;
  rubric_id?: string;
  dataset_file?: File;
}

export interface CreateRubricForm {
  name: string;
  description?: string;
  criteria: Omit<RubricCriterion, 'id'>[];
  is_template?: boolean;
}

// Chart and analytics types
export interface ModelPerformance {
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  responseTime: number;
  experimentsCount: number;
}

export interface ComparisonData {
  models: string[];
  metrics: Record<string, number[]>;
  timeRange: string;
}

export interface TrendData {
  date: string;
  value: number;
  model?: string;
}

// UI Component types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Constants
export const EXPERIMENT_STATUS = {
  DRAFT: 'draft',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const EVALUATION_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type ExperimentStatus = typeof EXPERIMENT_STATUS[keyof typeof EXPERIMENT_STATUS];
export type EvaluationStatus = typeof EVALUATION_STATUS[keyof typeof EVALUATION_STATUS];