"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MetricCard } from '@/components/ui/MetricCard';
import { ModelComparisonTable } from '@/components/ui/ModelComparisonTable';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { AreaChart } from '@/components/charts/AreaChart';
import { PieChart } from '@/components/charts/PieChart';
import { 
  analyticsService, 
  type AnalyticsMetric, 
  type ModelPerformance,
  type TrendAnalysis
} from '@/lib/services/analyticsService';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);
  const [models, setModels] = useState<ModelPerformance[]>([]);
  const [categoryData, setCategoryData] = useState<Array<{ category: string; score: number; count: number; change: number }>>([]);
  const [usageData, setUsageData] = useState<Array<{ hour: number; usage: number; label?: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'metrics' | 'charts' | 'tables' | 'complete'>('metrics');
  const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const metricsData = analyticsService.getOverallMetrics();
        const trendsData = analyticsService.getPerformanceTrends(timePeriod);
        const modelsData = analyticsService.getModelPerformance();
        const categoryPerformance = analyticsService.getCategoryPerformance();
        const usagePatterns = analyticsService.getUsagePatterns();
        
        setMetrics(metricsData);
        setTrends(trendsData);
        setModels(modelsData);
        setCategoryData(categoryPerformance);
        setUsageData(usagePatterns.hourly);
        
        console.log('📊 Analytics data loaded successfully');
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [timePeriod]);

  const handleExportData = () => {
    const data = analyticsService.exportAnalytics('json');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setLoadingStage('metrics');
      
      // Stage 1: Load metrics (500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
      const metricsData = analyticsService.getOverallMetrics();
      setMetrics(metricsData);
      
      // Stage 2: Load charts (600ms)
      setLoadingStage('charts');
      await new Promise(resolve => setTimeout(resolve, 600));
      const trendsData = analyticsService.getPerformanceTrends(timePeriod);
      const categoryPerformance = analyticsService.getCategoryPerformance();
      const usagePatterns = analyticsService.getUsagePatterns();
      setTrends(trendsData);
      setCategoryData(categoryPerformance);
      setUsageData(usagePatterns.hourly);
      
      // Stage 3: Load tables (400ms)
      setLoadingStage('tables');
      await new Promise(resolve => setTimeout(resolve, 400));
      const modelsData = analyticsService.getModelPerformance();
      setModels(modelsData);
      
      // Stage 4: Complete
      setLoadingStage('complete');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('🔄 Analytics refreshed successfully');
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics & Trends</h1>
          <p className="text-gray-300 mt-2">
            Comprehensive dashboards with performance trends and model comparisons
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timePeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          
          <Button variant="outline" onClick={handleExportData}>
            📊 Export Data
          </Button>
          
          <Link href="/analytics/trends">
            <Button>View Detailed Trends</Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Key Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      {/* Performance Trends */}
      {trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <LineChart
              data={trends.metrics.accuracy.map(item => ({ 
                date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
                accuracy: item.value 
              }))}
              xKey="date"
              yKey="accuracy"
              title="Accuracy Trends"
              color="#3b82f6"
              height={250}
              yAxisLabel="Accuracy (%)"
            />
          </Card>
          
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <AreaChart
              data={trends.metrics.evaluationsCount.map(item => ({ 
                date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
                count: item.value 
              }))}
              xKey="date"
              yKey="count"
              title="Daily Evaluations"
              color="#10b981"
              height={250}
              yAxisLabel="Evaluations"
            />
          </Card>
        </div>
      )}

      {/* Category Performance & Usage Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <BarChart
            data={categoryData.map(item => ({ 
              category: item.category, 
              score: item.score 
            }))}
            xKey="category"
            yKey="score"
            title="Performance by Category"
            color="#8b5cf6"
            height={300}
            yAxisLabel="Score (%)"
          />
        </Card>
        
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <PieChart
            data={models.slice(0, 5).map(model => ({
              name: model.modelName,
              value: model.experimentsCount
            }))}
            title="Experiments by Model"
            height={300}
          />
        </Card>
      </div>

      {/* Usage Patterns */}
      <Card className="p-6 bg-gray-800/50 border-gray-700">
        <LineChart
          data={usageData.map(item => ({ 
            hour: item.label || `${item.hour}:00`, 
            usage: item.usage 
          }))}
          xKey="hour"
          yKey="usage"
          title="Hourly Usage Patterns"
          color="#f59e0b"
          height={250}
          yAxisLabel="Usage Count"
          xAxisLabel="Hour of Day"
        />
      </Card>

      {/* Model Comparison Table */}
      <ModelComparisonTable models={models} />

      {/* Quick Actions */}
      <Card className="p-6 bg-gray-800/50 border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/analytics/trends">
            <Button variant="outline" className="w-full">
              📈 Detailed Trends
            </Button>
          </Link>
          
          <Link href="/analytics/comparisons">
            <Button variant="outline" className="w-full">
              🔄 Model Comparisons
            </Button>
          </Link>
          
          <Link href="/experiments">
            <Button variant="outline" className="w-full">
              🧪 View Experiments
            </Button>
          </Link>
          
          <Button variant="outline" onClick={handleExportData} className="w-full">
            💾 Export Analytics
          </Button>
        </div>
      </Card>
    </div>
  );
}