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
  // Validate input data
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  // Validate keys exist in data
  const hasValidKeys = data.some(item => 
    item.hasOwnProperty(xKey) && item.hasOwnProperty(yKey)
  );
  
  if (!hasValidKeys) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-gray-400">Invalid data structure</p>
      </div>
    );
  }
  // Sanitize data to prevent NaN values and ensure proper data types
  const sanitizedData = data.map(item => {
    const sanitizedItem = { ...item };
    // Check all values and sanitize them
    Object.keys(sanitizedItem).forEach(key => {
      const value = sanitizedItem[key];
      if (typeof value === 'number') {
        // Replace NaN, Infinity, or undefined numbers with 0
        if (isNaN(value) || !isFinite(value)) {
          sanitizedItem[key] = 0;
        }
      } else if (typeof value === 'string') {
        // Ensure string values are not 'NaN', 'undefined', or 'null'
        if (value === 'NaN' || value === 'undefined' || value === 'null' || value === '') {
          sanitizedItem[key] = '0';
        }
      } else if (value === null || value === undefined) {
        // Handle null/undefined values
        sanitizedItem[key] = 0;
      }
    });
    return sanitizedItem;
  });
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart 
          data={sanitizedData} 
          layout={horizontal ? 'horizontal' : 'vertical'}
          margin={horizontal ? { left: 20 } : undefined}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          )}
          
          <XAxis 
            type={horizontal ? 'number' : 'category'}
            dataKey={horizontal ? undefined : xKey}
            stroke="#9ca3af"
            fontSize={12}
            label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : undefined}
            domain={horizontal ? ['dataMin', 'dataMax'] : undefined}
          />
          
          <YAxis 
            type={horizontal ? 'category' : 'number'}
            dataKey={horizontal ? xKey : undefined}
            stroke="#9ca3af"
            fontSize={12}
            width={horizontal ? 100 : undefined}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            domain={!horizontal ? ['dataMin', 'dataMax'] : undefined}
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