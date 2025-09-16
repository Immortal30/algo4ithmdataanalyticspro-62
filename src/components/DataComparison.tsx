import { useState, useMemo } from "react";
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { VirtualizedTable } from "@/components/VirtualizedTable";
import { ChartGenerator } from "@/components/ChartGenerator";
import { GitCompare, BarChart3, Table2, FileX, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ComparisonMetrics } from "./comparison/ComparisonMetrics";
import { NumericComparisons } from "./comparison/NumericComparisons";
import { ColumnDetails } from "./comparison/ColumnDetails";
import { FileUploadCard } from "./comparison/FileUploadCard";

interface DataComparisonProps {}

interface ComparisonData {
  [key: string]: any;
}

export const DataComparison = ({}: DataComparisonProps) => {
  const [file1Data, setFile1Data] = useState<ComparisonData[]>([]);
  const [file2Data, setFile2Data] = useState<ComparisonData[]>([]);
  const [file1Name, setFile1Name] = useState<string>("");
  const [file2Name, setFile2Name] = useState<string>("");
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const { toast } = useToast();

  const handleFile1Upload = async (file: File) => {
    setIsLoading1(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      setFile1Data(jsonData);
      setFile1Name(file.name);
      
      toast({
        title: "File 1 uploaded successfully!",
        description: `Loaded ${jsonData.length} records from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the first file",
        variant: "destructive",
      });
    } finally {
      setIsLoading1(false);
    }
  };

  const handleFile2Upload = async (file: File) => {
    setIsLoading2(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      setFile2Data(jsonData);
      setFile2Name(file.name);
      
      toast({
        title: "File 2 uploaded successfully!",
        description: `Loaded ${jsonData.length} records from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the second file",
        variant: "destructive",
      });
    } finally {
      setIsLoading2(false);
    }
  };

  // Calculate comparison metrics
  const comparisonMetrics = useMemo(() => {
    if (!file1Data.length || !file2Data.length) return null;

    const file1Columns = Object.keys(file1Data[0] || {});
    const file2Columns = Object.keys(file2Data[0] || {});
    
    const commonColumns = file1Columns.filter(col => file2Columns.includes(col));
    const uniqueToFile1 = file1Columns.filter(col => !file2Columns.includes(col));
    const uniqueToFile2 = file2Columns.filter(col => !file1Columns.includes(col));

    // Calculate numeric column differences
    const numericComparisons = commonColumns
      .filter(col => {
        const file1Values = file1Data.map(row => row[col]).filter(val => typeof val === 'number');
        const file2Values = file2Data.map(row => row[col]).filter(val => typeof val === 'number');
        return file1Values.length > 0 && file2Values.length > 0;
      })
      .map(col => {
        const file1Values = file1Data.map(row => row[col]).filter(val => typeof val === 'number');
        const file2Values = file2Data.map(row => row[col]).filter(val => typeof val === 'number');
        
        const file1Avg = file1Values.reduce((a, b) => a + b, 0) / file1Values.length;
        const file2Avg = file2Values.reduce((a, b) => a + b, 0) / file2Values.length;
        const difference = ((file2Avg - file1Avg) / file1Avg) * 100;

        return {
          column: col,
          file1Avg: file1Avg.toFixed(2),
          file2Avg: file2Avg.toFixed(2),
          difference: difference.toFixed(2),
          isIncrease: difference > 0
        };
      });

    return {
      file1Records: file1Data.length,
      file2Records: file2Data.length,
      commonColumns: commonColumns.length,
      uniqueToFile1: uniqueToFile1.length,
      uniqueToFile2: uniqueToFile2.length,
      numericComparisons,
      columnDetails: {
        common: commonColumns,
        uniqueToFile1,
        uniqueToFile2
      }
    };
  }, [file1Data, file2Data]);

  const clearFiles = () => {
    setFile1Data([]);
    setFile2Data([]);
    setFile1Name("");
    setFile2Name("");
    toast({
      title: "Files cleared",
      description: "All uploaded files have been removed",
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-dashboard-primary/20 to-dashboard-primary/10 flex items-center justify-center animate-pulse">
            <GitCompare className="h-7 w-7 text-dashboard-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Data Comparison Tool</h1>
            <p className="text-muted-foreground mt-1">Analyze differences and patterns between two datasets</p>
          </div>
        </div>
        {(file1Data.length > 0 || file2Data.length > 0) && (
          <Button 
            onClick={clearFiles} 
            variant="outline"
            className="group hover:border-dashboard-destructive/50 transition-all"
          >
            <RefreshCcw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Clear All Files
          </Button>
        )}
      </div>

      {/* File Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileUploadCard
          fileNumber={1}
          fileName={file1Name}
          dataLength={file1Data.length}
          isLoading={isLoading1}
          onFileUpload={handleFile1Upload}
        />
        <FileUploadCard
          fileNumber={2}
          fileName={file2Name}
          dataLength={file2Data.length}
          isLoading={isLoading2}
          onFileUpload={handleFile2Upload}
        />
      </div>

      {/* Comparison Results */}
      {comparisonMetrics && (
        <Tabs defaultValue="overview" className="w-full animate-fade-in">
          <TabsList className="grid w-full grid-cols-4 bg-dashboard-card/50 border border-dashboard-border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-dashboard-primary/10">
              Overview
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-dashboard-primary/10">
              Data View
            </TabsTrigger>
            <TabsTrigger value="charts" className="data-[state=active]:bg-dashboard-primary/10">
              Visualizations
            </TabsTrigger>
            <TabsTrigger value="differences" className="data-[state=active]:bg-dashboard-primary/10">
              Column Analysis
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <ComparisonMetrics 
              metrics={{
                file1Records: comparisonMetrics.file1Records,
                file2Records: comparisonMetrics.file2Records,
                commonColumns: comparisonMetrics.commonColumns,
                uniqueToFile1: comparisonMetrics.uniqueToFile1,
                uniqueToFile2: comparisonMetrics.uniqueToFile2
              }}
            />
            <NumericComparisons comparisons={comparisonMetrics.numericComparisons} />
          </TabsContent>

          {/* Data View Tab */}
          <TabsContent value="data" className="space-y-6 animate-fade-in">
            {file1Data.length === 0 && file2Data.length === 0 ? (
              <Card className="border-dashboard-border bg-dashboard-card/50">
                <CardContent className="p-12 text-center">
                  <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No data to display. Please upload files first.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {file1Data.length > 0 && (
                  <Card className="border-dashboard-primary/30 bg-gradient-to-br from-dashboard-card/50 to-dashboard-card">
                    <CardHeader className="border-b border-dashboard-border">
                      <CardTitle className="flex items-center gap-2">
                        <Table2 className="h-5 w-5 text-dashboard-primary" />
                        {file1Name || 'File 1 Data'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <VirtualizedTable data={file1Data.slice(0, 100)} />
                    </CardContent>
                  </Card>
                )}

                {file2Data.length > 0 && (
                  <Card className="border-dashboard-accent/30 bg-gradient-to-br from-dashboard-card/50 to-dashboard-card">
                    <CardHeader className="border-b border-dashboard-border">
                      <CardTitle className="flex items-center gap-2">
                        <Table2 className="h-5 w-5 text-dashboard-accent" />
                        {file2Name || 'File 2 Data'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <VirtualizedTable data={file2Data.slice(0, 100)} />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6 animate-fade-in">
            {comparisonMetrics.numericComparisons.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {comparisonMetrics.numericComparisons.slice(0, 6).map((comparison) => {
                  const chartData = [
                    { 
                      name: file1Name || 'File 1', 
                      value: parseFloat(comparison.file1Avg),
                      fill: 'hsl(var(--dashboard-primary))'
                    },
                    { 
                      name: file2Name || 'File 2', 
                      value: parseFloat(comparison.file2Avg),
                      fill: 'hsl(var(--dashboard-accent))'
                    }
                  ];
                  
                  return (
                    <Card 
                      key={comparison.column} 
                      className="border-dashboard-border bg-gradient-to-br from-dashboard-card/50 to-dashboard-card hover:shadow-elegant transition-all duration-300"
                    >
                      <CardHeader className="border-b border-dashboard-border">
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-dashboard-primary" />
                          {comparison.column}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <ChartGenerator
                          data={chartData}
                          title=""
                          type="bar"
                          dataKey="value"
                        />
                        <div className="mt-4 pt-4 border-t border-dashboard-border flex justify-between text-sm">
                          <span className="text-muted-foreground">Difference:</span>
                          <span className={`font-semibold ${
                            comparison.isIncrease ? 'text-dashboard-success' : 'text-dashboard-destructive'
                          }`}>
                            {comparison.isIncrease ? '+' : ''}{comparison.difference}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-dashboard-border bg-dashboard-card/50">
                <CardContent className="p-12 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No numeric columns available for chart visualization</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Differences Tab */}
          <TabsContent value="differences" className="animate-fade-in">
            <ColumnDetails columnDetails={comparisonMetrics.columnDetails} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};