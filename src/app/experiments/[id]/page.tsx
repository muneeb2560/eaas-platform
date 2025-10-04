"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ExperimentDetailsPage() {
  const params = useParams();
  const experimentId = params.id as string;
  const [experiment, setExperiment] = useState<any>(null);
  const [evaluationRuns, setEvaluationRuns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setExperiment({
          id: experimentId,
          name: "Q&A Model Evaluation",
          description: "Testing question-answering accuracy",
          status: "active",
          created_at: "2024-01-01T00:00:00Z"
        });
        
        setEvaluationRuns([
          {
            id: "run-1",
            status: "completed",
            total_samples: 1000,
            completed_samples: 1000,
            average_score: 0.85,
            started_at: "2024-01-01T10:00:00Z",
            completed_at: "2024-01-01T10:30:00Z"
          },
          {
            id: "run-2", 
            status: "running",
            total_samples: 500,
            completed_samples: 250,
            average_score: 0.78,
            started_at: "2024-01-02T09:00:00Z",
            completed_at: null
          }
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [experimentId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "running": return "bg-blue-100 text-blue-800";
      case "failed": return "bg-red-100 text-red-800";
      case "queued": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading experiment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/experiments" className="hover:text-blue-400">Experiments</Link>
            <span>/</span>
            <span>{experiment?.name}</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {experiment?.name}
          </h1>
          {experiment?.description && (
            <p className="text-gray-300">{experiment.description}</p>
          )}
        </div>
        <Link href={`/experiments/${experimentId}/new-run`}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            + New Evaluation Run
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <div className="text-2xl font-bold text-blue-400">{evaluationRuns.length}</div>
          <div className="text-sm text-gray-400">Total Runs</div>
        </Card>
        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <div className="text-2xl font-bold text-green-400">
            {evaluationRuns.filter(r => r.status === "completed").length}
          </div>
          <div className="text-sm text-gray-400">Completed</div>
        </Card>
        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <div className="text-2xl font-bold text-blue-400">
            {evaluationRuns.filter(r => r.status === "running").length}
          </div>
          <div className="text-sm text-gray-400">Running</div>
        </Card>
        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <div className="text-2xl font-bold text-white">
            {evaluationRuns.length > 0 ? 
              (evaluationRuns.reduce((sum, run) => sum + (run.average_score || 0), 0) / evaluationRuns.length).toFixed(2)
              : "N/A"
            }
          </div>
          <div className="text-sm text-gray-400">Avg Score</div>
        </Card>
      </div>

      <Card className="p-6 bg-gray-800/50 border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Evaluation Runs</h2>
        {evaluationRuns.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No evaluation runs yet</h3>
            <p className="text-gray-600 mb-4">Start your first evaluation run to see results</p>
            <Link href={`/experiments/${experimentId}/new-run`}>
              <Button>Start First Run</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluationRuns.map((run) => (
              <div key={run.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">Run {run.id}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}>
                        {run.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Started: {formatDate(run.started_at)}
                      {run.completed_at && (
                        <span> • Completed: {formatDate(run.completed_at)}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {run.average_score ? (run.average_score * 100).toFixed(1) + "%" : "N/A"}
                    </div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{run.completed_samples} / {run.total_samples}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(run.completed_samples / run.total_samples) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="text-sm">
                    View Details
                  </Button>
                  <Button variant="outline" className="text-sm">
                    Download Results
                  </Button>
                  {run.status === "running" && (
                    <Button variant="outline" className="text-sm text-red-600">
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}