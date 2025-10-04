"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Rubric {
  id: string;
  name: string;
  description: string;
  criteria: Record<string, number>;
}

interface Experiment {
  id: string;
  name: string;
  description: string;
}

export default function NewEvaluationRunPage() {
  const router = useRouter();
  const params = useParams();
  const experimentId = params.id as string;
  
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [formData, setFormData] = useState({
    rubric_id: "",
    dataset_file: null as File | null,
    batch_size: 100
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setExperiment({
          id: experimentId,
          name: "Q&A Model Evaluation",
          description: "Testing question-answering accuracy"
        });
        
        setRubrics([
          {
            id: "1",
            name: "Q&A Accuracy Rubric",
            description: "Comprehensive rubric for evaluating question-answer pairs",
            criteria: { accuracy: 0.4, completeness: 0.3, clarity: 0.2, relevance: 0.1 }
          },
          {
            id: "2",
            name: "Text Quality Rubric", 
            description: "General text quality assessment",
            criteria: { coherence: 0.25, fluency: 0.25, creativity: 0.2 }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        alert('Please select a CSV file');
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, dataset_file: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rubric_id || !formData.dataset_file) {
      alert('Please select both a rubric and upload a dataset file');
      return;
    }
    
    setIsSubmitting(true);

    try {
      console.log("Starting evaluation run:", {
        experimentId,
        rubric_id: formData.rubric_id,
        dataset_file: formData.dataset_file.name,
        batch_size: formData.batch_size
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      router.push(`/experiments/${experimentId}`);
    } catch (error) {
      console.error("Error starting evaluation:", error);
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <span>Experiments</span>
          <span>/</span>
          <span>{experiment?.name}</span>
          <span>/</span>
          <span className="text-blue-400 font-medium">New Evaluation Run</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Start New Evaluation Run
        </h1>
        <p className="text-gray-300">
          Upload a dataset and select a rubric to begin evaluating your model.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="rubric" className="block text-sm font-medium text-gray-300 mb-2">
                  Select Evaluation Rubric *
                </label>
                <select
                  id="rubric"
                  value={formData.rubric_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, rubric_id: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a rubric...</option>
                  {rubrics.map((rubric) => (
                    <option key={rubric.id} value={rubric.id}>
                      {rubric.name}
                    </option>
                  ))}
                </select>
                {formData.rubric_id && (
                  <div className="mt-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-md">
                    <p className="text-sm text-blue-200">
                      {rubrics.find(r => r.id === formData.rubric_id)?.description}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="dataset" className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Dataset File *
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-gray-800/30">
                  <input
                    type="file"
                    id="dataset"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="dataset" className="cursor-pointer">
                    <div className="mx-auto w-12 h-12 text-gray-500 mb-4">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    {formData.dataset_file ? (
                      <div>
                        <p className="text-green-400 font-medium">{formData.dataset_file.name}</p>
                        <p className="text-sm text-gray-400">
                          {Math.round(formData.dataset_file.size / 1024)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-300">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">CSV files only, max 50MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="batch_size" className="block text-sm font-medium text-gray-300 mb-2">
                  Batch Size
                </label>
                <select
                  id="batch_size"
                  value={formData.batch_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, batch_size: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={50}>50 samples per batch</option>
                  <option value={100}>100 samples per batch</option>
                  <option value={200}>200 samples per batch</option>
                  <option value={500}>500 samples per batch</option>
                </select>
                <p className="text-sm text-gray-400 mt-1">
                  Smaller batches provide more frequent progress updates
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={!formData.rubric_id || !formData.dataset_file || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Starting Evaluation..." : "Start Evaluation Run"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-4 bg-gray-800/50 border-gray-700">
            <h3 className="font-semibold text-white mb-3">Experiment Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Name:</span>
                <p className="font-medium text-white">{experiment?.name}</p>
              </div>
              {experiment?.description && (
                <div>
                  <span className="text-gray-400">Description:</span>
                  <p className="text-gray-300">{experiment.description}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4 bg-gray-800/50 border-gray-700">
            <h3 className="font-semibold text-white mb-3">Dataset Format</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>Your CSV file should include these columns:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><code className="bg-gray-700 px-1 rounded text-gray-300">prompt</code> - The input question/prompt</li>
                <li><code className="bg-gray-700 px-1 rounded text-gray-300">expected_output</code> - Expected response (optional)</li>
                <li><code className="bg-gray-700 px-1 rounded text-gray-300">actual_output</code> - Model response</li>
              </ul>
            </div>
          </Card>

          <Card className="p-4 bg-gray-800/50 border-gray-700">
            <h3 className="font-semibold text-white mb-3">What Happens Next?</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <div className="flex items-start gap-2">
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">1</span>
                <span>Dataset uploaded and validated</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">2</span>
                <span>Evaluation processing starts</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">3</span>
                <span>Results and analytics generated</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}