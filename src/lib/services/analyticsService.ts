import { experimentService } from './experimentService';

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
  unit?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface ModelPerformance {
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  responseTime: number;
  experimentsCount: number;
  lastEvaluated: string;
}

export interface TrendAnalysis {
  period: string;
  metrics: {
    accuracy: TimeSeriesData[];
    successRate: TimeSeriesData[];
    responseTime: TimeSeriesData[];
    evaluationsCount: TimeSeriesData[];
  };
}

export interface ComparisonData {
  models: ModelPerformance[];
  categories: string[];
  comparisonMatrix: number[][];
}

class AnalyticsService {
  // Generate mock time series data
  generateTimeSeriesData(days: number = 30, baseValue: number = 85, variance: number = 10): TimeSeriesData[] {
    const data: TimeSeriesData[] = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate realistic trending data with some randomness
      const trend = Math.sin((days - i) / days * Math.PI) * 5; // Slight upward trend
      const random = (Math.random() - 0.5) * variance;
      const value = Math.max(0, Math.min(100, baseValue + trend + random));
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100
      });
    }
    
    return data;
  }

  // Get overall analytics metrics
  getOverallMetrics(): AnalyticsMetric[] {
    const experiments = experimentService.getExperiments();
    const experimentCount = experiments.length;
    
    return [
      {
        id: 'total-experiments',
        name: 'Total Experiments',
        value: experimentCount,
        change: experimentCount > 0 ? 15.2 : 0,
        trend: 'up'
      },
      {
        id: 'avg-accuracy',
        name: 'Average Accuracy',
        value: 87.3,
        change: 2.1,
        trend: 'up',
        unit: '%'
      },
      {
        id: 'success-rate',
        name: 'Success Rate',
        value: 94.8,
        change: -0.8,
        trend: 'down',
        unit: '%'
      },
      {
        id: 'total-evaluations',
        name: 'Total Evaluations',
        value: experiments.reduce((sum, exp) => sum + exp.evaluation_runs_count, 0) + 127,
        change: 8.7,
        trend: 'up'
      },
      {
        id: 'avg-response-time',
        name: 'Avg Response Time',
        value: 1.4,
        change: -12.3,
        trend: 'up',
        unit: 's'
      },
      {
        id: 'models-evaluated',
        name: 'Models Evaluated',
        value: Math.max(3, experimentCount),
        change: 0,
        trend: 'stable'
      }
    ];
  }

  // Generate performance trends
  getPerformanceTrends(period: '7d' | '30d' | '90d' = '30d'): TrendAnalysis {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    
    return {
      period,
      metrics: {
        accuracy: this.generateTimeSeriesData(days, 87, 8),
        successRate: this.generateTimeSeriesData(days, 95, 5),
        responseTime: this.generateTimeSeriesData(days, 1.4, 0.3),
        evaluationsCount: this.generateTimeSeriesData(days, 12, 6)
      }
    };
  }

  // Generate model performance data
  getModelPerformance(): ModelPerformance[] {
    const experiments = experimentService.getExperiments();
    const baseModels = [
      'GPT-4 Turbo',
      'Claude 3.5 Sonnet',
      'Gemini Pro',
      'LLaMA 2 70B',
      'Mixtral 8x7B'
    ];

    return baseModels.slice(0, Math.max(3, experiments.length)).map((modelName, index) => ({
      modelName,
      accuracy: 85 + Math.random() * 10 + index * 2,
      precision: 82 + Math.random() * 12 + index * 1.5,
      recall: 88 + Math.random() * 8 + index * 1,
      f1Score: 85 + Math.random() * 10 + index * 1.8,
      responseTime: 1.2 + Math.random() * 0.8 - index * 0.1,
      experimentsCount: Math.floor(Math.random() * 10) + experiments.length,
      lastEvaluated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  // Generate comparison data for models
  getModelComparison(): ComparisonData {
    const models = this.getModelPerformance();
    const categories = ['Accuracy', 'Speed', 'Consistency', 'Cost Efficiency', 'Reliability'];
    
    const comparisonMatrix = models.map(() =>
      categories.map(() => Math.round((60 + Math.random() * 35) * 100) / 100)
    );

    return {
      models,
      categories,
      comparisonMatrix
    };
  }

  // Get category-wise performance breakdown
  getCategoryPerformance() {
    return [
      { category: 'Question Answering', score: 89.2, count: 45, change: 2.1 },
      { category: 'Text Generation', score: 86.7, count: 32, change: -1.4 },
      { category: 'Code Generation', score: 91.3, count: 28, change: 5.2 },
      { category: 'Reasoning', score: 83.1, count: 19, change: 1.8 },
      { category: 'Creative Writing', score: 87.9, count: 15, change: -0.3 }
    ];
  }

  // Get usage patterns over time
  getUsagePatterns() {
    return {
      hourly: this.generateHourlyUsage(),
      daily: this.generateTimeSeriesData(7, 25, 8),
      weekly: this.generateTimeSeriesData(12, 150, 30)
    };
  }

  private generateHourlyUsage() {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      // Simulate business hours peak
      let baseUsage = 5;
      if (i >= 8 && i <= 18) {
        baseUsage = 15 + Math.sin((i - 8) / 10 * Math.PI) * 10;
      }
      
      hours.push({
        hour: i,
        usage: Math.max(0, baseUsage + (Math.random() - 0.5) * 8),
        label: `${i.toString().padStart(2, '0')}:00`
      });
    }
    return hours;
  }

  // Get detailed experiment analytics
  getExperimentAnalytics() {
    const experiments = experimentService.getExperiments();
    
    return experiments.map(exp => ({
      id: exp.id,
      name: exp.name,
      avgAccuracy: 85 + Math.random() * 10,
      totalRuns: exp.evaluation_runs_count,
      successRate: 90 + Math.random() * 8,
      lastRun: new Date(exp.updated_at),
      trend: Math.random() > 0.5 ? 'improving' : 'stable' as 'improving' | 'declining' | 'stable',
      performance: this.generateTimeSeriesData(7, 87, 5)
    }));
  }

  // Export analytics data
  exportAnalytics(format: 'json' | 'csv' = 'json') {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.getOverallMetrics(),
      trends: this.getPerformanceTrends(),
      models: this.getModelPerformance(),
      experiments: this.getExperimentAnalytics()
    };

    if (format === 'csv') {
      // Convert to CSV format
      return this.convertToCSV(data);
    }

    return JSON.stringify(data, null, 2);
  }

  private convertToCSV(data: { metrics: AnalyticsMetric[] }): string {
    // Simple CSV conversion for metrics
    const headers = ['Metric', 'Value', 'Change', 'Trend'];
    const rows = data.metrics.map((m: AnalyticsMetric) => 
      [m.name, m.value, m.change, m.trend].join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  }
}

export const analyticsService = new AnalyticsService();