"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricsChartProps {
  data: Array<{
    date: string;
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
  }>;
  height?: number;
  showLegend?: boolean;
}

export function MetricsChart({ data, height = 300, showLegend = true }: MetricsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="date" 
          stroke="#9CA3AF"
          fontSize={12}
        />
        <YAxis 
          stroke="#9CA3AF"
          fontSize={12}
          domain={[0, 1]}
          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '6px',
            color: '#F9FAFB'
          }}
          formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, '']}
        />
        {showLegend && (
          <Legend 
            wrapperStyle={{ color: '#9CA3AF' }}
          />
        )}
        <Line 
          type="monotone" 
          dataKey="accuracy" 
          stroke="#3B82F6" 
          strokeWidth={2}
          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
          name="Accuracy"
        />
        <Line 
          type="monotone" 
          dataKey="precision" 
          stroke="#10B981" 
          strokeWidth={2}
          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
          name="Precision"
        />
        <Line 
          type="monotone" 
          dataKey="recall" 
          stroke="#F59E0B" 
          strokeWidth={2}
          dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
          name="Recall"
        />
        <Line 
          type="monotone" 
          dataKey="f1Score" 
          stroke="#8B5CF6" 
          strokeWidth={2}
          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
          name="F1 Score"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}