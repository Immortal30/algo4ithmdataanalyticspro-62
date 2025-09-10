import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Treemap, FunnelChart, Funnel, LabelList,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ComposedChart, Bar, Line
} from 'recharts';
import { 
  PieChart as PieIcon, 
  Activity, 
  TrendingUp, 
  BarChart3, 
  Layers,
  Target,
  Filter
} from "lucide-react";

interface AdvancedChartsProps {
  data: any[];
  columns: string[];
  selectedColumn?: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--destructive))',
  'hsl(var(--accent))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
  '#8dd1e1',
  '#d084d0'
];

export const AdvancedCharts = ({ data, columns, selectedColumn }: AdvancedChartsProps) => {
  const chartData = useMemo(() => {
    if (!selectedColumn || !data.length) return null;

    // For large datasets, sample the data
    const sampleSize = 1000;
    const sampledData = data.length > sampleSize 
      ? data.filter((_, i) => i % Math.floor(data.length / sampleSize) === 0).slice(0, sampleSize)
      : data;

    // Get unique values and their counts for categorical data
    const valueMap = new Map();
    sampledData.forEach(row => {
      const value = row[selectedColumn];
      if (value !== null && value !== undefined) {
        valueMap.set(value, (valueMap.get(value) || 0) + 1);
      }
    });

    // Convert to array and sort by count
    const pieData = Array.from(valueMap.entries())
      .map(([name, value]) => ({ name: String(name), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 for readability

    // Calculate percentages
    const total = pieData.reduce((sum, item) => sum + item.value, 0);
    const pieDataWithPercentage = pieData.map(item => ({
      ...item,
      percentage: ((item.value / total) * 100).toFixed(1)
    }));

    // Prepare radar data (for numeric columns)
    const numericColumns = columns.filter(col => {
      const sample = data[0]?.[col];
      return typeof sample === 'number' || !isNaN(Number(sample));
    });

    const radarData = numericColumns.slice(0, 8).map(col => {
      const values = sampledData.map(row => Number(row[col])).filter(v => !isNaN(v));
      const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      const max = Math.max(...values);
      const min = Math.min(...values);
      const normalized = max !== min ? ((avg - min) / (max - min)) * 100 : 50;
      
      return {
        subject: col,
        value: normalized.toFixed(1),
        fullMark: 100
      };
    });

    // Prepare treemap data
    const treemapData = {
      name: 'Root',
      children: pieDataWithPercentage.map(item => ({
        name: item.name,
        size: item.value,
        percentage: item.percentage
      }))
    };

    // Prepare funnel data
    const funnelData = pieDataWithPercentage.slice(0, 5).map((item, index) => ({
      ...item,
      fill: COLORS[index % COLORS.length]
    }));

    // Time series data (if date column exists)
    const dateColumns = columns.filter(col => 
      col.toLowerCase().includes('date') || 
      col.toLowerCase().includes('time') ||
      col.toLowerCase().includes('created') ||
      col.toLowerCase().includes('updated')
    );

    let timeSeriesData = null;
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      const dateCol = dateColumns[0];
      const valueCol = selectedColumn;
      
      // Group by date and calculate average
      const dateMap = new Map();
      sampledData.forEach(row => {
        const date = row[dateCol];
        const value = Number(row[valueCol]);
        if (date && !isNaN(value)) {
          if (!dateMap.has(date)) {
            dateMap.set(date, { sum: 0, count: 0 });
          }
          const current = dateMap.get(date);
          current.sum += value;
          current.count += 1;
        }
      });

      timeSeriesData = Array.from(dateMap.entries())
        .map(([date, stats]) => ({
          date: String(date).slice(0, 10),
          value: stats.sum / stats.count
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30); // Last 30 points
    }

    return {
      pieData: pieDataWithPercentage,
      radarData,
      treemapData,
      funnelData,
      timeSeriesData,
      total,
      uniqueValues: valueMap.size
    };
  }, [data, columns, selectedColumn]);

  if (!chartData) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Select a column to visualize
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-popover p-3 rounded-lg border shadow-lg">
          <p className="text-sm font-medium">{label || payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            Value: {payload[0].value}
            {payload[0].payload?.percentage && (
              <span> ({payload[0].payload.percentage}%)</span>
            )}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{chartData.total}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{chartData.uniqueValues}</div>
            <div className="text-sm text-muted-foreground">Unique Values</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{chartData.pieData[0]?.name || 'N/A'}</div>
            <div className="text-sm text-muted-foreground">Most Common</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{chartData.pieData[0]?.percentage || 0}%</div>
            <div className="text-sm text-muted-foreground">Top Value %</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pie" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="pie" className="flex items-center gap-1">
            <PieIcon className="h-4 w-4" />
            Pie
          </TabsTrigger>
          <TabsTrigger value="donut" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            Donut
          </TabsTrigger>
          <TabsTrigger value="radar" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            Radar
          </TabsTrigger>
          <TabsTrigger value="treemap" className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            Treemap
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Funnel
          </TabsTrigger>
        </TabsList>

        {/* Pie Chart */}
        <TabsContent value="pie">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieIcon className="h-5 w-5 text-primary" />
                Distribution - {selectedColumn}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Donut Chart */}
        <TabsContent value="donut">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Donut Chart - {selectedColumn}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Radar Chart */}
        <TabsContent value="radar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Multi-dimensional Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={chartData.radarData}>
                  <PolarGrid strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Values"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treemap */}
        <TabsContent value="treemap">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Hierarchical View - {selectedColumn}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <Treemap
                  data={chartData.treemapData.children}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke="#fff"
                  fill="hsl(var(--primary))"
                >
                  <Tooltip content={<CustomTooltip />} />
                </Treemap>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funnel Chart */}
        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Top 5 Values - {selectedColumn}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <FunnelChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Funnel
                    dataKey="value"
                    data={chartData.funnelData}
                    isAnimationActive
                  >
                    <LabelList position="center" fill="#fff" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Time Series if available */}
      {chartData.timeSeriesData && chartData.timeSeriesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Time Series Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};