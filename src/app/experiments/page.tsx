"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { experimentService, type Experiment } from "@/lib/services/experimentService";

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'stats' | 'cards' | 'complete'>('stats');

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Load experiments from service
        const loadedExperiments = experimentService.getExperiments();
        setExperiments(loadedExperiments);
        
        console.log(`📊 Loaded ${loadedExperiments.length} experiments`);
      } catch (error) {
        console.error("Error fetching experiments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiments();
  }, []);

  // Function to refresh experiments list (can be called after creating new experiment)
  const refreshExperiments = async () => {
    try {
      setIsRefreshing(true);
      setLoadingStage('stats');
      
      // Stage 1: Load banner and header (400ms)
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Stage 2: Load experiment cards (500ms)
      setLoadingStage('cards');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update data
      const updated = experimentService.getExperiments();
      setExperiments(updated);
      
      // Stage 3: Complete
      setLoadingStage('complete');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log(`🔄 Refreshed experiments - loaded ${updated.length} experiments`);
    } catch (error) {
      console.error('Error refreshing experiments:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to delete an experiment
  const handleDeleteExperiment = (id: string) => {
    if (confirm('Are you sure you want to delete this experiment?')) {
      const success = experimentService.deleteExperiment(id);
      if (success) {
        refreshExperiments();
        console.log(`🗑️ Deleted experiment: ${id}`);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading experiments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Experiments</h1>
          <p className="text-gray-300 mt-2">
            Manage your AI model evaluation experiments
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/analytics">
            <Button variant="outline">
              📊 Analytics
            </Button>
          </Link>
          <Link href="/experiments/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              + New Experiment
            </Button>
          </Link>
        </div>
      </div>

      {experiments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No experiments yet
          </h3>
          <p className="text-gray-400 mb-4">
            Create your first experiment to start evaluating AI models
          </p>
          <Link href="/experiments/new">
            <Button>Create Your First Experiment</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              Showing {experiments.length} experiment{experiments.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={refreshExperiments}
                disabled={isRefreshing}
                className="text-sm"
              >
                {isRefreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                    {loadingStage === 'stats' && 'Loading info...'}
                    {loadingStage === 'cards' && 'Loading experiments...'}
                    {loadingStage === 'complete' && 'Finalizing...'}
                  </>
                ) : (
                  '🔄 Refresh'
                )}
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {experiments.map((experiment) => (
              <Card key={experiment.id} className="p-6 hover:shadow-lg transition-shadow bg-gray-800/50 border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {experiment.name}
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                      {experiment.description || "No description provided"}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    experiment.status === 'active' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : experiment.status === 'completed'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                  }`}>
                    {experiment.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                  <span>Created: {formatDate(experiment.created_at)}</span>
                  <span>{experiment.evaluation_runs_count || 0} runs</span>
                </div>
                
                <div className="flex gap-2 mb-3">
                  <Link href={`/experiments/${experiment.id}`} className="flex-1">
                    <Button variant="outline" className="w-full text-sm">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/experiments/${experiment.id}/new-run`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
                      Run Evaluation
                    </Button>
                  </Link>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="flex-1 text-xs text-gray-400 hover:text-red-400 hover:border-red-400"
                    onClick={() => handleDeleteExperiment(experiment.id)}
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}