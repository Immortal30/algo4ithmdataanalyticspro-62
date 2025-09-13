import { useState, useMemo } from "react";
import * as XLSX from 'xlsx';
import { FileUpload } from "@/components/FileUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VirtualizedTable } from "@/components/VirtualizedTable";
import { ChartGenerator } from "@/components/ChartGenerator";
import { GitCompare, BarChart3, Table, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <GitCompare className="h-8 w-8 text-dashboard-primary" />
          <div>
            <h1 className="text-3xl font-bold gradient-text">Data Comparison</h1>
            <p className="text-muted-foreground">Upload two files to compare their data side by side</p>
          </div>
        </div>
        {(file1Data.length > 0 || file2Data.length > 0) && (
          <Button onClick={clearFiles} variant="outline">
            Clear All Files
          </Button>
        )}
      </div>

      {/* File Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>File 1</span>
              {file1Name && <Badge variant="secondary">{file1Name}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onFileUpload={handleFile1Upload} isLoading={isLoading1} />
            {file1Data.length > 0 && (
              <div className="mt-4 p-4 bg-dashboard-success/10 rounded-lg border border-dashboard-success/30">
                <p className="text-sm text-dashboard-success">
                  ✓ {file1Data.length} records loaded
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>File 2</span>
              {file2Name && <Badge variant="secondary">{file2Name}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onFileUpload={handleFile2Upload} isLoading={isLoading2} />
            {file2Data.length > 0 && (
              <div className="mt-4 p-4 bg-dashboard-success/10 rounded-lg border border-dashboard-success/30">
                <p className="text-sm text-dashboard-success">
                  ✓ {file2Data.length} records loaded
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparison Results */}
      {comparisonMetrics && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="data">Data View</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="differences">Differences</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Table className="h-4 w-4 text-dashboard-primary" />
                    <div>
                      <p className="text-2xl font-bold">{comparisonMetrics.file1Records}</p>
                      <p className="text-sm text-muted-foreground">File 1 Records</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Table className="h-4 w-4 text-dashboard-accent" />
                    <div>
                      <p className="text-2xl font-bold">{comparisonMetrics.file2Records}</p>
                      <p className="text-sm text-muted-foreground">File 2 Records</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-dashboard-success" />
                    <div>
                      <p className="text-2xl font-bold">{comparisonMetrics.commonColumns}</p>
                      <p className="text-sm text-muted-foreground">Common Columns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-dashboard-warning" />
                    <div>
                      <p className="text-2xl font-bold">
                        {comparisonMetrics.uniqueToFile1 + comparisonMetrics.uniqueToFile2}
                      </p>
                      <p className="text-sm text-muted-foreground">Unique Columns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Numeric Comparisons */}
            {comparisonMetrics.numericComparisons.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Numeric Column Comparisons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {comparisonMetrics.numericComparisons.map((comparison) => (
                      <div key={comparison.column} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div>
                          <h4 className="font-semibold">{comparison.column}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>File 1 Avg: {comparison.file1Avg}</span>
                            <span>File 2 Avg: {comparison.file2Avg}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className={`h-4 w-4 ${comparison.isIncrease ? 'text-dashboard-success' : 'text-dashboard-destructive'} ${comparison.isIncrease ? '' : 'transform rotate-180'}`} />
                          <span className={`font-semibold ${comparison.isIncrease ? 'text-dashboard-success' : 'text-dashboard-destructive'}`}>
                            {comparison.isIncrease ? '+' : ''}{comparison.difference}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Data View Tab */}
          <TabsContent value="data" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{file1Name || 'File 1'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <VirtualizedTable data={file1Data.slice(0, 100)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{file2Name || 'File 2'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <VirtualizedTable data={file2Data.slice(0, 100)} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            {comparisonMetrics.numericComparisons.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {comparisonMetrics.numericComparisons.slice(0, 4).map((comparison) => {
                  const chartData = [
                    { name: file1Name || 'File 1', value: parseFloat(comparison.file1Avg) },
                    { name: file2Name || 'File 2', value: parseFloat(comparison.file2Avg) }
                  ];
                  
                  return (
                    <Card key={comparison.column}>
                      <CardHeader>
                        <CardTitle>{comparison.column} Comparison</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartGenerator
                          data={chartData}
                          title={`${comparison.column} Comparison`}
                          type="bar"
                          dataKey="value"
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Differences Tab */}
          <TabsContent value="differences" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-dashboard-success">Common Columns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {comparisonMetrics.columnDetails.common.map((col) => (
                      <Badge key={col} variant="secondary" className="mr-2 mb-2">
                        {col}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-dashboard-warning">Unique to File 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {comparisonMetrics.columnDetails.uniqueToFile1.map((col) => (
                      <Badge key={col} variant="destructive" className="mr-2 mb-2">
                        {col}
                      </Badge>
                    ))}
                    {comparisonMetrics.columnDetails.uniqueToFile1.length === 0 && (
                      <p className="text-sm text-muted-foreground">No unique columns</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-dashboard-warning">Unique to File 2</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {comparisonMetrics.columnDetails.uniqueToFile2.map((col) => (
                      <Badge key={col} variant="destructive" className="mr-2 mb-2">
                        {col}
                      </Badge>
                    ))}
                    {comparisonMetrics.columnDetails.uniqueToFile2.length === 0 && (
                      <p className="text-sm text-muted-foreground">No unique columns</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};