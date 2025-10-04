# Row Level Security (RLS) Policies
# Ensure users can only access their own data

-- Enable RLS on all tables
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_results ENABLE ROW LEVEL SECURITY;

-- Experiments policies
CREATE POLICY "Users can view their own experiments" ON public.experiments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own experiments" ON public.experiments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiments" ON public.experiments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experiments" ON public.experiments
    FOR DELETE USING (auth.uid() = user_id);

-- Rubrics policies
CREATE POLICY "Users can view their own rubrics and templates" ON public.rubrics
    FOR SELECT USING (auth.uid() = user_id OR is_template = TRUE);

CREATE POLICY "Users can create their own rubrics" ON public.rubrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rubrics" ON public.rubrics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rubrics" ON public.rubrics
    FOR DELETE USING (auth.uid() = user_id);

-- Evaluation runs policies
CREATE POLICY "Users can view evaluation runs for their experiments" ON public.evaluation_runs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.experiments 
            WHERE experiments.id = evaluation_runs.experiment_id 
            AND experiments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create evaluation runs for their experiments" ON public.evaluation_runs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.experiments 
            WHERE experiments.id = experiment_id 
            AND experiments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update evaluation runs for their experiments" ON public.evaluation_runs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.experiments 
            WHERE experiments.id = evaluation_runs.experiment_id 
            AND experiments.user_id = auth.uid()
        )
    );

-- Evaluation results policies
CREATE POLICY "Users can view results for their evaluation runs" ON public.evaluation_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.evaluation_runs 
            JOIN public.experiments ON experiments.id = evaluation_runs.experiment_id
            WHERE evaluation_runs.id = evaluation_results.evaluation_run_id 
            AND experiments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create results for their evaluation runs" ON public.evaluation_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.evaluation_runs 
            JOIN public.experiments ON experiments.id = evaluation_runs.experiment_id
            WHERE evaluation_runs.id = evaluation_run_id 
            AND experiments.user_id = auth.uid()
        )
    );