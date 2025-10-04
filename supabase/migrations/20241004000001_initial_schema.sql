# EaaS Database Schema Migration
# Initial tables for experiments, evaluations, and results

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (handled by Supabase Auth)
-- No need to create explicitly, will use auth.users

-- Experiments table
CREATE TABLE public.experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT CHECK (status IN ('active', 'archived', 'deleted')) DEFAULT 'active'
);

-- Rubrics table
CREATE TABLE public.rubrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL, -- Stores the rubric criteria and weights
    is_template BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluation runs table
CREATE TABLE public.evaluation_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID REFERENCES public.experiments(id) ON DELETE CASCADE,
    rubric_id UUID REFERENCES public.rubrics(id),
    dataset_file_url TEXT NOT NULL,
    rubric_config JSONB NOT NULL, -- Snapshot of rubric at time of evaluation
    total_samples INTEGER NOT NULL DEFAULT 0,
    completed_samples INTEGER NOT NULL DEFAULT 0,
    average_score DECIMAL(5,4), -- Average score across all samples
    status TEXT CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')) DEFAULT 'queued',
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluation results table
CREATE TABLE public.evaluation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_run_id UUID REFERENCES public.evaluation_runs(id) ON DELETE CASCADE,
    sample_index INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    expected_output TEXT,
    actual_output TEXT NOT NULL,
    overall_score DECIMAL(5,4) NOT NULL,
    detailed_scores JSONB NOT NULL, -- Breakdown by criteria
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_experiments_user_id ON public.experiments(user_id);
CREATE INDEX idx_experiments_created_at ON public.experiments(created_at DESC);
CREATE INDEX idx_rubrics_user_id ON public.rubrics(user_id);
CREATE INDEX idx_rubrics_is_template ON public.rubrics(is_template);
CREATE INDEX idx_evaluation_runs_experiment_id ON public.evaluation_runs(experiment_id);
CREATE INDEX idx_evaluation_runs_status ON public.evaluation_runs(status);
CREATE INDEX idx_evaluation_runs_created_at ON public.evaluation_runs(created_at DESC);
CREATE INDEX idx_evaluation_results_run_id ON public.evaluation_results(evaluation_run_id);
CREATE INDEX idx_evaluation_results_score ON public.evaluation_results(overall_score);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER handle_experiments_updated_at
    BEFORE UPDATE ON public.experiments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_rubrics_updated_at
    BEFORE UPDATE ON public.rubrics
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();