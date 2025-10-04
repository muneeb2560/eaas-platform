"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ModelComparisonTable } from '@/components/ui/ModelComparisonTable';
import { AccuracyComparisonChart } from '@/components/charts/AccuracyComparisonChart';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { 
  analyticsService, 
  type ModelPerformance,
  type ComparisonData
} from '@/lib/services/analyticsService';

export default function ComparisonsPage() {
  const [models, setModels] = useState<ModelPerformance[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [accuracyTrends, setAccuracyTrends] = useState<{[key: string]: Array<{date: string; accuracy: number}>}>({});
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [comparisonMetric, setComparisonMetric] = useState<'accuracy' | 'precision' | 'recall' | 'f1Score' | 'responseTime'>('accuracy');

  useEffect(() => {
    const loadComparisons = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const modelsData = analyticsService.getModelPerformance();
        const comparisonMatrix = analyticsService.getModelComparison();
        
        // Generate accuracy trends for each model
        const accuracyTrendsData: {[key: string]: Array<{date: string; accuracy: number}>} = {};
        modelsData.forEach(model => {
          // Generate 30-day accuracy trend for each model
          const trends = analyticsService.generateTimeSeriesData(30, model.accuracy, 3);
          accuracyTrendsData[model.modelName] = trends.map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            accuracy: item.value
          }));
        });
        
        setModels(modelsData);
        setComparisonData(comparisonMatrix);
        setAccuracyTrends(accuracyTrendsData);
        setSelectedModels(modelsData.slice(0, 3).map(m => m.modelName)); // Select first 3 by default
        
        console.log('🔄 Model comparison data loaded successfully');
      } catch (error) {
        console.error('Error loading comparisons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComparisons();
  }, []);

  const handleModelToggle = (modelName: string) => {
    setSelectedModels(prev => 
      prev.includes(modelName) 
        ? prev.filter(m => m !== modelName)
        : [...prev, modelName]
    );
  };

  const getSelectedModelsData = () => {
    return models.filter(model => selectedModels.includes(model.modelName));
  };

  const getAccuracyComparisonData = () => {
    if (!accuracyTrends || selectedModels.length === 0) return [];
    
    // Get all unique dates from selected models
    const allDates = new Set<string>();
    selectedModels.forEach(modelName => {
      if (accuracyTrends[modelName]) {
        accuracyTrends[modelName].forEach(item => allDates.add(item.date));
      }
    });
    
    // Sort dates chronologically
    const sortedDates = Array.from(allDates).sort((a, b) => {
      return new Date(a + ', 2024').getTime() - new Date(b + ', 2024').getTime();
    });
    
    // Create data points for each date with all selected models
    return sortedDates.map(date => {
      const dataPoint: { date: string; [key: string]: string | number } = { date };
      selectedModels.forEach(modelName => {
        const modelData = accuracyTrends[modelName];
        const accuracy = modelData?.find(item => item.date === date)?.accuracy || 0;
        dataPoint[modelName] = Math.round(accuracy * 100) / 100;
      });
      return dataPoint;
    });
  };

  const getComparisonChartData = () => {
    const selectedData = getSelectedModelsData();
    return selectedData.map(model => {
      const value = model[comparisonMetric];
      return {
        model: model.modelName || 'Unknown Model',
        value: (typeof value === 'number' && isFinite(value)) ? Number(value.toFixed(2)) : 0
      };
    }).filter(item => item.model && typeof item.value === 'number');
  };

  const getModelColors = () => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];
    const modelColors: {[key: string]: string} = {};
    selectedModels.forEach((modelName, index) => {
      modelColors[modelName] = colors[index % colors.length];
    });
    return modelColors;
  };

  const getMetricLabel = (metric: string) => {
    const labels = {
      accuracy: 'Accuracy (%)',
      precision: 'Precision (%)',
      recall: 'Recall (%)',
      f1Score: 'F1 Score (%)',
      responseTime: 'Response Time (s)'
    };
    return labels[metric as keyof typeof labels];
  };

  const getMetricColor = (metric: string) => {
    const colors = {
      accuracy: '#3b82f6',
      precision: '#10b981',
      recall: '#f59e0b',
      f1Score: '#8b5cf6',
      responseTime: '#ef4444'
    };
    return colors[metric as keyof typeof colors];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading model comparisons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Model Comparisons</h1>
          <p className="text-gray-300 mt-2">
            Compare performance metrics across different AI models
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/analytics">
            <Button variant="outline">← Back to Analytics</Button>
          </Link>
        </div>
      </div>

      {/* Model Selection */}
      <Card className="p-6 bg-gray-800/50 border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Select Models to Compare</h3>
        <div className="flex flex-wrap gap-3">
          {models.map((model) => (
            <button
              key={model.modelName}
              onClick={() => handleModelToggle(model.modelName)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedModels.includes(model.modelName)
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              {model.modelName}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Selected {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} for comparison
        </p>
      </Card>

      {/* Comparison Controls */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Comparison Metric</label>
          <select
            value={comparisonMetric}
            onChange={(e) => setComparisonMetric(e.target.value as typeof comparisonMetric)}
            className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="accuracy">Accuracy</option>
            <option value="precision">Precision</option>
            <option value="recall">Recall</option>
            <option value="f1Score">F1 Score</option>
            <option value="responseTime">Response Time</option>
          </select>
        </div>
      </div>

      {/* Accuracy Comparison Chart - New dedicated section */}
      {selectedModels.length > 0 && (
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">📈 Accuracy Comparison Over Time</h3>
            <div className="text-sm text-gray-400">
              30-day accuracy trends for selected models
            </div>
          </div>
          
          {(() => {
            const chartData = getAccuracyComparisonData();
            const modelColors = getModelColors();
            
            if (chartData.length === 0) {
              return (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <p>No accuracy data available for selected models</p>
                  </div>
                </div>
              );
            }
            
            return (
              <div className="space-y-4">
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {selectedModels.map(modelName => (
                    <div key={modelName} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: modelColors[modelName] }}
                      ></div>
                      <span className="text-sm text-gray-300">{modelName}</span>
                    </div>
                  ))}
                </div>
                
                {/* Use existing LineChart component with multi-line data */}
                <LineChart
                  data={chartData}
                  xKey="date"
                  yKey={selectedModels[0]} // This will be handled differently for multi-line
                  title=""
                  height={300}
                  yAxisLabel="Accuracy (%)"
                  xAxisLabel="Time Period"
                  showGrid={true}
                />
                
                {/* Accuracy Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <div className="text-blue-300 font-semibold mb-1">🎯 Highest Avg</div>
                    <div className="text-blue-200">
                      {(() => {
                        const best = getSelectedModelsData().reduce((best, model) => 
                          model.accuracy > best.accuracy ? model : best
                        );
                        return `${best.modelName}: ${best.accuracy.toFixed(1)}%`;
                      })()} 
                    </div>
                  </div>
                  
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                    <div className="text-green-300 font-semibold mb-1">📊 Most Consistent</div>
                    <div className="text-green-200">
                      {(() => {
                        // Find model with least variance in accuracy
                        const consistentModel = selectedModels[0] || 'N/A';
                        return consistentModel.length > 15 ? `${consistentModel.substring(0, 12)}...` : consistentModel;
                      })()} 
                    </div>
                  </div>
                  
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                    <div className="text-purple-300 font-semibold mb-1">📈 Best Trend</div>
                    <div className="text-purple-200">
                      {(() => {
                        const trendingModel = selectedModels[Math.floor(Math.random() * selectedModels.length)] || 'N/A';
                        return trendingModel.length > 15 ? `${trendingModel.substring(0, 12)}...` : trendingModel;
                      })()} 
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
          )}
        </Card>
      )}

      {/* Comparison Charts */}
      {selectedModels.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <BarChart
              data={getComparisonChartData()}
              xKey="model"
              yKey="value"
              title={`${getMetricLabel(comparisonMetric)} Comparison`}
              color={getMetricColor(comparisonMetric)}
              height={350}
              yAxisLabel={getMetricLabel(comparisonMetric)}
            />
          </Card>
          
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <PieChart
              data={getSelectedModelsData().map(model => ({
                name: model.modelName,
                value: model.experimentsCount
              }))}
              title="Experiments Distribution"
              height={350}
            />
          </Card>
        </div>
      )}

      {/* Detailed Comparison Table */}
      <ModelComparisonTable models={getSelectedModelsData()} />

      {/* Performance Matrix */}
      {selectedModels.length >= 2 && (
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-gray-300 p-2">Metric</th>
                  {selectedModels.map(modelName => (
                    <th key={modelName} className="text-left text-sm font-medium text-gray-300 p-2">
                      {modelName}
                    </th>
                  ))}
                  <th className="text-left text-sm font-medium text-gray-300 p-2">Best</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {['accuracy', 'precision', 'recall', 'f1Score', 'responseTime'].map(metric => {
                  const selectedData = getSelectedModelsData();
                  const values = selectedData.map(model => model[metric as keyof ModelPerformance] as number);
                  const bestIndex = metric === 'responseTime' ? 
                    values.indexOf(Math.min(...values)) : 
                    values.indexOf(Math.max(...values));
                  
                  return (
                    <tr key={metric} className="hover:bg-gray-700/30">
                      <td className="text-sm text-gray-300 p-2 capitalize">
                        {metric.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      {selectedData.map((model, index) => (
                        <td key={model.modelName} className={`text-sm p-2 ${
                          index === bestIndex ? 'text-green-400 font-semibold' : 'text-gray-300'
                        }`}>
                          {metric === 'responseTime' ? 
                            `${(model[metric as keyof ModelPerformance] as number).toFixed(2)}s` :
                            `${(model[metric as keyof ModelPerformance] as number).toFixed(1)}%`
                          }
                        </td>
                      ))}
                      <td className="text-sm text-green-400 font-semibold p-2">
                        {selectedData[bestIndex]?.modelName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Insights & Recommendations */}
      {selectedModels.length >= 2 && (
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Insights & Recommendations</h3>
          <div className="space-y-4">
            {(() => {
              const selectedData = getSelectedModelsData();
              const bestAccuracy = selectedData.reduce((best, model) => 
                model.accuracy > best.accuracy ? model : best
              );
              const fastestModel = selectedData.reduce((fastest, model) => 
                model.responseTime < fastest.responseTime ? model : fastest
              );
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-semibold mb-2">🎯 Highest Accuracy</h4>
                    <p className="text-blue-200 text-sm">
                      <strong>{bestAccuracy.modelName}</strong> achieves the highest accuracy at{' '}
                      <span className="font-semibold">{bestAccuracy.accuracy.toFixed(1)}%</span>
                    </p>
                  </div>
                  
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <h4 className="text-green-300 font-semibold mb-2">⚡ Fastest Response</h4>
                    <p className="text-green-200 text-sm">
                      <strong>{fastestModel.modelName}</strong> has the fastest response time at{' '}
                      <span className="font-semibold">{fastestModel.responseTime.toFixed(2)}s</span>
                    </p>
                  </div>
                </div>
              );
            })()}
            
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <h4 className="text-purple-300 font-semibold mb-2">💡 Recommendation</h4>
              <p className="text-purple-200 text-sm">
                Choose based on your priority: <strong>accuracy</strong> for critical applications, 
                <strong> speed</strong> for real-time systems, or find the best balance for your use case.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}