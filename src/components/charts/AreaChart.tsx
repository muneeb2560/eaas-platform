"use client";

import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AreaChartProps {
  data: Array<{
    [key: string]: string | number;
  }>;
  xKey: string;
  yKey: string;
  title?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  yAxisLabel?: string;
  xAxisLabel?: string;
  fillOpacity?: number;
}

export function AreaChart({
  data,
  xKey,
  yKey,
  title,
  color = "#8b5cf6",
  height = 300,
  showGrid = true,
  showLegend = false,
  yAxisLabel,
  xAxisLabel,
  fillOpacity = 0.3
}: AreaChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          )}
          
          <XAxis 
            dataKey={xKey}
            stroke="#9ca3af"
            fontSize={12}
            label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : undefined}
          />
          
          <YAxis 
            stroke="#9ca3af"
            fontSize={12}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f9fafb'
            }}
            labelStyle={{ color: '#d1d5db' }}
          />
          
          {showLegend && <Legend />}
          
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            fill={color}
            fillOpacity={fillOpacity}
            strokeWidth={2}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}