import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Activity, Target } from "lucide-react";

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ChartGeneratorProps {
  data: ChartData[];
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  dataKey?: string;
  className?: string;
}

const COLORS = [
  'hsl(220 80% 60%)',     // Vibrant Blue
  'hsl(150 70% 50%)',     // Green
  'hsl(280 75% 60%)',     // Purple
  'hsl(35 90% 55%)',      // Orange
  'hsl(350 85% 60%)',     // Red
  'hsl(200 85% 50%)',     // Cyan
  'hsl(45 95% 55%)',      // Yellow
  'hsl(320 70% 55%)',     // Magenta
  'hsl(170 65% 50%)',     // Teal
  'hsl(10 80% 55%)',      // Coral
];

export const ChartGenerator = ({ data, title, type, dataKey = 'value', className }: ChartGeneratorProps) => {
  // Split data into chunks if too large
  const CHUNK_SIZE = 500;
  const shouldSplit = data.length > CHUNK_SIZE;
  const dataChunks = shouldSplit 
    ? Array.from({ length: Math.ceil(data.length / CHUNK_SIZE) }, (_, i) => 
        data.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
      )
    : [data];

  // Calculate insights and statistics for all data
  const values = data.map(d => d.value).filter(v => typeof v === 'number' && !isNaN(v));
  const total = values.reduce((sum, val) => sum + val, 0);
  const average = values.length > 0 ? total / values.length : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;
  const trend = values.length > 1 ? ((values[values.length - 1] - values[0]) / values[0]) * 100 : 0;
  
  // Find top performer
  const topPerformer = data.reduce((top, current) => 
    current.value > top.value ? current : top, data[0] || { name: "N/A", value: 0 }
  );
  
  // Generate natural language insights
  const generateInsights = () => {
    const insights: string[] = [];
    
    if (values.length === 0) {
      return ["No data available for analysis"];
    }
    
    // Performance insights
    if (topPerformer && topPerformer.value > 0) {
      const percentage = total > 0 ? ((topPerformer.value / total) * 100).toFixed(1) : "0";
      insights.push(`${topPerformer.name} is the top performer, representing ${percentage}% of total value`);
    }
    
    // Trend insights
    if (Math.abs(trend) > 5) {
      const direction = trend > 0 ? "increasing" : "decreasing";
      insights.push(`Values are ${direction} with a ${Math.abs(trend).toFixed(1)}% change from start to end`);
    } else {
      insights.push("Values remain relatively stable across the dataset");
    }
    
    // Distribution insights
    const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const coefficient = average > 0 ? (stdDev / average) * 100 : 0;
    
    if (coefficient > 50) {
      insights.push("High variability detected - values are widely distributed");
    } else if (coefficient < 20) {
      insights.push("Low variability - values are consistently close to average");
    } else {
      insights.push("Moderate variability in the data distribution");
    }
    
    return insights.slice(0, 2); // Return top 2 insights
  };
  
  const insights = generateInsights();
  
  const renderChart = (chunkData: ChartData[], chunkIndex?: number) => {
    const commonProps = {
      data: chunkData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--muted-foreground) / 0.3)' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--muted-foreground) / 0.3)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: any, name: any, props: any) => [
                value.toLocaleString(),
                props.payload?.fullName || props.payload?.name || name
              ]}
            />
            <Bar 
              dataKey={dataKey} 
              radius={[4, 4, 0, 0]}
            >
              {chunkData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--muted-foreground) / 0.3)' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--muted-foreground) / 0.3)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: any, name: any, props: any) => [
                value.toLocaleString(),
                props.payload?.fullName || props.payload?.name || name
              ]}
              labelFormatter={(label: any) => `Category: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke="hsl(var(--dashboard-primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--dashboard-primary))', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: 'hsl(var(--dashboard-secondary))', stroke: 'hsl(var(--dashboard-primary))', strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`areaGradient-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--dashboard-primary) / 0.8)" />
                <stop offset="100%" stopColor="hsl(var(--dashboard-primary) / 0.1)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--muted-foreground) / 0.3)' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--muted-foreground) / 0.3)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: any, name: any, props: any) => [
                value.toLocaleString(),
                props.payload?.fullName || props.payload?.name || name
              ]}
              labelFormatter={(label: any) => `Category: ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke="hsl(var(--dashboard-primary))" 
              fill={`url(#areaGradient-${title.replace(/\s+/g, '-')})`}
              strokeWidth={2}
            />
          </AreaChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Chart type not supported</p>
          </div>
        );
    }
  };

  return (
    <Card className={`dashboard-card group ${className}`}>
      <CardHeader className="pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-dashboard-primary" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {trend !== 0 && (
              <Badge variant={trend > 0 ? "default" : "destructive"} className="text-xs">
                {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(trend).toFixed(1)}%
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {data.length} items
            </Badge>
          </div>
        </div>
        
        {/* Key Statistics */}
        <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted/10 border border-muted/20">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Average</div>
            <div className="text-sm font-semibold text-dashboard-primary">
              {average.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Peak</div>
            <div className="text-sm font-semibold text-dashboard-success">
              {max.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Range</div>
            <div className="text-sm font-semibold text-dashboard-accent">
              {(max - min).toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chart Visualization */}
        {dataChunks.map((chunk, index) => (
          <div key={index} className="space-y-2">
            {shouldSplit && (
              <div className="text-sm font-medium text-muted-foreground">
                Part {index + 1} of {dataChunks.length} (Items {index * CHUNK_SIZE + 1}-{Math.min((index + 1) * CHUNK_SIZE, data.length)})
              </div>
            )}
            <div className="relative overflow-hidden rounded-lg border border-glass-border/50 bg-card/30 p-4">
              <ResponsiveContainer width="100%" height={400}>
                {renderChart(chunk, index)}
              </ResponsiveContainer>
            </div>
          </div>
        ))}
        
        {/* Natural Language Insights */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Target className="h-4 w-4 text-dashboard-warning" />
            Key Insights
          </div>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground p-2 rounded bg-muted/5 border border-muted/10">
                <AlertCircle className="h-4 w-4 text-dashboard-info mt-0.5 flex-shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Top Performer Highlight */}
        {topPerformer && topPerformer.value > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-dashboard-primary/10 to-dashboard-secondary/10 border border-dashboard-primary/20">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-dashboard-primary" />
              <span className="text-sm font-medium text-foreground">Top Performer</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-dashboard-primary">{topPerformer.name}</div>
              <div className="text-xs text-muted-foreground">
                {topPerformer.value.toLocaleString()} 
                {total > 0 && ` (${((topPerformer.value / total) * 100).toFixed(1)}%)`}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};