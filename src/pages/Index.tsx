import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import * as XLSX from 'xlsx';
import { FileUpload } from "@/components/FileUpload";
import { ChartGenerator } from "@/components/ChartGenerator";
import { KPICard } from "@/components/KPICard";
import { ExcelAnalysis } from "@/components/ExcelAnalysis";
import { AIInsights } from "@/components/AIInsights";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { AdvancedCharts } from "@/components/AdvancedCharts";
import { DataMindPro } from "@/components/DataMindPro";
import { DashboardExport } from "@/components/DashboardExport";
import { ShareDashboard } from "@/components/ShareDashboard";
import { DataDashboard } from "@/components/DataDashboard";
import { DataComparison } from "@/components/DataComparison";
import { VirtualizedTable } from "@/components/VirtualizedTable";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Database, Brain, Calculator, RefreshCw, Download, MessageSquare, Zap, GitCompare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExcelData {
  [key: string]: any;
}

const Index = () => {
  const [data, setData] = useState<ExcelData[]>([]);
  const [formulas, setFormulas] = useState<string[]>([]);
  const [worksheetData, setWorksheetData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Check for legacy shared data on component mount
  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const sharedData = JSON.parse(atob(dataParam));
        if (Array.isArray(sharedData) && sharedData.length > 0) {
          setData(sharedData);
          setFileName("Shared Dashboard Data");
          toast({
            title: "Shared Data Loaded",
            description: `Loaded ${sharedData.length} records from shared link`,
          });
        }
      } catch (error) {
        console.error('Error loading shared data:', error);
        toast({
          title: "Error",
          description: "Failed to load shared data from URL",
          variant: "destructive",
        });
      }
    }
  }, [searchParams, toast]);

  // Export functions
  const exportToCSV = () => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]).filter(key => key !== 'id');
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.xlsx', '')}_export.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({ title: "Success!", description: "Data exported to CSV" });
  };

  const exportToJSON = () => {
    if (!data.length) return;
    
    const jsonContent = JSON.stringify(data.map(row => {
      const { id, ...rest } = row;
      return rest;
    }), null, 2);
    
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.xlsx', '')}_export.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({ title: "Success!", description: "Data exported to JSON" });
  };

  const exportToExcel = () => {
    if (!data.length) return;
    
    try {
      // Clean and format the data
      const cleanedData = data.map((row, index) => {
        const cleanedRow: any = {};
        
        // Remove internal id field and clean data
        Object.keys(row).forEach(key => {
          if (key !== 'id') {
            let value = row[key];
            
            // Clean empty values
            if (value === null || value === undefined || value === '') {
              value = '';
            }
            // Format numbers properly
            else if (typeof value === 'number') {
              // Keep numbers as numbers for proper Excel formatting
              cleanedRow[key] = value;
            }
            // Clean string values
            else if (typeof value === 'string') {
              // Try to convert string numbers to actual numbers
              const numValue = Number(value);
              if (!isNaN(numValue) && value.trim() !== '') {
                cleanedRow[key] = numValue;
              } else {
                // Clean string data
                cleanedRow[key] = value.toString().trim();
              }
            }
            else {
              cleanedRow[key] = value;
            }
          }
        });
        
        return cleanedRow;
      });

      // Create worksheet with proper formatting
      const ws = XLSX.utils.json_to_sheet(cleanedData);
      
      // Get the range of the worksheet
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
      
      // Format headers with bold styling
      for (let col = range.s.c; col <= range.e.c; col++) {
        const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
        if (ws[headerCell]) {
          ws[headerCell].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "E6E6FA" } },
            alignment: { horizontal: "center" }
          };
        }
      }

      // Auto-size columns based on content
      const columnWidths: any[] = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        let maxWidth = 10; // Minimum width
        
        for (let row = range.s.r; row <= range.e.r; row++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = ws[cellAddress];
          if (cell && cell.v) {
            const cellWidth = cell.v.toString().length;
            maxWidth = Math.max(maxWidth, cellWidth);
          }
        }
        
        columnWidths.push({ width: Math.min(maxWidth + 2, 50) }); // Max width of 50
      }
      ws['!cols'] = columnWidths;

      // Add metadata sheet
      const metadata = [
        ['Export Information'],
        [''],
        ['Original File', fileName],
        ['Export Date', new Date().toLocaleDateString()],
        ['Export Time', new Date().toLocaleTimeString()],
        ['Total Records', data.length],
        ['Data Quality', `${((cleanedData.filter(row => Object.values(row).every(val => val !== '' && val !== null)).length / cleanedData.length) * 100).toFixed(1)}%`],
        [''],
        ['Column Summary'],
        ['Column Name', 'Data Type', 'Non-Empty Count', 'Sample Value']
      ];

      // Add column analysis
      const columns = Object.keys(cleanedData[0] || {});
      columns.forEach(col => {
        const values = cleanedData.map(row => row[col]).filter(val => val !== '' && val !== null);
        const nonEmptyCount = values.length;
        const sampleValue = values[0] || '';
        const dataType = typeof values[0] === 'number' ? 'Number' : 'Text';
        
        metadata.push([col, dataType, nonEmptyCount, sampleValue]);
      });

      const metadataWs = XLSX.utils.aoa_to_sheet(metadata);
      
      // Format metadata sheet
      metadataWs['A1'].s = { font: { bold: true, size: 14 } };
      metadataWs['A9'].s = { font: { bold: true } };
      
      // Create workbook with multiple sheets
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Cleaned Data");
      XLSX.utils.book_append_sheet(wb, metadataWs, "Export Info");

      // Set workbook properties
      wb.Props = {
        Title: `${fileName.replace('.xlsx', '')} - Cleaned Export`,
        Subject: "Data Export",
        Author: "Analytics Powered Dashboard",
        CreatedDate: new Date()
      };

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const exportFileName = `${fileName.replace('.xlsx', '')}_cleaned_${timestamp}.xlsx`;
      
      XLSX.writeFile(wb, exportFileName);
      
      toast({ 
        title: "Success!", 
        description: `Cleaned data exported as ${exportFileName}`,
      });

    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        title: "Export Failed",
        description: "Unable to export Excel file. Please try again.",
        variant: "destructive",
      });
    }
  };


  const processExcelFile = async (file: File) => {
    setIsLoading(true);
    setFileName(file.name);
    
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { 
        type: 'buffer',
        cellFormula: true,
        cellHTML: false,
        cellText: false
      });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      
      // Extract formulas
      const extractedFormulas: string[] = [];
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          if (cell && cell.f) {
            extractedFormulas.push(`${cellAddress}: ${cell.f}`);
          }
        }
      }
      
      setFormulas(extractedFormulas);
      setWorksheetData(worksheet);
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Convert to proper format
      const headers = jsonData[0] as string[];
      const processedData = (jsonData.slice(1) as any[][]).map((row, index) => {
        const rowData: ExcelData = { id: index };
        headers.forEach((header, colIndex) => {
          rowData[header] = row[colIndex] || 0;
        });
        return rowData;
      });
      
      setData(processedData);
      toast({
        title: "Success!",
        description: `Loaded ${processedData.length} rows from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process Excel file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate chart data from Excel data - Show ALL data for complete visualization
  const getChartData = (key: string) => {
    if (!data.length) return [];
    
    return data.map((row, index) => {
      const nameKey = Object.keys(row).find(k => k !== 'id' && k !== key) || 'name';
      const value = Number(row[key]) || 0;
      
      return {
        name: String(row[nameKey] || `Item ${index + 1}`).substring(0, 20), // Show more of the name
        value: isNaN(value) ? 0 : value,
        originalValue: row[key],
        category: key,
        fullName: String(row[nameKey] || `Item ${index + 1}`) // Keep full name for tooltips
      };
    }).filter(item => item.value !== 0); // Filter out zero values for better visualization
  };

  // Get numeric columns for charts
  const getNumericColumns = () => {
    if (!data.length) return [];
    const firstRow = data[0];
    return Object.keys(firstRow).filter(key => {
      const value = firstRow[key];
      return !isNaN(Number(value)) && value !== "" && key !== "id";
    });
  };

  // Calculate KPIs
  const calculateKPIs = () => {
    if (!data.length) return {};
    
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

  const kpis = calculateKPIs();
  const numericColumns = getNumericColumns();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b border-glass-border bg-gradient-to-r from-glass-bg to-transparent backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Refined animated logo */}
              <Link to="/" className="relative group cursor-pointer">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-dashboard-primary/30 to-dashboard-accent/30 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Main logo container */}
                <div className="relative p-3 rounded-xl bg-gradient-to-br from-card to-card/80 border border-dashboard-primary/20 group-hover:border-dashboard-primary/40 transition-all duration-300 group-hover:scale-105">
                  <div className="flex items-center space-x-3">
                    {/* Animated chart icon */}
                    <div className="relative">
                      <BarChart3 className="h-7 w-7 text-dashboard-primary transition-transform duration-300 group-hover:scale-110" />
                      {/* Subtle pulse animation */}
                      <div className="absolute inset-0 bg-dashboard-primary/20 rounded-lg animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Animated separator line */}
                    <div className="w-px h-8 bg-gradient-to-b from-transparent via-dashboard-primary/50 to-transparent group-hover:via-dashboard-primary transition-all duration-300"></div>
                    
                    {/* Simple animated dots */}
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-dashboard-primary rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-dashboard-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-dashboard-secondary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </Link>
              
              {/* Redesigned brand text */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <h1 className="text-4xl font-bold tracking-tight">
                      <span className="bg-gradient-to-r from-dashboard-primary via-dashboard-accent to-dashboard-secondary bg-clip-text text-transparent">
                        Analytics
                      </span>
                    </h1>
                    {/* PRO badge integrated into the text */}
                    <div className="absolute -top-1 -right-8 px-2 py-0.5 bg-gradient-to-r from-dashboard-primary to-dashboard-accent text-white text-xs font-bold rounded transform rotate-12 shadow-lg">
                      PRO
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-lg font-medium">
                  Transform your Excel data into beautiful, interactive dashboards
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {!data.length ? (
          <div className="max-w-4xl mx-auto">
            {/* Main Upload Section with Unique Design */}
            <div className="relative">
              {/* Floating background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-dashboard-primary/20 to-dashboard-accent/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-dashboard-secondary/20 to-dashboard-warning/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-dashboard-accent/20 to-dashboard-primary/20 rounded-full blur-2xl animate-pulse delay-500"></div>
              </div>
              
              {/* Main upload card */}
              <Card className="relative backdrop-blur-xl bg-gradient-to-br from-card/90 via-card/80 to-card/70 border-2 border-dashboard-primary/30 shadow-2xl hover:shadow-dashboard-primary/20 transition-all duration-500 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-dashboard-primary/5 via-dashboard-accent/5 to-dashboard-secondary/5 rounded-lg"></div>
                
                <CardContent className="relative z-10 p-12">
                  <div className="text-center space-y-8">
                    {/* Animated icon */}
                    <div className="relative mx-auto w-20 h-20">
                      <div className="absolute inset-0 bg-gradient-to-r from-dashboard-primary to-dashboard-accent rounded-full opacity-20 animate-ping"></div>
                      <div className="absolute inset-2 bg-gradient-to-r from-dashboard-primary/30 to-dashboard-accent/30 rounded-full animate-pulse"></div>
                      <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-dashboard-primary/20 to-dashboard-accent/20 rounded-full backdrop-blur-sm border border-dashboard-primary/40">
                        <Database className="h-8 w-8 text-dashboard-primary" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-4">
                      <h2 className="text-4xl font-bold bg-gradient-to-r from-dashboard-primary via-dashboard-accent to-dashboard-secondary bg-clip-text text-transparent">
                        Welcome to Analytics Pro
                      </h2>
                      <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Upload your Excel file and unlock powerful insights with our advanced analytics engine
                      </p>
                    </div>
                    
                    <FileUpload onFileUpload={processExcelFile} isLoading={isLoading} />
                    
                    {/* Features grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 pt-8 border-t border-dashboard-primary/20">
                      <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-gradient-to-br from-dashboard-primary/10 to-dashboard-accent/10 border border-dashboard-primary/20">
                        <BarChart3 className="h-6 w-6 text-dashboard-primary" />
                        <span className="text-sm font-medium text-foreground">Interactive Charts</span>
                      </div>
                      <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-gradient-to-br from-dashboard-accent/10 to-dashboard-secondary/10 border border-dashboard-accent/20">
                        <Brain className="h-6 w-6 text-dashboard-accent" />
                        <span className="text-sm font-medium text-foreground">Smart Analytics</span>
                      </div>
                      <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-gradient-to-br from-dashboard-secondary/10 to-dashboard-warning/10 border border-dashboard-secondary/20">
                        <TrendingUp className="h-6 w-6 text-dashboard-secondary" />
                        <span className="text-sm font-medium text-foreground">Advanced Analytics</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <>
            {/* File Info */}
            <Card className="bg-gradient-to-r from-dashboard-primary/10 to-dashboard-secondary/10 border border-dashboard-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Database className="h-8 w-8 text-dashboard-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">Data Source: {fileName}</h3>
                      <p className="text-muted-foreground">{data.length} rows • {numericColumns.length} numeric columns • {formulas.length} formulas</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    {/* Compact Upload Button with Unique Design */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-dashboard-accent to-dashboard-primary rounded-lg blur-md opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                      <div className="relative bg-gradient-to-r from-dashboard-accent/20 to-dashboard-primary/20 backdrop-blur-sm border border-dashboard-accent/30 rounded-lg p-2">
                        <FileUpload onFileUpload={processExcelFile} isLoading={isLoading} />
                      </div>
                    </div>
                    
                    {/* Refresh indicator */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-dashboard-primary/30 hover:bg-dashboard-primary/10"
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabbed Interface */}
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-8 bg-glass-bg/50 backdrop-blur-sm border border-glass-border">
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-dashboard-primary data-[state=active]:text-white">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="comparison" className="data-[state=active]:bg-dashboard-primary data-[state=active]:text-white">
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare Data
                </TabsTrigger>
                <TabsTrigger value="natural" className="data-[state=active]:bg-dashboard-primary data-[state=active]:text-white">
                  <Brain className="h-4 w-4 mr-2" />
                  DataMind Pro
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
                <TabsTrigger value="export" className="data-[state=active]:bg-dashboard-primary data-[state=active]:text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </TabsTrigger>
              </TabsList>


              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6 mt-6">
                {/* Action Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" onClick={() => setData([...data])}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>

                {/* Enhanced KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" data-export="kpi-cards">
                  <KPICard
                    title="Total Records"
                    value={kpis.totalRows || 0}
                    icon={<Database className="h-5 w-5" />}
                    changeType="neutral"
                  />
                  <KPICard
                    title="Data Quality"
                    value={`${((data.filter(row => Object.values(row).every(val => val !== null && val !== "")).length / data.length) * 100).toFixed(1)}%`}
                    icon={<Activity className="h-5 w-5" />}
                    changeType="increase"
                  />
                  {numericColumns.slice(0, 3).map((col, index) => {
                    const values = data.map(row => Number(row[col]) || 0);
                    const trend = values.length > 1 ? ((values[values.length - 1] - values[0]) / values[0]) * 100 : 0;
                    
                    return (
                      <KPICard
                        key={col}
                        title={`Avg ${col}`}
                        value={kpis.averages?.[col]?.toLocaleString(undefined, {maximumFractionDigits: 2}) || "0"}
                        change={Math.abs(trend)}
                        changeType={trend > 0 ? 'increase' : trend < 0 ? 'decrease' : 'neutral'}
                        icon={
                          index === 0 ? <DollarSign className="h-5 w-5" /> :
                          index === 1 ? <Users className="h-5 w-5" /> :
                          <TrendingUp className="h-5 w-5" />
                        }
                      />
                    );
                  })}
                </div>

                {/* Enhanced Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-export="charts-section">
                  {numericColumns.slice(0, 6).map((col, index) => {
                    const chartData = getChartData(col);
                    const chartTypes = ['bar', 'line', 'area', 'pie'] as const;
                    const chartType = chartTypes[index % chartTypes.length];
                    
                    return (
                      <ChartGenerator
                        key={`${col}-${index}`}
                        data={chartData}
                        title={`${col.replace(/([A-Z])/g, ' $1').trim()} Distribution`}
                        type={chartType}
                        dataKey="value"
                        className="animate-in fade-in-50 duration-500"
                      />
                    );
                  })}
                </div>

                {/* Enhanced Summary Statistics */}
                <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border" data-export="statistics-section">
                  <CardHeader>
                    <CardTitle>Statistical Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {numericColumns.map(col => {
                        const values = data.map(row => Number(row[col]) || 0).filter(v => !isNaN(v));
                        const sum = values.reduce((a, b) => a + b, 0);
                        const avg = sum / values.length;
                        const max = Math.max(...values);
                        const min = Math.min(...values);
                        const median = values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
                        const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
                        const stdDev = Math.sqrt(variance);
                        const nullCount = data.filter(row => !row[col] || isNaN(Number(row[col]))).length;
                        const completeness = ((data.length - nullCount) / data.length * 100);
                        
                        return (
                          <div key={col} className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-dashboard-primary/5 to-dashboard-secondary/5 border border-dashboard-primary/10">
                            <h4 className="font-semibold text-lg text-dashboard-primary">{col}</h4>
                            
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase tracking-wide">Central Tendency</span>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Mean:</span>
                                    <span className="font-medium">{avg.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Median:</span>
                                    <span className="font-medium">{median.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase tracking-wide">Spread</span>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Std Dev:</span>
                                    <span className="font-medium">{stdDev.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Range:</span>
                                    <span className="font-medium">{(max - min).toFixed(1)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Distribution Info */}
                            <div className="space-y-2">
                              <span className="text-xs text-muted-foreground uppercase tracking-wide">Distribution</span>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Min - Max:</span>
                                  <span className="font-medium">{min.toFixed(1)} - {max.toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Total:</span>
                                  <span className="font-medium">{sum.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Completeness:</span>
                                  <span className={`font-medium ${completeness > 90 ? 'text-green-600' : completeness > 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {completeness.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Quality Indicators */}
                            <div className="pt-2 border-t border-dashboard-primary/10">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Data Quality:</span>
                                <div className="flex space-x-1">
                                  <div className={`w-2 h-2 rounded-full ${completeness > 95 ? 'bg-green-500' : completeness > 80 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                  <div className={`w-2 h-2 rounded-full ${stdDev < avg * 0.5 ? 'bg-green-500' : stdDev < avg ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Overall Data Quality Summary */}
                    <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-dashboard-primary/10 to-dashboard-secondary/10 border border-dashboard-primary/20">
                      <h4 className="font-semibold mb-3 text-dashboard-primary">Overall Data Quality Assessment</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-dashboard-primary">{data.length}</div>
                          <div className="text-muted-foreground">Total Records</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-dashboard-secondary">{numericColumns.length}</div>
                          <div className="text-muted-foreground">Numeric Fields</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {((data.filter(row => Object.values(row).every(val => val !== null && val !== "")).length / data.length) * 100).toFixed(0)}%
                          </div>
                          <div className="text-muted-foreground">Complete Rows</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{formulas.length}</div>
                          <div className="text-muted-foreground">Excel Formulas</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Data Comparison Tab */}
              <TabsContent value="comparison" className="mt-6">
                <DataComparison />
              </TabsContent>

              {/* Natural Language to Formula Tab */}
              <TabsContent value="natural" className="mt-6">
                <DataMindPro data={data} fileName={fileName} />
              </TabsContent>

              {/* AI Insights Tab */}
              <TabsContent value="insights" className="mt-6">
                <AIInsights data={data} numericColumns={numericColumns} />
              </TabsContent>

              {/* Advanced Analytics Tab */}
              <TabsContent value="advanced" className="mt-6">
                <AdvancedAnalytics data={data} numericColumns={numericColumns} />
                
                {/* Advanced Charts - Pie, Donut, Radar, Treemap, Funnel, Time Series */}
                <AdvancedCharts 
                  data={data} 
                  columns={Object.keys(data[0] || {})} 
                  selectedColumn={numericColumns[0]}
                />
              </TabsContent>

              {/* Analysis Tab */}
              <TabsContent value="analysis" className="mt-6">
                <ExcelAnalysis 
                  data={data}
                  formulas={formulas}
                  worksheetData={worksheetData}
                />
              </TabsContent>

              {/* Data Tab */}
              <TabsContent value="data" className="mt-6">
                <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2 text-foreground">
                        <Database className="h-5 w-5 text-dashboard-primary" />
                        <span>High Performance Data View</span>
                        <Badge variant="secondary" className="bg-dashboard-primary/20 text-dashboard-primary">
                          Handles 50K+ rows
                        </Badge>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 text-sm text-muted-foreground">
                      Advanced virtualized table for optimal performance with large datasets
                    </div>
                    <VirtualizedTable 
                      data={data} 
                      maxHeight={600}
                      enableFilter={true}
                      enableSort={true}
                      enableSearch={true}
                      enableExport={true}
                      className="w-full"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Export Tab */}
              <TabsContent value="export" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
                    <CardHeader>
                      <CardTitle>Export Data</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full" variant="outline" onClick={exportToCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export as CSV
                      </Button>
                      <Button className="w-full" variant="outline" onClick={exportToExcel}>
                        <Download className="h-4 w-4 mr-2" />
                        Export as Excel
                      </Button>
                      <Button className="w-full" variant="outline" onClick={exportToJSON}>
                        <Download className="h-4 w-4 mr-2" />
                        Export as JSON
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
                    <CardHeader>
                      <CardTitle>Export Charts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <DashboardExport fileName={fileName} data={data} />
                      <Button className="w-full" variant="outline" disabled>
                        <Download className="h-4 w-4 mr-2" />
                        Export as SVG
                      </Button>
                    </CardContent>
                  </Card>

                  <ShareDashboard data={data} fileName={fileName} formulas={formulas} />
                </div>
              </TabsContent>
            </Tabs>
            </>
            )}
      </div>
    </div>
  );
};

export default Index;
