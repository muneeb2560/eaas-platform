export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      experiments: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          status: 'active' | 'archived' | 'deleted'
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          status?: 'active' | 'archived' | 'deleted'
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          status?: 'active' | 'archived' | 'deleted'
        }
      }
      rubrics: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          criteria: Json
          is_template: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          criteria: Json
          is_template?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          criteria?: Json
          is_template?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      evaluation_runs: {
        Row: {
          id: string
          experiment_id: string
          rubric_id: string | null
          dataset_file_url: string
          rubric_config: Json
          total_samples: number
          completed_samples: number
          average_score: number | null
          status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
          error_message: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          experiment_id: string
          rubric_id?: string | null
          dataset_file_url: string
          rubric_config: Json
          total_samples?: number
          completed_samples?: number
          average_score?: number | null
          status?: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          experiment_id?: string
          rubric_id?: string | null
          dataset_file_url?: string
          rubric_config?: Json
          total_samples?: number
          completed_samples?: number
          average_score?: number | null
          status?: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
      evaluation_results: {
        Row: {
          id: string
          evaluation_run_id: string
          sample_index: number
          prompt: string
          expected_output: string | null
          actual_output: string
          overall_score: number
          detailed_scores: Json
          feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          evaluation_run_id: string
          sample_index: number
          prompt: string
          expected_output?: string | null
          actual_output: string
          overall_score: number
          detailed_scores: Json
          feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          evaluation_run_id?: string
          sample_index?: number
          prompt?: string
          expected_output?: string | null
          actual_output?: string
          overall_score?: number
          detailed_scores?: Json
          feedback?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}