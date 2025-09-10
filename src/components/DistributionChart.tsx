import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, ComposedChart, Area } from 'recharts';
import { TrendingUp, BarChart3, Activity, Zap } from "lucide-react";

interface DistributionChartProps {
  data: any[];
  column: string;
  type?: 'histogram' | 'density' | 'box' | 'scatter';
  bins?: number;
}

export const DistributionChart = ({ data, column, type = 'histogram', bins = 20 }: DistributionChartProps) => {
  const chartData = useMemo(() => {
    // For large datasets, sample the data for better performance
    const sampleSize = 10000;
    const sampledData = data.length > sampleSize 
      ? data.filter((_, i) => i % Math.floor(data.length / sampleSize) === 0).slice(0, sampleSize)
      : data;
    
    const values = sampledData.map(row => Number(row[column])).filter(v => !isNaN(v));
    
    if (values.length === 0) return { data: [], stats: {} };
    
    // Calculate statistics
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
    
    // Generate histogram data
    const range = max - min;
    const binSize = range / bins;
    const histogram = Array.from({ length: bins }, (_, i) => {
      const binStart = min + (i * binSize);
      const binEnd = binStart + binSize;
      const count = values.filter(v => v >= binStart && v < binEnd).length;
      const frequency = (count / values.length) * 100;
      
      return {
        bin: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
        binStart,
        binEnd,
        count,
        frequency: frequency.toFixed(2),
        midpoint: (binStart + binEnd) / 2
      };
    });
    
    // Generate density curve data
    const densityData = histogram.map(h => ({
      ...h,
      density: (h.count / values.length) * (bins / range)
    }));
    
    return {
      data: type === 'scatter' ? values.map((v, i) => ({ index: i, value: v })) : densityData,
      stats: { mean, median, q1, q3, min, max, stdDev, count: values.length }
    };
  }, [data, column, bins, type]);

  const { data: chartDataArray, stats } = chartData;

  return (
    <Card className="border-border/50 bg-gradient-to-br from-background via-background to-muted/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{column} Distribution</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              n={stats.count || 0}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              μ={stats.mean?.toFixed(2) || 0}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              σ={stats.stdDev?.toFixed(2) || 0}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          {type === 'histogram' ? (
            <ComposedChart data={chartDataArray}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
              <XAxis 
                dataKey="midpoint" 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => value.toFixed(0)}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                label={{ value: 'Frequency (%)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover p-2 rounded-lg border shadow-lg">
                      <p className="text-xs font-medium">Range: {data.bin}</p>
                      <p className="text-xs">Count: {data.count}</p>
                      <p className="text-xs">Frequency: {data.frequency}%</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="frequency" fill="hsl(var(--primary))" opacity={0.8} />
              <Line 
                type="monotone" 
                dataKey="frequency" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          ) : type === 'density' ? (
            <ComposedChart data={chartDataArray}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
              <XAxis 
                dataKey="midpoint" 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => value.toFixed(0)}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="density" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.3}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </ComposedChart>
          ) : type === 'scatter' ? (
            <ScatterChart data={chartDataArray}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
              <XAxis 
                dataKey="index" 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                label={{ value: 'Index', position: 'insideBottom', offset: -5, style: { fontSize: 11 } }}
              />
              <YAxis 
                dataKey="value"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                label={{ value: 'Value', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
              />
              <Tooltip />
              <Scatter 
                dataKey="value"
                fill="hsl(var(--primary))"
                fillOpacity={0.6}
              />
            </ScatterChart>
          ) : null}
        </ResponsiveContainer>
        
        {/* Statistics Summary */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="bg-muted/50 p-2 rounded">
            <span className="text-muted-foreground">Min:</span>
            <span className="ml-1 font-medium">{stats.min?.toFixed(2)}</span>
          </div>
          <div className="bg-muted/50 p-2 rounded">
            <span className="text-muted-foreground">Median:</span>
            <span className="ml-1 font-medium">{stats.median?.toFixed(2)}</span>
          </div>
          <div className="bg-muted/50 p-2 rounded">
            <span className="text-muted-foreground">Max:</span>
            <span className="ml-1 font-medium">{stats.max?.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};