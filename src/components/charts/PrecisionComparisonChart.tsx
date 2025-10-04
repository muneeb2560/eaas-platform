"use client";

import React from 'react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface PrecisionComparisonChartProps {
  data: Array<{ date: string; [key: string]: string | number }>;
  selectedModels: string[];
  title?: string;
  height?: number;
}

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];

export function PrecisionComparisonChart({
  data,
  selectedModels,
  title = "Precision Comparison Over Time",
  height = 300
}: PrecisionComparisonChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">📊 {title}</h3>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          
          <XAxis 
            dataKey="date"
            stroke="#9ca3af"
            fontSize={12}
          />
          
          <YAxis 
            stroke="#9ca3af"
            fontSize={12}
            label={{ value: 'Precision (%)', angle: -90, position: 'insideLeft' }}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f9fafb'
            }}
            labelStyle={{ color: '#d1d5db' }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)}%`,
              name
            ]}
          />
          
          <Legend />
          
          {selectedModels.map((modelName, index) => (
            <Line
              key={modelName}
              type="monotone"
              dataKey={modelName}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS[index % CHART_COLORS.length], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: CHART_COLORS[index % CHART_COLORS.length], strokeWidth: 2 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}