import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ChartGenerator } from "@/components/ChartGenerator";
import { KPICard } from "@/components/KPICard";
import { ExcelAnalysis } from "@/components/ExcelAnalysis";
import { AIInsights } from "@/components/AIInsights";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { VirtualizedTable } from "@/components/VirtualizedTable";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Database, Activity, Brain, Calculator, AlertCircle, ExternalLink, Share2, Calendar, User, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LZString from 'lz-string';

interface ExcelData {
  [key: string]: any;
}

interface SharedData {
  title: string;
  description: string;
  message?: string;
  fileName: string;
  data: ExcelData[];
  formulas: string[];
  timestamp: string;
  totalRows: number;
  isLargeDataset?: boolean;
  isTruncated?: boolean;
}

const SharedDashboard = () => {
  const [searchParams] = useSearchParams();
  const [sharedData, setSharedData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadSharedData = () => {
      try {
        // Check for new short URL format first
        const idParam = searchParams.get('id');
        if (idParam) {
          // Load from localStorage using the short ID
          const storedData = localStorage.getItem(`dashboard_${idParam}`);
          if (!storedData) {
            setError("Shared dashboard not found or expired");
            setLoading(false);
            return;
          }

          let decodedData: SharedData;

          // 1) Try chunked format (metadata JSON)
          let maybeMeta: any = null;
          if (storedData.trim().startsWith('{')) {
            try {
              maybeMeta = JSON.parse(storedData);
            } catch {}
          }

          if (maybeMeta?.isChunked) {
            // Reconstruct chunked data
            const chunks: string[] = [];
            for (let i = 0; i < maybeMeta.totalChunks; i++) {
              const chunk = localStorage.getItem(`dashboard_${idParam}_chunk_${i}`);
              if (!chunk) throw new Error(`Missing chunk ${i}`);
              chunks.push(chunk);
            }
            const reconstructed = chunks.join('');
            const decompressed = LZString.decompressFromBase64(reconstructed);
            if (!decompressed) throw new Error('Failed to decompress chunked data');
            decodedData = JSON.parse(decompressed);
          } else {
            // 2) New compressed single-string format
            const decompressed = LZString.decompressFromBase64(storedData);
            if (decompressed) {
              decodedData = JSON.parse(decompressed);
            } else {
              // 3) Legacy base64-JSON format
              decodedData = JSON.parse(atob(storedData));
            }
          }
          
          // Validate the data structure
          if (!decodedData.data || !Array.isArray(decodedData.data)) {
            setError("Invalid shared data format");
            setLoading(false);
            return;
          }

          setSharedData(decodedData);
          setLoading(false);

          const recordCount = decodedData.data.length;
          const isLarge = recordCount > 10000;
          
          toast({
            title: "Dashboard Loaded Successfully",
            description: `${isLarge ? '🚀 ' : ''}Loaded ${recordCount.toLocaleString()} records${isLarge ? ' with advanced optimization' : ''}`
          });
          return;
        }

        // Fallback to old format for backward compatibility
        const dataParam = searchParams.get('d');
        if (!dataParam) {
          setError("No shared data found in the URL");
          setLoading(false);
          return;
        }

        const decodedData = JSON.parse(atob(dataParam)) as SharedData;
        
        // Validate the data structure
        if (!decodedData.data || !Array.isArray(decodedData.data)) {
          setError("Invalid shared data format");
          setLoading(false);
          return;
        }

        setSharedData(decodedData);
        setLoading(false);

        toast({
          title: "Dashboard Loaded",
          description: `Loaded shared dashboard with ${decodedData.data.length} records`
        });

      } catch (error) {
        console.error('Error loading shared data:', error);
        setError("Failed to load shared dashboard data");
        setLoading(false);
      }
    };

    loadSharedData();
  }, [searchParams, toast]);

  // Generate chart data from shared data - Show ALL data for complete visualization
  const getChartData = (key: string) => {
    if (!sharedData?.data.length) return [];
    
    return sharedData.data.map((row, index) => {
      const nameKey = Object.keys(row).find(k => k !== 'id' && k !== key) || 'name';
      const value = Number(row[key]) || 0;
      
      return {
        name: String(row[nameKey] || `Item ${index + 1}`).substring(0, 20), // Show more of the name
        value: isNaN(value) ? 0 : value,
        originalValue: row[key],
        category: key,
        fullName: String(row[nameKey] || `Item ${index + 1}`) // Keep full name for tooltips
      };
    }).filter(item => item.value !== 0);
  };

  // Get numeric columns for charts
  const getNumericColumns = () => {
    if (!sharedData?.data.length) return [];
    const firstRow = sharedData.data[0];
    return Object.keys(firstRow).filter(key => {
      const value = firstRow[key];
      return !isNaN(Number(value)) && value !== "" && key !== "id";
    });
  };

  // Calculate KPIs
  const calculateKPIs = () => {
    if (!sharedData?.data.length) return {};
    
    const { data } = sharedData;
    const numericColumns = getNumericColumns();
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dashboard-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading shared dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !sharedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Error Loading Dashboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || "Unable to load the shared dashboard."}
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link to="/">
                <ExternalLink className="h-4 w-4 mr-2" />
                Create Your Own Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpis = calculateKPIs();
  const numericColumns = getNumericColumns();
  const createdDate = new Date(sharedData.timestamp);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b border-glass-border bg-gradient-to-r from-glass-bg to-transparent backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-dashboard-primary to-dashboard-secondary">
                <Share2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{sharedData.title}</h1>
                <p className="text-muted-foreground">{sharedData.description}</p>
                {sharedData.message && (
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg border-l-4 border-dashboard-primary">
                    <p className="text-sm font-medium text-foreground">Personal Message:</p>
                    <p className="text-foreground">{sharedData.message}</p>
                  </div>
                )}
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{createdDate.toLocaleDateString()}</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Database className="h-3 w-3" />
                    <span>{sharedData.data.length.toLocaleString()} records</span>
                  </Badge>
                  {sharedData.isLargeDataset && (
                    <Badge variant="secondary" className="flex items-center space-x-1 bg-dashboard-primary/20 text-dashboard-primary">
                      <Zap className="h-3 w-3" />
                      <span>High Performance</span>
                    </Badge>
                  )}
                  {sharedData.totalRows > sharedData.data.length && (
                    <Badge variant="secondary">
                      {sharedData.isTruncated ? 'Fallback Mode: ' : ''}Showing {sharedData.data.length.toLocaleString()} of {sharedData.totalRows.toLocaleString()} total records
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/">
                <ExternalLink className="h-4 w-4 mr-2" />
                Create Your Own
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* File Info */}
        <Card className="bg-gradient-to-r from-dashboard-primary/10 to-dashboard-secondary/10 border border-dashboard-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Database className="h-8 w-8 text-dashboard-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Data Source: {sharedData.fileName}</h3>
                <p className="text-muted-foreground">
                  {sharedData.data.length} rows • {numericColumns.length} numeric columns • {sharedData.formulas.length} formulas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Interface */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-glass-bg/50 backdrop-blur-sm border border-glass-border">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-dashboard-primary data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-dashboard-primary data-[state=active]:text-white">
              <Zap className="h-4 w-4 mr-2" />
              Smart Analytics
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-dashboard-primary data-[state=active]:text-white">
              <Calculator className="h-4 w-4 mr-2" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-dashboard-primary data-[state=active]:text-white">
              <Activity className="h-4 w-4 mr-2" />
              Excel Analysis
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-dashboard-primary data-[state=active]:text-white">
              <Database className="h-4 w-4 mr-2" />
              Raw Data
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <KPICard
                title="Total Records"
                value={kpis.totalRows || 0}
                icon={<Database className="h-5 w-5" />}
                changeType="neutral"
              />
              <KPICard
                title="Data Quality"
                value={`${((sharedData.data.filter(row => Object.values(row).every(val => val !== null && val !== "")).length / sharedData.data.length) * 100).toFixed(1)}%`}
                icon={<Activity className="h-5 w-5" />}
                changeType="increase"
              />
              {numericColumns.slice(0, 3).map((col, index) => {
                const values = sharedData.data.map(row => Number(row[col]) || 0);
                const trend = values.length > 1 ? ((values[values.length - 1] - values[0]) / values[0]) * 100 : 0;
                
                return (
                  <KPICard
                    key={col}
                    title={`Avg ${col}`}
                    value={kpis.averages?.[col]?.toLocaleString(undefined, {maximumFractionDigits: 2}) || "0"}
                    change={Math.abs(trend)}
                    changeType={trend > 0 ? 'increase' : trend < 0 ? 'decrease' : 'neutral'}
                    icon={<BarChart3 className="h-5 w-5" />}
                  />
                );
              })}
            </div>

            {/* Charts */}
            {numericColumns.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {numericColumns.slice(0, 4).map((column, index) => {
                  // Cycle through different chart types for variety
                  const chartTypes: Array<'bar' | 'line' | 'area' | 'pie'> = ['bar', 'line', 'area', 'pie'];
                  const chartType = chartTypes[index % chartTypes.length];
                  
                  return (
                    <ChartGenerator
                      key={column}
                      data={getChartData(column)}
                      title={`${column} Analysis`}
                      type={chartType}
                    />
                  );
                })}
              </div>
            )}
            
            {/* Show more charts if there are more than 4 numeric columns */}
            {numericColumns.length > 4 && (
              <>
                <div className="flex items-center justify-center pt-4">
                  <h3 className="text-lg font-semibold text-foreground">Additional Data Analysis</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {numericColumns.slice(4, 8).map((column, index) => {
                    // Continue cycling through chart types for additional charts
                    const chartTypes: Array<'bar' | 'line' | 'area' | 'pie'> = ['pie', 'area', 'bar', 'line'];
                    const chartType = chartTypes[index % chartTypes.length];
                    
                    return (
                      <ChartGenerator
                        key={column}
                        data={getChartData(column)}
                        title={`${column} Breakdown`}
                        type={chartType}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6 mt-6">
            <AIInsights data={sharedData.data} numericColumns={numericColumns} />
          </TabsContent>

          {/* Advanced Analytics Tab */}
          <TabsContent value="advanced" className="space-y-6 mt-6">
            <AdvancedAnalytics data={sharedData.data} numericColumns={numericColumns} />
          </TabsContent>

          {/* Excel Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6 mt-6">
            <ExcelAnalysis data={sharedData.data} formulas={sharedData.formulas} worksheetData={null} />
          </TabsContent>

          {/* Raw Data Tab */}
          <TabsContent value="data" className="space-y-6 mt-6">
            {sharedData.data.length > 1000 && (
              <PerformanceMonitor 
                data={sharedData.data} 
                filteredData={sharedData.data} 
                renderStartTime={Date.now()} 
              />
            )}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Raw Data - All {sharedData.data.length.toLocaleString()} Records</CardTitle>
              </CardHeader>
              <CardContent>
                <VirtualizedTable data={sharedData.data} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="bg-muted/5">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              This dashboard was shared from{" "}
              <Button asChild variant="link" className="p-0 h-auto text-dashboard-primary">
                <Link to="/">Analytics Powered Dashboard</Link>
              </Button>
              {" "}• Create your own interactive dashboards from Excel files
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharedDashboard;