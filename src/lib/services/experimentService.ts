// Experiment storage service for development mode
// In production, this would be replaced with Supabase API calls

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'completed';
  created_at: string;
  updated_at: string;
  evaluation_runs_count: number;
}

class ExperimentService {
  private storageKey = 'eaas_experiments';

  // Get all experiments from localStorage
  getExperiments(): Experiment[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        // Initialize with default experiments
        const defaultExperiments = this.getDefaultExperiments();
        this.saveExperiments(defaultExperiments);
        return defaultExperiments;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading experiments:', error);
      return this.getDefaultExperiments();
    }
  }

  // Save experiments to localStorage
  saveExperiments(experiments: Experiment[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(experiments));
    } catch (error) {
      console.error('Error saving experiments:', error);
    }
  }

  // Create a new experiment
  createExperiment(data: { name: string; description: string }): Experiment {
    const newExperiment: Experiment = {
      id: this.generateId(),
      name: data.name,
      description: data.description,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      evaluation_runs_count: 0
    };

    const experiments = this.getExperiments();
    experiments.push(newExperiment);
    this.saveExperiments(experiments);
    
    return newExperiment;
  }

  // Get a single experiment by ID
  getExperiment(id: string): Experiment | null {
    const experiments = this.getExperiments();
    return experiments.find(exp => exp.id === id) || null;
  }

  // Update an experiment
  updateExperiment(id: string, updates: Partial<Experiment>): Experiment | null {
    const experiments = this.getExperiments();
    const index = experiments.findIndex(exp => exp.id === id);
    
    if (index === -1) return null;
    
    experiments[index] = {
      ...experiments[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    this.saveExperiments(experiments);
    return experiments[index];
  }

  // Delete an experiment
  deleteExperiment(id: string): boolean {
    const experiments = this.getExperiments();
    const filtered = experiments.filter(exp => exp.id !== id);
    
    if (filtered.length === experiments.length) return false;
    
    this.saveExperiments(filtered);
    return true;
  }

  // Increment evaluation run count
  incrementRunCount(id: string): void {
    const experiment = this.getExperiment(id);
    if (experiment) {
      this.updateExperiment(id, {
        evaluation_runs_count: experiment.evaluation_runs_count + 1
      });
    }
  }

  // Generate a unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get default experiments for initial setup
  private getDefaultExperiments(): Experiment[] {
    return [
      {
        id: "exp_1",
        name: "Q&A Model Evaluation",
        description: "Testing question-answering accuracy with comprehensive rubrics",
        status: 'active',
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        evaluation_runs_count: 3
      },
      {
        id: "exp_2", 
        name: "Text Generation Quality",
        description: "Evaluating text generation coherence and creativity",
        status: 'active',
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        evaluation_runs_count: 1
      }
    ];
  }

  // Clear all experiments (for testing)
  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
  }

  // Export experiments (for backup/sharing)
  exportExperiments(): string {
    return JSON.stringify(this.getExperiments(), null, 2);
  }

  // Import experiments (for restore)
  importExperiments(json: string): boolean {
    try {
      const experiments = JSON.parse(json);
      if (Array.isArray(experiments)) {
        this.saveExperiments(experiments);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing experiments:', error);
      return false;
    }
  }
}

// Export singleton instance
export const experimentService = new ExperimentService();