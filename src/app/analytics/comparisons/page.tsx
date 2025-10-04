"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ModelComparisonTable } from '@/components/ui/ModelComparisonTable';
import { AccuracyComparisonChart } from '@/components/charts/AccuracyComparisonChart';
import { PrecisionComparisonChart } from '@/components/charts/PrecisionComparisonChart';
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
  const [precisionTrends, setPrecisionTrends] = useState<{[key: string]: Array<{date: string; precision: number}>}>({});
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'models' | 'charts' | 'tables' | 'complete'>('models');

  useEffect(() => {
    const loadComparisons = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const modelsData = analyticsService.getModelPerformance();
        const comparisonMatrix = analyticsService.getModelComparison();
        
        // Generate accuracy trends for each model
        const accuracyTrendsData: {[key: string]: Array<{date: string; accuracy: number}>} = {};
        const precisionTrendsData: {[key: string]: Array<{date: string; precision: number}>} = {};
        modelsData.forEach(model => {
          // Generate 30-day accuracy trend for each model
          const accuracyTrendData = analyticsService.generateTimeSeriesData(30, model.accuracy, 3);
          accuracyTrendsData[model.modelName] = accuracyTrendData.map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            accuracy: item.value
          }));
          
          // Generate 30-day precision trend for each model
          const precisionTrendData = analyticsService.generateTimeSeriesData(30, model.precision, 3);
          precisionTrendsData[model.modelName] = precisionTrendData.map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            precision: item.value
          }));
        });
        
        setModels(modelsData);
        setComparisonData(comparisonMatrix);
        setAccuracyTrends(accuracyTrendsData);
        setPrecisionTrends(precisionTrendsData);
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

  const getPrecisionComparisonData = () => {
    if (!precisionTrends || selectedModels.length === 0) return [];
    
    // Get all unique dates from selected models
    const allDates = new Set<string>();
    selectedModels.forEach(modelName => {
      if (precisionTrends[modelName]) {
        precisionTrends[modelName].forEach(item => allDates.add(item.date));
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
        const modelData = precisionTrends[modelName];
        const precision = modelData?.find(item => item.date === date)?.precision || 0;
        dataPoint[modelName] = Math.round(precision * 100) / 100;
      });
      return dataPoint;
    });
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
    <div className="p-6 space-y-8 max-w-full overflow-x-hidden">
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
      <Card className={`p-6 bg-gray-800/50 border-gray-700 transition-all duration-700 ${
        isRefreshing && loadingStage === 'models' 
          ? 'opacity-50 scale-95' 
          : 'opacity-100 scale-100'
      }`}>
        {isRefreshing && loadingStage === 'models' ? (
          // Loading skeleton for model selection
          <div className="animate-pulse">
            <div className="h-6 bg-gray-600/50 rounded mb-4 w-48"></div>
            <div className="flex flex-wrap gap-3 mb-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={`model-skeleton-${index}`} className="h-10 bg-gray-600/50 rounded-lg w-32"></div>
              ))}
            </div>
            <div className="h-4 bg-gray-600/30 rounded w-64"></div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </Card>

      {/* Accuracy Comparison Chart - NEW DEDICATED SECTION */}
      {selectedModels.length > 0 && (
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              📈 Accuracy Comparison Over Time
              <span className="text-sm font-normal text-gray-400">
                - 30-day accuracy trends
              </span>
            </h3>
          </div>
          
          <AccuracyComparisonChart
            data={getAccuracyComparisonData()}
            selectedModels={selectedModels}
            height={350}
          />
          
          {/* Accuracy Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <div className="text-blue-300 font-semibold mb-1">🎯 Highest Accuracy</div>
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
                {selectedModels[0] || 'N/A'}
              </div>
            </div>
            
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
              <div className="text-purple-300 font-semibold mb-1">📈 Best Trend</div>
              <div className="text-purple-200">
                Improving trend detected
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Precision Comparison Chart - NEW DEDICATED SECTION */}
      {selectedModels.length > 0 && (
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              📊 Precision Comparison Over Time
              <span className="text-sm font-normal text-gray-400">
                - 30-day precision trends
              </span>
            </h3>
          </div>
          
          <PrecisionComparisonChart
            data={getPrecisionComparisonData()}
            selectedModels={selectedModels}
            height={350}
          />
          
          {/* Precision Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
              <div className="text-green-300 font-semibold mb-1">🎯 Highest Precision</div>
              <div className="text-green-200">
                {(() => {
                  const best = getSelectedModelsData().reduce((best, model) => 
                    model.precision > best.precision ? model : best
                  );
                  return `${best.modelName}: ${best.precision.toFixed(1)}%`;
                })()} 
              </div>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <div className="text-blue-300 font-semibold mb-1">📊 Most Reliable</div>
              <div className="text-blue-200">
                {selectedModels[0] || 'N/A'}
              </div>
            </div>
            
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
              <div className="text-purple-300 font-semibold mb-1">📈 Best Trend</div>
              <div className="text-purple-200">
                Stable performance
              </div>
            </div>
          </div>
        </Card>
      )}



      {/* Comparison Charts */}
      {selectedModels.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
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