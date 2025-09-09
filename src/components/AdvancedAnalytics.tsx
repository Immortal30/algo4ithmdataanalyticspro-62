import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Filter, Download, Share2, Calculator, Target, Zap, Sliders, BarChart3, RefreshCw } from "lucide-react";

interface ExcelData {
  [key: string]: any;
}

interface AdvancedAnalyticsProps {
  data: ExcelData[];
  numericColumns: string[];
}

interface StatResult {
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
}

export const AdvancedAnalytics = ({ data, numericColumns }: AdvancedAnalyticsProps) => {
  const [selectedColumn, setSelectedColumn] = useState<string>(numericColumns[0] || '');
  const [selectedXAxis, setSelectedXAxis] = useState<string>(numericColumns[0] || '');
  const [selectedYAxis, setSelectedYAxis] = useState<string>(numericColumns[1] || '');
  const [filterValue, setFilterValue] = useState<string>('');
  
  // Advanced filtering state
  const [columnFilters, setColumnFilters] = useState<Record<string, { min: string; max: string; enabled: boolean }>>({});

  // Advanced statistical calculations
  const calculateAdvancedStats = (values: number[]): StatResult => {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const median = n % 2 === 0 ? (sorted[n/2 - 1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)];
    
    // Mode calculation
    const frequency: Record<number, number> = {};
    values.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
    const mode = Number(Object.keys(frequency).reduce((a, b) => frequency[Number(a)] > frequency[Number(b)] ? a : b));
    
    // Variance and standard deviation
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const standardDeviation = Math.sqrt(variance);
    
    // Quartiles
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    // Skewness
    const skewness = values.reduce((acc, val) => acc + Math.pow((val - mean) / standardDeviation, 3), 0) / n;
    
    // Kurtosis
    const kurtosis = values.reduce((acc, val) => acc + Math.pow((val - mean) / standardDeviation, 4), 0) / n - 3;
    
    return {
      mean,
      median,
      mode,
      standardDeviation,
      variance,
      min: Math.min(...values),
      max: Math.max(...values),
      q1,
      q3,
      iqr,
      skewness,
      kurtosis
    };
  };

  // Filtered data based on search and column filters
  const filteredData = useMemo(() => {
    let result = data;
    
    // Apply text search filter
    if (filterValue) {
      result = result.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(filterValue.toLowerCase())
        )
      );
    }
    
    // Apply min/max column filters
    Object.entries(columnFilters).forEach(([column, filter]) => {
      if (filter.enabled && (filter.min || filter.max)) {
        result = result.filter(row => {
          const value = Number(row[column]);
          if (isNaN(value)) return true; // Keep non-numeric values
          
          const minValue = filter.min ? Number(filter.min) : -Infinity;
          const maxValue = filter.max ? Number(filter.max) : Infinity;
          
          return value >= minValue && value <= maxValue;
        });
      }
    });
    
    return result;
  }, [data, filterValue, columnFilters]);

  // Advanced statistics for selected column
  const columnStats = useMemo(() => {
    if (!selectedColumn || !filteredData.length) return null;
    const values = filteredData.map(row => Number(row[selectedColumn]) || 0);
    return calculateAdvancedStats(values);
  }, [selectedColumn, filteredData]);

  // Correlation matrix
  const correlationMatrix = useMemo(() => {
    if (numericColumns.length < 2) return [];
    
    const matrix: Array<{x: string, y: string, correlation: number}> = [];
    
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = 0; j < numericColumns.length; j++) {
        const col1Values = filteredData.map(row => Number(row[numericColumns[i]]) || 0);
        const col2Values = filteredData.map(row => Number(row[numericColumns[j]]) || 0);
        
        const correlation = calculateCorrelation(col1Values, col2Values);
        matrix.push({
          x: numericColumns[i],
          y: numericColumns[j],
          correlation
        });
      }
    }
    
    return matrix;
  }, [numericColumns, filteredData]);

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumYY = y.reduce((acc, yi) => acc + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

  // Distribution data for histogram
  const distributionData = useMemo(() => {
    if (!selectedColumn || !filteredData.length) return [];
    
    const values = filteredData.map(row => {
      const v = Number(row[selectedColumn]);
      return Number.isFinite(v) ? v : 0;
    });

    if (!values.length) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);

    // Handle edge cases: identical values or invalid bin width
    if (!Number.isFinite(min) || !Number.isFinite(max) || max === min) {
      return [
        {
          range: `${min}-${max}`,
          count: values.length,
          midpoint: min,
        },
      ];
    }

    const bins = 20;
    const binWidth = (max - min) / bins;

    if (!Number.isFinite(binWidth) || binWidth <= 0) {
      return [
        {
          range: `${min}-${max}`,
          count: values.length,
          midpoint: min,
        },
      ];
    }
    
    const histogram = Array.from({ length: bins }, (_, i) => ({
      range: `${(min + i * binWidth).toFixed(1)}-${(min + (i + 1) * binWidth).toFixed(1)}`,
      count: 0,
      midpoint: min + (i + 0.5) * binWidth
    }));
    
    values.forEach((value) => {
      let idx = Math.floor((value - min) / binWidth);
      if (!Number.isFinite(idx)) idx = 0;
      const safeIndex = Math.min(Math.max(0, idx), bins - 1);
      histogram[safeIndex].count += 1;
    });
    
    return histogram;
  }, [selectedColumn, filteredData]);

  // Scatter plot data
  const scatterData = useMemo(() => {
    if (!selectedXAxis || !selectedYAxis || !filteredData.length) return [];
    
    return filteredData.map((row, index) => ({
      x: Number(row[selectedXAxis]) || 0,
      y: Number(row[selectedYAxis]) || 0,
      index
    }));
  }, [selectedXAxis, selectedYAxis, filteredData]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    if (!numericColumns.length || !filteredData.length) return [];
    
    return numericColumns.map(column => {
      const values = filteredData.map(row => Number(row[column]) || 0);
      const stats = calculateAdvancedStats(values);
      const efficiency = (stats.mean / stats.max) * 100;
      const consistency = 100 - (stats.standardDeviation / stats.mean) * 100;
      
      return {
        column,
        efficiency: efficiency || 0,
        consistency: consistency || 0,
        trend: calculateTrend(values),
        volatility: stats.standardDeviation / stats.mean || 0
      };
    });
  }, [numericColumns, filteredData]);

function calculateTrend(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;

  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * values[i], 0);
  const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const avgY = sumY / n;
  
  return avgY !== 0 ? slope / avgY : 0;
}

  // Initialize column filters when columns change
  useMemo(() => {
    const newFilters: Record<string, { min: string; max: string; enabled: boolean }> = {};
    numericColumns.forEach(column => {
      if (!columnFilters[column]) {
        const values = data.map(row => Number(row[column]) || 0);
        const min = Math.min(...values);
        const max = Math.max(...values);
        newFilters[column] = {
          min: '',
          max: '',
          enabled: false
        };
      }
    });
    
    if (Object.keys(newFilters).length > 0) {
      setColumnFilters(prev => ({ ...prev, ...newFilters }));
    }
  }, [numericColumns, data]);

  // Update column filter
  const updateColumnFilter = (column: string, key: 'min' | 'max' | 'enabled', value: string | boolean) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: {
        ...prev[column],
        [key]: value
      }
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterValue('');
    const resetFilters: Record<string, { min: string; max: string; enabled: boolean }> = {};
    numericColumns.forEach(column => {
      resetFilters[column] = { min: '', max: '', enabled: false };
    });
    setColumnFilters(resetFilters);
  };

  // Get column statistics for filtering reference
  const getColumnStats = (column: string) => {
    const values = data.map(row => Number(row[column]) || 0);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length
    };
  };

  if (!data.length || !numericColumns.length) {
    return (
      <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
        <CardContent className="p-6 text-center">
          <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Upload data to see advanced analytics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-dashboard-primary" />
            <span>Advanced Analytics Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter Data</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search data..."
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="pl-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Column</label>
              <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {numericColumns.map(column => (
                    <SelectItem key={column} value={column}>{column}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">X-Axis</label>
              <Select value={selectedXAxis} onValueChange={setSelectedXAxis}>
                <SelectTrigger>
                  <SelectValue placeholder="Select X-axis" />
                </SelectTrigger>
                <SelectContent>
                  {numericColumns.map(column => (
                    <SelectItem key={column} value={column}>{column}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Y-Axis</label>
              <Select value={selectedYAxis} onValueChange={setSelectedYAxis}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Y-axis" />
                </SelectTrigger>
                <SelectContent>
                  {numericColumns.map(column => (
                    <SelectItem key={column} value={column}>{column}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{filteredData.length} records</Badge>
              <Badge variant="outline">{numericColumns.length} metrics</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="statistics" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="profiling">Data Profiling</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="scatter">Scatter Plot</TabsTrigger>
        </TabsList>

        {/* Advanced Statistics */}
        <TabsContent value="statistics" className="space-y-6">
          {columnStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-dashboard-primary">{columnStats.mean.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Mean</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-dashboard-secondary">{columnStats.median.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Median</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-dashboard-accent">{columnStats.standardDeviation.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Std Dev</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-dashboard-warning">{columnStats.skewness.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Skewness</div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
              <CardHeader>
                <CardTitle>Descriptive Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {columnStats && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Count:</span>
                      <span className="font-medium">{filteredData.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min:</span>
                      <span className="font-medium">{columnStats.min.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Q1:</span>
                      <span className="font-medium">{columnStats.q1.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Q3:</span>
                      <span className="font-medium">{columnStats.q3.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max:</span>
                      <span className="font-medium">{columnStats.max.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IQR:</span>
                      <span className="font-medium">{columnStats.iqr.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Variance:</span>
                      <span className="font-medium">{columnStats.variance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kurtosis:</span>
                      <span className="font-medium">{columnStats.kurtosis.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
              <CardHeader>
                <CardTitle>Box Plot Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                {columnStats && (
                  <div className="h-64 flex items-center justify-center">
                    <div className="relative w-full max-w-md">
                      <div className="h-8 bg-dashboard-primary/20 rounded relative">
                        <div 
                          className="absolute h-full w-1 bg-dashboard-primary rounded"
                          style={{ left: `${((columnStats.min - columnStats.min) / (columnStats.max - columnStats.min)) * 100}%` }}
                        />
                        <div 
                          className="absolute h-full bg-dashboard-secondary/50 rounded"
                          style={{ 
                            left: `${((columnStats.q1 - columnStats.min) / (columnStats.max - columnStats.min)) * 100}%`,
                            width: `${((columnStats.q3 - columnStats.q1) / (columnStats.max - columnStats.min)) * 100}%`
                          }}
                        />
                        <div 
                          className="absolute h-full w-1 bg-dashboard-accent rounded"
                          style={{ left: `${((columnStats.median - columnStats.min) / (columnStats.max - columnStats.min)) * 100}%` }}
                        />
                        <div 
                          className="absolute h-full w-1 bg-dashboard-primary rounded"
                          style={{ left: `${((columnStats.max - columnStats.min) / (columnStats.max - columnStats.min)) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Min</span>
                        <span>Q1</span>
                        <span>Med</span>
                        <span>Q3</span>
                        <span>Max</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Data Profiling with Filtering */}
        <TabsContent value="profiling" className="space-y-6">
          <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sliders className="h-5 w-5 text-dashboard-primary" />
                  <span>Advanced Data Profiling & Filtering</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetFilters}
                  className="text-dashboard-primary border-dashboard-primary/30 hover:bg-dashboard-primary/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {numericColumns.map(column => {
                  const stats = getColumnStats(column);
                  const filter = columnFilters[column] || { min: '', max: '', enabled: false };
                  const filteredColumnData = filteredData.map(row => Number(row[column]) || 0);
                  const currentMin = Math.min(...filteredColumnData);
                  const currentMax = Math.max(...filteredColumnData);
                  const uniqueValues = new Set(filteredColumnData).size;
                  
                  return (
                    <Card key={column} className="border border-dashboard-primary/20 bg-gradient-to-br from-dashboard-primary/5 to-dashboard-accent/5">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold">{column}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={filter.enabled}
                              onChange={(e) => updateColumnFilter(column, 'enabled', e.target.checked)}
                              className="rounded border-dashboard-primary/30 text-dashboard-primary focus:ring-dashboard-primary/20"
                            />
                            <Label className="text-sm">Filter</Label>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Column Statistics */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Min:</span>
                              <span className="font-medium text-dashboard-primary">{currentMin.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max:</span>
                              <span className="font-medium text-dashboard-secondary">{currentMax.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Avg:</span>
                              <span className="font-medium text-dashboard-accent">{stats.avg.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Unique:</span>
                              <span className="font-medium text-dashboard-warning">{uniqueValues}</span>
                            </div>
                          </div>
                        </div>

                        {/* Visual Range Bar */}
                        <div className="relative">
                          <div className="h-3 bg-gradient-to-r from-dashboard-primary/20 to-dashboard-secondary/20 rounded-full relative overflow-hidden">
                            <div 
                              className="absolute h-full bg-gradient-to-r from-dashboard-primary to-dashboard-secondary rounded-full opacity-60"
                              style={{ 
                                left: '0%',
                                width: '100%'
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{stats.min.toFixed(1)}</span>
                            <span>{stats.max.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Filter Controls */}
                        <div className={`space-y-3 transition-opacity duration-200 ${filter.enabled ? 'opacity-100' : 'opacity-50'}`}>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Min Value</Label>
                              <Input
                                type="number"
                                placeholder={`Min (${stats.min.toFixed(1)})`}
                                value={filter.min}
                                onChange={(e) => updateColumnFilter(column, 'min', e.target.value)}
                                disabled={!filter.enabled}
                                className="h-8 text-sm border-dashboard-primary/30 focus:border-dashboard-primary/50"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Max Value</Label>
                              <Input
                                type="number"
                                placeholder={`Max (${stats.max.toFixed(1)})`}
                                value={filter.max}
                                onChange={(e) => updateColumnFilter(column, 'max', e.target.value)}
                                disabled={!filter.enabled}
                                className="h-8 text-sm border-dashboard-primary/30 focus:border-dashboard-primary/50"
                              />
                            </div>
                          </div>
                          
                          {/* Quick Filter Buttons */}
                          <div className="flex flex-wrap gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs border-dashboard-primary/30 hover:bg-dashboard-primary/10"
                              disabled={!filter.enabled}
                              onClick={() => {
                                updateColumnFilter(column, 'min', stats.min.toString());
                                updateColumnFilter(column, 'max', stats.avg.toString());
                              }}
                            >
                              Below Avg
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs border-dashboard-secondary/30 hover:bg-dashboard-secondary/10"
                              disabled={!filter.enabled}
                              onClick={() => {
                                updateColumnFilter(column, 'min', stats.avg.toString());
                                updateColumnFilter(column, 'max', stats.max.toString());
                              }}
                            >
                              Above Avg
                            </Button>
                          </div>
                        </div>

                        {/* Mini Distribution Chart */}
                        <div className="h-16">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.slice(0, 20).map((row, idx) => ({ 
                              x: idx, 
                              y: Number(row[column]) || 0 
                            }))}>
                              <Bar dataKey="y" fill="hsl(var(--dashboard-primary) / 0.6)" radius={[1, 1, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Filter Status */}
                        {filter.enabled && (filter.min || filter.max) && (
                          <div className="mt-3 p-2 bg-dashboard-primary/10 rounded-lg border border-dashboard-primary/20">
                            <div className="text-xs text-dashboard-primary font-medium">
                              Filter: {filter.min || '∞'} ≤ value ≤ {filter.max || '∞'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {filteredColumnData.filter(v => {
                                const min = filter.min ? Number(filter.min) : -Infinity;
                                const max = filter.max ? Number(filter.max) : Infinity;
                                return v >= min && v <= max;
                              }).length} of {data.length} records match
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <Card className="mt-6 bg-gradient-to-r from-dashboard-primary/10 to-dashboard-secondary/10 border border-dashboard-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <BarChart3 className="h-8 w-8 text-dashboard-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">Filtered Data Summary</h3>
                        <p className="text-sm text-muted-foreground">
                          Showing {filteredData.length} of {data.length} records 
                          ({((filteredData.length / data.length) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-dashboard-primary">{Object.values(columnFilters).filter(f => f.enabled).length}</div>
                        <div className="text-muted-foreground">Active Filters</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-dashboard-secondary">{numericColumns.length}</div>
                        <div className="text-muted-foreground">Total Columns</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Analysis */}
        <TabsContent value="distribution">
          <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
            <CardHeader>
              <CardTitle>Distribution Analysis - {selectedColumn}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                  <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--dashboard-primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Correlation Matrix */}
        <TabsContent value="correlation">
          <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
            <CardHeader>
              <CardTitle>Correlation Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${numericColumns.length}, 1fr)` }}>
                {numericColumns.map(col => (
                  <div key={col} className="text-center text-sm font-medium p-2">{col}</div>
                ))}
                {correlationMatrix.map((cell, index) => (
                  <div 
                    key={index}
                    className="aspect-square flex items-center justify-center text-xs font-medium rounded"
                    style={{
                      backgroundColor: `hsl(var(--dashboard-primary) / ${Math.abs(cell.correlation) * 0.8 + 0.1})`,
                      color: Math.abs(cell.correlation) > 0.5 ? 'white' : 'hsl(var(--foreground))'
                    }}
                  >
                    {cell.correlation.toFixed(2)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Metrics */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics.map(metric => (
                    <div key={metric.column} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{metric.column}</span>
                        <div className="flex space-x-2">
                          <Badge variant={metric.trend > 0 ? 'default' : 'destructive'}>
                            {metric.trend > 0 ? '↗' : '↘'} {(metric.trend * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Efficiency</span>
                          <span>{metric.efficiency.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-dashboard-primary h-2 rounded-full"
                            style={{ width: `${Math.min(metric.efficiency, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Consistency</span>
                          <span>{metric.consistency.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-dashboard-secondary h-2 rounded-full"
                            style={{ width: `${Math.min(Math.max(metric.consistency, 0), 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                    <XAxis dataKey="column" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="hsl(var(--dashboard-primary))" 
                      strokeWidth={2}
                      name="Efficiency"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="consistency" 
                      stroke="hsl(var(--dashboard-secondary))" 
                      strokeWidth={2}
                      name="Consistency"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scatter Plot */}
        <TabsContent value="scatter">
          <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
            <CardHeader>
              <CardTitle>Scatter Plot: {selectedXAxis} vs {selectedYAxis}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={scatterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name={selectedXAxis}
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name={selectedYAxis}
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Scatter dataKey="y" fill="hsl(var(--dashboard-primary))" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};