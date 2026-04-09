"use client";

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BarChartProps {
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
  horizontal?: boolean;
}

export function BarChart({
  data,
  xKey,
  yKey,
  title,
  color = "#10b981",
  height = 300,
  showGrid = true,
  showLegend = false,
  yAxisLabel,
  xAxisLabel,
  horizontal = false
}: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  // Set explicit default layout logic that Recharts requires
  const chartLayout = horizontal ? 'vertical' : 'horizontal';

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart 
          data={data} 
          layout={chartLayout}
          margin={horizontal ? { left: 20 } : undefined}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          )}
          
          {horizontal ? (
             <XAxis 
                type="number" 
                stroke="#9ca3af" 
                fontSize={12} 
                label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : undefined} 
             />
          ) : (
             <XAxis 
                dataKey={xKey} 
                stroke="#9ca3af" 
                fontSize={12} 
                label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : undefined} 
             />
          )}
          
          {horizontal ? (
             <YAxis 
                type="category" 
                dataKey={xKey} 
                stroke="#9ca3af" 
                fontSize={12} 
                width={100} 
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} 
             />
          ) : (
             <YAxis 
                stroke="#9ca3af" 
                fontSize={12} 
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} 
             />
          )}

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
          
          <Bar
            dataKey={yKey}
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}