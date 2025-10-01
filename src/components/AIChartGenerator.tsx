import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  LineChart, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Send,
  Loader2,
  ChevronRight,
  Activity,
  DollarSign,
  Users,
  Target,
  Calendar,
  Hash,
  Percent
} from "lucide-react";
import { ChartGenerator } from "./ChartGenerator";
import { AdvancedCharts } from "./AdvancedCharts";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';

interface AIChartGeneratorProps {
  data: any[];
  columns: string[];
}

export const AIChartGenerator = ({ data, columns }: AIChartGeneratorProps) => {
  const [input, setInput] = useState('');
  const [generatedChart, setGeneratedChart] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');

  // Analyze data to provide intelligent suggestions
  const suggestions = useMemo(() => {
    if (!data.length) return [];
    
    const numericCols = columns.filter(col => 
      !isNaN(Number(data[0][col])) && data[0][col] !== ""
    );
    
    const dateCols = columns.filter(col => {
      const value = data[0][col];
      return !isNaN(Date.parse(value)) || col.toLowerCase().includes('date') || col.toLowerCase().includes('time');
    });
    
    const categoricalCols = columns.filter(col => 
      isNaN(Number(data[0][col])) && !dateCols.includes(col)
    );

    const baseSuggestions = [];
    
    // Time series suggestions
    if (dateCols.length > 0 && numericCols.length > 0) {
      baseSuggestions.push({
        icon: TrendingUp,
        text: `Show ${numericCols[0]} trend over time with forecast`,
        type: 'timeseries'
      });
      baseSuggestions.push({
        icon: LineChart,
        text: `Create monthly ${numericCols[0]} analysis with predictions`,
        type: 'forecast'
      });
    }
    
    // Sales/Revenue suggestions
    const salesCols = numericCols.filter(col => 
      col.toLowerCase().includes('sales') || 
      col.toLowerCase().includes('revenue') ||
      col.toLowerCase().includes('amount')
    );
    if (salesCols.length > 0) {
      baseSuggestions.push({
        icon: DollarSign,
        text: `Analyze sales performance with growth predictions`,
        type: 'sales'
      });
    }
    
    // Category analysis
    if (categoricalCols.length > 0 && numericCols.length > 0) {
      baseSuggestions.push({
        icon: PieChart,
        text: `Show ${numericCols[0]} distribution by ${categoricalCols[0]}`,
        type: 'distribution'
      });
      baseSuggestions.push({
        icon: BarChart3,
        text: `Compare top 10 ${categoricalCols[0]} by ${numericCols[0]}`,
        type: 'comparison'
      });
    }
    
    // Generic suggestions
    if (numericCols.length >= 2) {
      baseSuggestions.push({
        icon: Activity,
        text: `Correlation analysis between ${numericCols[0]} and ${numericCols[1]}`,
        type: 'correlation'
      });
    }
    
    if (numericCols.length > 0) {
      baseSuggestions.push({
        icon: Target,
        text: `Show KPIs and key metrics dashboard`,
        type: 'kpi'
      });
    }
    
    return baseSuggestions;
  }, [data, columns]);

  // Process natural language input and generate appropriate chart
  const processRequest = useCallback((request: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const lowerRequest = request.toLowerCase();
      
      // Detect chart type from request
      let chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'radar' = 'line';
      let includeForcast = false;
      let column = '';
      let xAxis = '';
      
      // Parse request for chart type
      if (lowerRequest.includes('pie') || lowerRequest.includes('distribution')) {
        chartType = 'pie';
      } else if (lowerRequest.includes('bar') || lowerRequest.includes('compare')) {
        chartType = 'bar';
      } else if (lowerRequest.includes('area') || lowerRequest.includes('volume')) {
        chartType = 'area';
      } else if (lowerRequest.includes('scatter') || lowerRequest.includes('correlation')) {
        chartType = 'scatter';
      } else if (lowerRequest.includes('radar') || lowerRequest.includes('multi')) {
        chartType = 'radar';
      } else if (lowerRequest.includes('trend') || lowerRequest.includes('forecast') || lowerRequest.includes('predict')) {
        chartType = 'line';
        includeForcast = true;
      }
      
      // Find relevant columns from request
      const numericCols = columns.filter(col => 
        !isNaN(Number(data[0][col])) && data[0][col] !== ""
      );
      
      // Match columns mentioned in request
      column = numericCols.find(col => 
        lowerRequest.includes(col.toLowerCase())
      ) || numericCols[0];
      
      // Find date/time column for x-axis
      const dateCols = columns.filter(col => {
        const value = data[0][col];
        return !isNaN(Date.parse(value)) || col.toLowerCase().includes('date') || col.toLowerCase().includes('time');
      });
      
      xAxis = dateCols[0] || columns.find(col => col !== column) || 'index';
      
      // Generate chart data
      let chartData = data.map((row, index) => ({
        name: xAxis === 'index' ? `Point ${index + 1}` : String(row[xAxis] || '').substring(0, 20),
        value: Number(row[column]) || 0,
        index: index
      }));
      
      // Add forecast if requested
      if (includeForcast && chartData.length > 0) {
        const lastValue = chartData[chartData.length - 1].value;
        const avgGrowth = chartData.length > 1 
          ? (lastValue - chartData[0].value) / chartData.length 
          : lastValue * 0.1;
        
        // Add predicted future points
        const forecastPoints = 5;
        for (let i = 1; i <= forecastPoints; i++) {
          chartData.push({
            name: `Forecast ${i}`,
            value: lastValue + (avgGrowth * i * (1 + Math.random() * 0.2 - 0.1)),
            index: chartData.length,
            forecast: true
          } as any);
        }
      }
      
      setGeneratedChart({
        type: chartType,
        data: chartData,
        title: `${column} Analysis`,
        includeForcast,
        column,
        xAxis
      });
      
      setIsProcessing(false);
    }, 1500);
  }, [data, columns]);

  const handleSubmit = () => {
    if (input.trim()) {
      processRequest(input);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setSelectedSuggestion(suggestion.text);
    setInput(suggestion.text);
    processRequest(suggestion.text);
  };

  // Render forecast chart with predictions
  const renderForecastChart = () => {
    if (!generatedChart || !generatedChart.includeForcast) return null;
    
    const actualData = generatedChart.data.filter((d: any) => !d.forecast);
    const forecastData = generatedChart.data.filter((d: any) => d.forecast);
    const allData = [...actualData, ...forecastData];
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-dashboard-primary" />
            {generatedChart.title} with Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <AreaChart data={allData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--dashboard-primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--dashboard-primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--dashboard-accent))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--dashboard-accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              
              {/* Actual data area */}
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--dashboard-primary))"
                strokeWidth={2}
                fill="url(#colorValue)"
                name="Actual"
                data={actualData}
              />
              
              {/* Reference line at forecast start */}
              {actualData.length > 0 && (
                <ReferenceLine 
                  x={actualData[actualData.length - 1].name} 
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  label="Forecast Start"
                />
              )}
              
              {/* Forecast line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--dashboard-accent))"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Forecast"
                data={forecastData}
                dot={{ fill: 'hsl(var(--dashboard-accent))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          <div className="mt-4 flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <div className="w-3 h-3 rounded-full bg-dashboard-primary" />
              Historical Data
            </Badge>
            <Badge variant="outline" className="gap-1">
              <div className="w-3 h-3 rounded-full bg-dashboard-accent" />
              Predicted Trend
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* AI Input Section */}
      <Card className="border-dashboard-primary/20 bg-gradient-to-br from-dashboard-primary/5 to-dashboard-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-dashboard-primary animate-pulse" />
            AI Chart Generator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Describe what you want to visualize and AI will create the perfect chart
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Area */}
          <div className="relative">
            <Textarea
              placeholder="e.g., 'Show me sales trend with next quarter forecast' or 'Create a pie chart of revenue by category'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px] pr-12"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSubmit();
                }
              }}
            />
            <Button
              size="icon"
              className="absolute bottom-2 right-2"
              onClick={handleSubmit}
              disabled={!input.trim() || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Suggestions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Suggested analyses:</p>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => {
                  const Icon = suggestion.icon;
                  return (
                    <Button
                      key={index}
                      variant={selectedSuggestion === suggestion.text ? "default" : "outline"}
                      className="w-full justify-start text-left"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Icon className="h-4 w-4 mr-2 shrink-0" />
                      <span className="truncate">{suggestion.text}</span>
                      <ChevronRight className="h-4 w-4 ml-auto shrink-0" />
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
      
      {/* Generated Chart */}
      {generatedChart && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {generatedChart.includeForcast ? (
            renderForecastChart()
          ) : generatedChart.type === 'pie' || generatedChart.type === 'radar' ? (
            <AdvancedCharts
              data={data}
              columns={columns}
              selectedColumn={generatedChart.column}
            />
          ) : (
            <ChartGenerator
              data={generatedChart.data}
              title={generatedChart.title}
              type={generatedChart.type}
            />
          )}
        </div>
      )}
      
      {/* Processing Indicator */}
      {isProcessing && (
        <Card className="border-dashboard-primary/20">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <Sparkles className="h-12 w-12 text-dashboard-primary animate-pulse" />
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="h-12 w-12 text-dashboard-primary opacity-30" />
                </div>
              </div>
              <p className="text-muted-foreground">AI is analyzing your data and creating the perfect visualization...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};