"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChart } from '@/components/charts/BarChart';
import { 
  analyticsService, 
  type TrendAnalysis
} from '@/lib/services/analyticsService';

interface ExperimentAnalytic {
  id: string;
  name: string;
  avgAccuracy: number;
  totalRuns: number;
  successRate: number;
  lastRun: Date;
  trend: 'improving' | 'declining' | 'stable';
  performance: Array<{ value: number }>;
}

export default function TrendsPage() {
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);
  const [experimentAnalytics, setExperimentAnalytics] = useState<ExperimentAnalytic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'successRate' | 'responseTime' | 'evaluationsCount'>('accuracy');

  useEffect(() => {
    const loadTrends = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const trendsData = analyticsService.getPerformanceTrends(timePeriod);
        const experimentData = analyticsService.getExperimentAnalytics();
        
        setTrends(trendsData);
        setExperimentAnalytics(experimentData);
        
        console.log('📈 Trends data loaded successfully');
      } catch (error) {
        console.error('Error loading trends:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrends();
  }, [timePeriod]);

  const getMetricTitle = (metric: string) => {
    const titles = {
      accuracy: 'Accuracy Trends',
      successRate: 'Success Rate Trends',
      responseTime: 'Response Time Trends',
      evaluationsCount: 'Evaluation Volume Trends'
    };
    return titles[metric as keyof typeof titles];
  };

  const getMetricColor = (metric: string) => {
    const colors = {
      accuracy: '#3b82f6',
      successRate: '#10b981',
      responseTime: '#f59e0b',
      evaluationsCount: '#8b5cf6'
    };
    return colors[metric as keyof typeof colors];
  };

  const getMetricUnit = (metric: string) => {
    const units = {
      accuracy: '%',
      successRate: '%',
      responseTime: 's',
      evaluationsCount: ''
    };
    return units[metric as keyof typeof units];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Performance Trends</h1>
          <p className="text-gray-300 mt-2">
            Detailed analysis of your AI model evaluation performance over time
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/analytics">
            <Button variant="outline">← Back to Analytics</Button>
          </Link>
        </div>
      </div>

      {/* Time Period & Metric Selector */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Time Period</label>
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Primary Metric</label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as typeof selectedMetric)}
            className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="accuracy">Accuracy</option>
            <option value="successRate">Success Rate</option>
            <option value="responseTime">Response Time</option>
            <option value="evaluationsCount">Evaluation Volume</option>
          </select>
        </div>
      </div>

      {/* Main Trend Chart */}
      {trends && (
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <LineChart
            data={trends.metrics[selectedMetric].map(item => ({ 
              date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
              value: item.value 
            }))}
            xKey="date"
            yKey="value"
            title={getMetricTitle(selectedMetric)}
            color={getMetricColor(selectedMetric)}
            height={400}
            yAxisLabel={`${getMetricTitle(selectedMetric).split(' ')[0]} (${getMetricUnit(selectedMetric)})`}
            showGrid={true}
          />
        </Card>
      )}

      {/* All Metrics Overview */}
      {trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <AreaChart
              data={trends.metrics.accuracy.map(item => ({ 
                date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
                accuracy: item.value 
              }))}
              xKey="date"
              yKey="accuracy"
              title="Accuracy Over Time"
              color="#3b82f6"
              height={300}
              yAxisLabel="Accuracy (%)"
            />
          </Card>
          
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <LineChart
              data={trends.metrics.responseTime.map(item => ({ 
                date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
                time: item.value 
              }))}
              xKey="date"
              yKey="time"
              title="Response Time Trends"
              color="#f59e0b"
              height={300}
              yAxisLabel="Response Time (s)"
            />
          </Card>
        </div>
      )}

      {/* Experiment-Specific Trends */}
      {experimentAnalytics.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Individual Experiment Trends</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {experimentAnalytics.slice(0, 4).map((experiment) => (
              <Card key={experiment.id} className="p-6 bg-gray-800/50 border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{experiment.name}</h3>
                    <p className="text-sm text-gray-400">
                      Avg: {experiment.avgAccuracy.toFixed(1)}% • Runs: {experiment.totalRuns}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    experiment.trend === 'improving' 
                      ? 'bg-green-500/20 text-green-400'
                      : experiment.trend === 'declining'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {experiment.trend}
                  </span>
                </div>
                
                <LineChart
                  data={experiment.performance.map((item: { value: number }, index: number) => ({ 
                    run: `Run ${index + 1}`, 
                    performance: item.value 
                  }))}
                  xKey="run"
                  yKey="performance"
                  color="#10b981"
                  height={200}
                  showGrid={false}
                />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Statistical Summary */}
      {trends && (
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Statistical Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Object.entries(trends.metrics).map(([key, data]) => {
              const values = data.map(d => d.value);
              const avg = values.reduce((a, b) => a + b, 0) / values.length;
              const max = Math.max(...values);
              const min = Math.min(...values);
              const latest = values[values.length - 1];
              const change = values.length > 1 ? ((latest - values[0]) / values[0] * 100) : 0;
              
              return (
                <div key={key} className="text-center">
                  <h4 className="text-sm font-medium text-gray-400 mb-2 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-white">
                      {avg.toFixed(1)}{getMetricUnit(key)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Range: {min.toFixed(1)} - {max.toFixed(1)}
                    </p>
                    <p className={`text-xs ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {change >= 0 ? '+' : ''}{change.toFixed(1)}% trend
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}