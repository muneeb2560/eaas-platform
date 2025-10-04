"use client";

import { type AnalyticsMetric } from '@/lib/services/analyticsService';

interface MetricCardProps {
  metric: AnalyticsMetric;
  className?: string;
}

export function MetricCard({ metric, className = "" }: MetricCardProps) {
  const formatValue = (value: number, unit?: string) => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    if (unit === 's') {
      return `${value.toFixed(2)}s`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', change: number) => {
    if (trend === 'stable') return 'text-gray-400';
    
    // For most metrics, up is good. But for response time, down is good.
    const isResponseTime = metric.unit === 's';
    const isPositive = isResponseTime ? change < 0 : change > 0;
    
    return isPositive ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className={`bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">
            {metric.name}
          </p>
          <p className="text-3xl font-bold text-white">
            {formatValue(metric.value, metric.unit)}
          </p>
        </div>
        
        <div className="text-2xl">
          {getTrendIcon(metric.trend)}
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium ${getTrendColor(metric.trend, metric.change)}`}>
          {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
        </span>
        <span className="text-sm text-gray-500 ml-2">
          vs last period
        </span>
      </div>
    </div>
  );
}