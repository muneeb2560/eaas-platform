"use client";

import { type ModelPerformance } from '@/lib/services/analyticsService';

interface ModelComparisonTableProps {
  models: ModelPerformance[];
  className?: string;
}

export function ModelComparisonTable({ models, className = "" }: ModelComparisonTableProps) {
  const formatScore = (score: number) => score.toFixed(1);
  const formatTime = (time: number) => `${time.toFixed(2)}s`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getTimeColor = (time: number) => {
    if (time <= 1.0) return 'text-green-400';
    if (time <= 2.0) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={`bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Model Performance Comparison</h3>
        <p className="text-sm text-gray-400 mt-1">
          Compare performance metrics across different AI models
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Accuracy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Precision
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Recall
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                F1 Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Response Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Experiments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Last Evaluated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {models.map((model, index) => (
              <tr key={model.modelName} className="hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mr-3"></div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {model.modelName}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getScoreColor(model.accuracy)}`}>
                    {formatScore(model.accuracy)}%
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm ${getScoreColor(model.precision)}`}>
                    {formatScore(model.precision)}%
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm ${getScoreColor(model.recall)}`}>
                    {formatScore(model.recall)}%
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm ${getScoreColor(model.f1Score)}`}>
                    {formatScore(model.f1Score)}%
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getTimeColor(model.responseTime)}`}>
                    {formatTime(model.responseTime)}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-300">
                    {model.experimentsCount}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-400">
                    {formatDate(model.lastEvaluated)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {models.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No model performance data available</p>
        </div>
      )}
    </div>
  );
}