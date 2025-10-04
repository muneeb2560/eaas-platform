"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

interface TrendData {
  date: string;
  evaluations: number;
  accuracy: number;
  avgScore: number;
  userCount: number;
}

interface MetricTrend {
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
}

const TrendsPage: React.FC = () => {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [metricTrends, setMetricTrends] = useState<MetricTrend[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMetric, setSelectedMetric] = useState<'evaluations' | 'accuracy' | 'avgScore' | 'userCount'>('evaluations');

  // Mock data generation - replace with actual API calls
  useEffect(() => {
    const generateMockData = (): void => {
      setIsLoading(true);
      
      // Generate mock trend data
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const mockTrendData: TrendData[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        mockTrendData.push({
          date: date.toISOString().split('T')[0],
          evaluations: Math.floor(Math.random() * 100) + 50,
          accuracy: Math.random() * 100,
          avgScore: Math.random() * 100,
          userCount: Math.floor(Math.random() * 20) + 10,
        });
      }
      
      setTrendData(mockTrendData);
      
      // Generate mock metric trends
      const mockMetricTrends: MetricTrend[] = [
        {
          name: 'Total Evaluations',
          value: 1247,
          change: 12.5,
          changeType: 'increase'
        },
        {
          name: 'Average Accuracy',
          value: 87.3,
          change: -2.1,
          changeType: 'decrease'
        },
        {
          name: 'User Engagement',
          value: 94.7,
          change: 5.8,
          changeType: 'increase'
        },
        {
          name: 'Model Performance',
          value: 91.2,
          change: 0.3,
          changeType: 'neutral'
        }
      ];
      
      setMetricTrends(mockMetricTrends);
      setIsLoading(false);
    };

    generateMockData();
  }, [timeRange]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getChangeIcon = (changeType: MetricTrend['changeType']): string => {
    switch (changeType) {
      case 'increase':
        return '↗️';
      case 'decrease':
        return '↘️';
      case 'neutral':
        return '➡️';
      default:
        return '➡️';
    }
  };

  const getChangeColor = (changeType: MetricTrend['changeType']): string => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-600/50 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700/50 border border-gray-600/50 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-700/50 border border-gray-600/50 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Trends</h1>
          <p className="text-gray-300 mt-2">Track performance metrics and trends over time</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricTrends.map((metric) => (
          <div key={metric.name} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:bg-gray-700/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">{metric.name}</p>
                <p className="text-2xl font-bold text-white mt-2">{metric.value.toLocaleString()}</p>
              </div>
              <div className="text-2xl">{getChangeIcon(metric.changeType)}</div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
              </span>
              <span className="text-gray-400 text-sm ml-2">vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Metric Selector */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-white">Trend Analysis</h2>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as typeof selectedMetric)}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="evaluations">Evaluations</option>
            <option value="accuracy">Accuracy (%)</option>
            <option value="avgScore">Average Score</option>
            <option value="userCount">User Count</option>
          </select>
        </div>

        {/* Line Chart */}
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => `Date: ${formatDate(value as string)}`}
                formatter={(value: number) => [value.toFixed(1), selectedMetric]}
                contentStyle={{
                  backgroundColor: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  color: '#ffffff'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Comparison</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => `Date: ${formatDate(value as string)}`}
                  contentStyle={{
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    color: '#ffffff'
                  }}
                />
                <Bar dataKey="evaluations" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => `Date: ${formatDate(value as string)}`}
                  contentStyle={{
                    backgroundColor: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    color: '#ffffff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-medium text-blue-300 mb-2">📈 Growth Trend</h4>
            <p className="text-blue-200 text-sm">
              Evaluations have increased by 12.5% compared to the previous period, showing strong user engagement.
            </p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="font-medium text-yellow-300 mb-2">⚠️ Attention Needed</h4>
            <p className="text-yellow-200 text-sm">
              Average accuracy has decreased by 2.1%. Consider reviewing model performance and training data.
            </p>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="font-medium text-green-300 mb-2">✅ Positive Signal</h4>
            <p className="text-green-200 text-sm">
              User engagement is up 5.8%, indicating improved user experience and platform adoption.
            </p>
          </div>
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
            <h4 className="font-medium text-purple-300 mb-2">🎯 Recommendation</h4>
            <p className="text-purple-200 text-sm">
              Focus on maintaining evaluation volume growth while addressing accuracy concerns through model optimization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendsPage;