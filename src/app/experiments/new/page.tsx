"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { experimentService } from "@/lib/services/experimentService";

export default function NewExperimentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error("Experiment name is required");
      }

      // Create the experiment using the service
      const newExperiment = experimentService.createExperiment({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      console.log("✅ Experiment created successfully:", newExperiment);
      
      // Show success message briefly
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to experiments list
      router.push("/experiments");
    } catch (error) {
      console.error("Error creating experiment:", error);
      setError(error instanceof Error ? error.message : "Failed to create experiment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Create New Experiment
        </h1>
        <p className="text-gray-300">
          Set up a new evaluation experiment to test your AI model performance.
        </p>
      </div>

      <Card className="p-6 bg-gray-800/50 border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Experiment Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter experiment name"
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.name.length}/100 characters
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your experiment (optional)"
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={!formData.name.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Experiment"}
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

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Next Steps</h2>
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-200 text-sm">
            After creating your experiment, you can:
          </p>
          <ul className="list-disc list-inside text-blue-300 text-sm mt-2 space-y-1">
            <li>Upload CSV datasets for evaluation</li>
            <li>Create or select custom rubrics</li>
            <li>Run automated evaluations</li>
            <li>View results and analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}