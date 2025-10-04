"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  rubricsService, 
  type RubricCriterion, 
  type RubricCategory 
} from '@/lib/services/rubricsService';

export default function NewRubricPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Q&A Accuracy' as RubricCategory,
    isTemplate: false,
    isActive: true
  });

  const [criteria, setCriteria] = useState<RubricCriterion[]>([
    {
      id: 'criterion_1',
      name: '',
      description: '',
      weight: 25,
      scale: {
        min: 1,
        max: 5,
        labels: {}
      }
    }
  ]);

  const categories: RubricCategory[] = [
    'Q&A Accuracy',
    'Text Generation',
    'Code Generation',
    'Creative Writing',
    'Reasoning',
    'Language Translation',
    'Summarization',
    'Custom'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const addCriterion = () => {
    const newCriterion: RubricCriterion = {
      id: `criterion_${criteria.length + 1}`,
      name: '',
      description: '',
      weight: 25,
      scale: {
        min: 1,
        max: 5,
        labels: {}
      }
    };
    setCriteria([...criteria, newCriterion]);
  };

  const removeCriterion = (index: number) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter((_, i) => i !== index));
    }
  };

  const updateCriterion = (index: number, updates: Partial<RubricCriterion>) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], ...updates };
    setCriteria(updated);
  };

  const updateCriterionScale = (index: number, scaleUpdates: Partial<RubricCriterion['scale']>) => {
    const updated = [...criteria];
    updated[index] = {
      ...updated[index],
      scale: { ...updated[index].scale, ...scaleUpdates }
    };
    setCriteria(updated);
  };

  const updateScaleLabel = (criterionIndex: number, scaleValue: number, label: string) => {
    const updated = [...criteria];
    const newLabels = { ...updated[criterionIndex].scale.labels };
    if (label.trim()) {
      newLabels[scaleValue] = label;
    } else {
      delete newLabels[scaleValue];
    }
    updated[criterionIndex] = {
      ...updated[criterionIndex],
      scale: { ...updated[criterionIndex].scale, labels: newLabels }
    };
    setCriteria(updated);
  };

  const getTotalWeight = () => {
    return criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Rubric name is required';
    }
    if (!formData.description.trim()) {
      return 'Rubric description is required';
    }
    if (criteria.some(c => !c.name.trim())) {
      return 'All criteria must have names';
    }
    if (criteria.some(c => !c.description.trim())) {
      return 'All criteria must have descriptions';
    }
    if (getTotalWeight() !== 100) {
      return 'Total criteria weights must equal 100%';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const validationError = validateForm();
      if (validationError) {
        throw new Error(validationError);
      }

      const newRubric = rubricsService.createRubric({
        ...formData,
        criteria
      });

      console.log('✅ Rubric created successfully:', newRubric);
      
      // Show success message briefly
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to rubrics list
      router.push('/rubrics');
    } catch (error) {
      console.error('Error creating rubric:', error);
      setError(error instanceof Error ? error.message : 'Failed to create rubric');
    } finally {
      setIsSubmitting(false);
    }
  };

  const normalizeWeights = () => {
    const totalWeight = getTotalWeight();
    if (totalWeight === 0) return;

    const normalizedCriteria = criteria.map(criterion => ({
      ...criterion,
      weight: Math.round((criterion.weight / totalWeight) * 100)
    }));

    setCriteria(normalizedCriteria);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Create New Rubric</h1>
          <p className="text-gray-300 mt-2">
            Define evaluation criteria and scoring scales for your AI model assessments
          </p>
        </div>
        
        <Link href="/rubrics">
          <Button variant="outline">← Back to Rubrics</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
          
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Rubric Name *
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
                placeholder="Enter rubric name"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the purpose and scope of this rubric"
            />
          </div>

          <div className="mt-4 flex gap-4">
            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                name="isTemplate"
                checked={formData.isTemplate}
                onChange={handleInputChange}
                className="mr-2 rounded"
              />
              Save as template (can be reused for other projects)
            </label>
            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="mr-2 rounded"
              />
              Active (ready for use)
            </label>
          </div>
        </Card>

        {/* Evaluation Criteria */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Evaluation Criteria</h2>
            <div className="flex gap-2">
              <span className={`text-sm px-2 py-1 rounded ${
                getTotalWeight() === 100 
                  ? 'bg-green-600/20 text-green-300' 
                  : 'bg-red-600/20 text-red-300'
              }`}>
                Total Weight: {getTotalWeight()}%
              </span>
              <Button 
                type="button" 
                variant="outline" 
                onClick={normalizeWeights}
                className="text-xs"
              >
                Normalize Weights
              </Button>
            </div>
          </div>

          {criteria.map((criterion, index) => (
            <div key={criterion.id} className="mb-6 p-4 border border-gray-600 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-white">Criterion {index + 1}</h3>
                {criteria.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeCriterion(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Criterion Name *
                  </label>
                  <input
                    type="text"
                    value={criterion.name}
                    onChange={(e) => updateCriterion(index, { name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Accuracy, Clarity, Relevance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Weight (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={criterion.weight}
                    onChange={(e) => updateCriterion(index, { weight: parseInt(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={criterion.description}
                  onChange={(e) => updateCriterion(index, { description: e.target.value })}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what this criterion evaluates"
                />
              </div>

              {/* Scale Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Scoring Scale
                </label>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Minimum Score</label>
                    <input
                      type="number"
                      min="0"
                      value={criterion.scale.min}
                      onChange={(e) => updateCriterionScale(index, { min: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-gray-600 bg-gray-700/50 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Maximum Score</label>
                    <input
                      type="number"
                      min="1"
                      value={criterion.scale.max}
                      onChange={(e) => updateCriterionScale(index, { max: parseInt(e.target.value) || 1 })}
                      className="w-full px-2 py-1 border border-gray-600 bg-gray-700/50 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Scale Labels */}
                <div className="mt-2">
                  <label className="block text-xs text-gray-400 mb-2">Score Labels (Optional)</label>
                  <div className="grid grid-cols-1 gap-2">
                    {Array.from({ length: criterion.scale.max - criterion.scale.min + 1 }, (_, i) => {
                      const value = criterion.scale.min + i;
                      return (
                        <div key={value} className="flex items-center gap-2">
                          <span className="w-8 text-sm text-gray-400">{value}:</span>
                          <input
                            type="text"
                            value={criterion.scale.labels?.[value] || ''}
                            onChange={(e) => updateScaleLabel(index, value, e.target.value)}
                            placeholder={`Label for score ${value}`}
                            className="flex-1 px-2 py-1 border border-gray-600 bg-gray-700/50 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addCriterion}
            className="w-full"
          >
            + Add Another Criterion
          </Button>
        </Card>

        {/* Submit Actions */}
        <div className="flex gap-4 justify-end">
          <Link href="/rubrics">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting || getTotalWeight() !== 100}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Creating...' : 'Create Rubric'}
          </Button>
        </div>
      </form>
    </div>
  );
}