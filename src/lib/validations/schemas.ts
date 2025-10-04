import { z } from 'zod';

// Auth validation schemas
export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Experiment validation schemas
export const createExperimentSchema = z.object({
  name: z
    .string()
    .min(1, 'Experiment name is required')
    .max(100, 'Experiment name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  rubric_id: z.string().uuid('Please select a valid rubric').optional(),
});

export const updateExperimentSchema = createExperimentSchema.partial();

// Rubric validation schemas
export const rubricCriterionSchema = z.object({
  name: z
    .string()
    .min(1, 'Criterion name is required')
    .max(100, 'Criterion name must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Criterion description is required')
    .max(300, 'Criterion description must be less than 300 characters'),
  weight: z
    .number()
    .min(0.1, 'Weight must be at least 0.1')
    .max(10, 'Weight must be at most 10'),
  scale_type: z.enum(['numerical', 'categorical', 'boolean']),
  scale_options: z.array(z.string()).optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
}).refine((data) => {
  if (data.scale_type === 'numerical') {
    return data.min_value !== undefined && data.max_value !== undefined;
  }
  if (data.scale_type === 'categorical') {
    return data.scale_options && data.scale_options.length > 0;
  }
  return true;
}, {
  message: 'Invalid scale configuration for the selected scale type',
});

export const createRubricSchema = z.object({
  name: z
    .string()
    .min(1, 'Rubric name is required')
    .max(100, 'Rubric name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  criteria: z
    .array(rubricCriterionSchema)
    .min(1, 'At least one criterion is required')
    .max(10, 'Maximum 10 criteria allowed'),
  is_template: z.boolean().default(false),
}).refine((data) => {
  const totalWeight = data.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  return Math.abs(totalWeight - 1) < 0.01; // Allow for small floating point errors
}, {
  message: 'The total weight of all criteria must equal 1.0',
});

export const updateRubricSchema = z.object({
  name: z
    .string()
    .min(1, 'Rubric name is required')
    .max(100, 'Rubric name must be less than 100 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  criteria: z
    .array(rubricCriterionSchema)
    .min(1, 'At least one criterion is required')
    .max(10, 'Maximum 10 criteria allowed')
    .optional(),
  is_template: z.boolean().optional(),
});

// File upload validation
export const uploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 50 * 1024 * 1024, 'File size must be less than 50MB')
    .refine(
      (file) => ['.csv', '.json', '.jsonl'].some(ext => file.name.toLowerCase().endsWith(ext)),
      'File must be CSV, JSON, or JSONL format'
    ),
});

// Search and filter schemas
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const experimentFilterSchema = z.object({
  status: z.enum(['draft', 'running', 'completed', 'failed', 'cancelled']).optional(),
  rubric_id: z.string().uuid().optional(),
  search: z.string().optional(),
  sort_by: z.enum(['name', 'created_at', 'updated_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
}).merge(paginationSchema);

export const rubricFilterSchema = z.object({
  is_template: z.boolean().optional(),
  search: z.string().optional(),
  sort_by: z.enum(['name', 'created_at', 'updated_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
}).merge(paginationSchema);

// Type exports
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type CreateExperimentFormData = z.infer<typeof createExperimentSchema>;
export type UpdateExperimentFormData = z.infer<typeof updateExperimentSchema>;
export type CreateRubricFormData = z.infer<typeof createRubricSchema>;
export type UpdateRubricFormData = z.infer<typeof updateRubricSchema>;
export type UploadFormData = z.infer<typeof uploadSchema>;
export type ExperimentFilterData = z.infer<typeof experimentFilterSchema>;
export type RubricFilterData = z.infer<typeof rubricFilterSchema>;