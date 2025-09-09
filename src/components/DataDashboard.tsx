import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Activity, 
  TrendingUp, 
  Database, 
  Eye,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { ChartGenerator } from "./ChartGenerator";
import { KPICard } from "./KPICard";
import { VirtualizedTable } from "./VirtualizedTable";

interface DataDashboardProps {
  data: any[];
  fileName: string;
  onExport?: (type: 'csv' | 'json' | 'excel') => void;
}

export const DataDashboard = ({ data, fileName, onExport }: DataDashboardProps) => {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [selectedChartType, setSelectedChartType] = useState<'bar' | 'line' | 'pie' | 'area'>('bar');
  const [activeTab, setActiveTab] = useState('overview');

  // Get numeric columns for chart selection
  const numericColumns = useMemo(() => {
    if (!data.length) return [];
    const firstRow = data[0];
    return Object.keys(firstRow).filter(key => {
      const value = firstRow[key];
      return !isNaN(Number(value)) && value !== "" && key !== "id";
    });
  }, [data]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!data.length) return {};
    
    const totalRows = data.length;
    const sums = numericColumns.reduce((acc, col) => {
      acc[col] = data.reduce((sum, row) => sum + (Number(row[col]) || 0), 0);
      return acc;
    }, {} as Record<string, number>);
    
    const averages = numericColumns.reduce((acc, col) => {
      acc[col] = sums[col] / totalRows;
      return acc;
    }, {} as Record<string, number>);
    
    return { sums, averages, totalRows };
  }, [data, numericColumns]);

  // Generate chart data
  const getChartData = (columnKey: string) => {
    if (!data.length || !columnKey) return [];
    
    return data.map((row, index) => {
      const nameKey = Object.keys(row).find(k => k !== 'id' && k !== columnKey) || 'name';
      const value = Number(row[columnKey]) || 0;
      
      return {
        name: String(row[nameKey] || `Item ${index + 1}`).substring(0, 20),
        value: isNaN(value) ? 0 : value,
        originalValue: row[columnKey],
        category: columnKey,
        fullName: String(row[nameKey] || `Item ${index + 1}`)
      };
    }).filter(item => item.value !== 0);
  };

  // Chart type options
  const chartTypes = [
    { type: 'bar' as const, icon: BarChart3, label: 'Bar Chart', description: 'Compare categories' },
    { type: 'line' as const, icon: LineChart, label: 'Line Chart', description: 'Show trends' },
    { type: 'pie' as const, icon: PieChart, label: 'Pie Chart', description: 'Show proportions' },
    { type: 'area' as const, icon: Activity, label: 'Area Chart', description: 'Visualize volume' }
  ];

  const currentChartData = selectedColumn ? getChartData(selectedColumn) : [];

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <Card className="bg-gradient-to-r from-dashboard-primary/10 via-dashboard-secondary/5 to-dashboard-accent/10 border border-dashboard-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-dashboard-primary/20">
                <Database className="h-6 w-6 text-dashboard-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Data Dashboard</CardTitle>
                <p className="text-muted-foreground">{fileName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-dashboard-primary/20 text-dashboard-primary">
                {data.length.toLocaleString()} rows
              </Badge>
              <Badge variant="outline">
                {numericColumns.length} numeric columns
              </Badge>
              {onExport && (
                <Button variant="outline" size="sm" onClick={() => onExport('excel')}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Charts</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Data View</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Records"
              value={data.length.toLocaleString()}
              icon={<Database className="h-6 w-6" />}
              trend={0}
              subtitle="Data points"
            />
            {numericColumns.slice(0, 3).map((column) => (
              <KPICard
                key={column}
                title={column}
                value={kpis.sums?.[column]?.toLocaleString() || '0'}
                icon={<TrendingUp className="h-6 w-6" />}
                trend={0}
                subtitle={`Avg: ${kpis.averages?.[column]?.toFixed(2) || '0'}`}
              />
            ))}
          </div>

          {/* Quick Chart Previews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {numericColumns.slice(0, 2).map((column) => (
              <ChartGenerator
                key={column}
                data={getChartData(column)}
                title={`${column} Analysis`}
                type="bar"
                className="h-full"
              />
            ))}
          </div>
        </TabsContent>

        {/* Interactive Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          {/* Chart Builder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-dashboard-primary" />
                <span>Chart Builder</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Column Selection */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Select Data Column
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {numericColumns.map((column) => (
                    <Button
                      key={column}
                      variant={selectedColumn === column ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedColumn(column)}
                      className="justify-start"
                    >
                      {column}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Chart Type Selection */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Choose Chart Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {chartTypes.map(({ type, icon: Icon, label, description }) => (
                    <Card
                      key={type}
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedChartType === type
                          ? 'border-dashboard-primary bg-dashboard-primary/10'
                          : 'border-muted hover:border-dashboard-primary/50'
                      }`}
                      onClick={() => setSelectedChartType(type)}
                    >
                      <CardContent className="p-4 text-center space-y-2">
                        <Icon className={`h-8 w-8 mx-auto ${
                          selectedChartType === type 
                            ? 'text-dashboard-primary' 
                            : 'text-muted-foreground'
                        }`} />
                        <div>
                          <div className="font-medium text-sm">{label}</div>
                          <div className="text-xs text-muted-foreground">{description}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Chart */}
          {selectedColumn && (
            <ChartGenerator
              data={currentChartData}
              title={`${selectedColumn} - ${chartTypes.find(t => t.type === selectedChartType)?.label}`}
              type={selectedChartType}
            />
          )}

          {!selectedColumn && (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a Column to Start</h3>
                <p className="text-muted-foreground">
                  Choose a numeric column above to create your first chart
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Data View Tab */}
        <TabsContent value="data" className="space-y-6">
          <VirtualizedTable
            data={data}
            maxHeight={600}
            enableFilter={true}
            enableSort={true}
            enableSearch={true}
            enableExport={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};