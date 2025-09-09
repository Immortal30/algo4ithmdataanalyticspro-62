import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, 
  Copy, 
  AlertTriangle, 
  CheckCircle, 
  BarChart, 
  Hash,
  Target,
  TrendingUp,
  FileSpreadsheet,
  Zap,
  Shield,
  Layers,
  Brain,
  Search,
  Eye,
  PieChart,
  Activity
} from "lucide-react";
import { useState } from "react";

interface ExcelAnalysisProps {
  data: any[];
  formulas: string[];
  worksheetData: any;
}

export const ExcelAnalysis = ({ data, formulas, worksheetData }: ExcelAnalysisProps) => {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

  // Enhanced duplicate analysis with clustering
  const findDuplicates = () => {
    if (!data.length) return { count: 0, examples: [], clusters: [] };
    
    const seen = new Map();
    const duplicates: any[] = [];
    const clusters: Record<string, any[]> = {};
    
    data.forEach((row, index) => {
      const rowKey = JSON.stringify(row);
      if (seen.has(rowKey)) {
        duplicates.push({ index: index + 1, data: row });
        if (!clusters[rowKey]) {
          clusters[rowKey] = [seen.get(rowKey)];
        }
        clusters[rowKey].push(index + 1);
      } else {
        seen.set(rowKey, index + 1);
      }
    });
    
    return {
      count: duplicates.length,
      examples: duplicates.slice(0, 3),
      clusters: Object.values(clusters).filter(cluster => cluster.length > 1)
    };
  };

  // Advanced data profiling
  const performDataProfiling = () => {
    if (!data.length) return {};
    
    const columns = Object.keys(data[0]).filter(key => key !== 'id');
    const profile: Record<string, any> = {};
    
    columns.forEach(col => {
      const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== "");
      const allValues = data.map(row => row[col]);
      
      // Detect data types
      const isNumeric = values.every(v => !isNaN(Number(v)));
      const isDate = values.every(v => !isNaN(Date.parse(v)));
      const isBool = values.every(v => typeof v === 'boolean' || v === 'true' || v === 'false' || v === '1' || v === '0');
      
      // Calculate patterns
      const patterns = new Map();
      values.forEach(v => {
        const pattern = String(v).replace(/\d/g, 'N').replace(/[a-zA-Z]/g, 'A');
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
      });
      
      // Outlier detection for numeric data
      let outliers = [];
      if (isNumeric && values.length > 0) {
        const numbers = values.map(v => Number(v)).sort((a, b) => a - b);
        const q1 = numbers[Math.floor(numbers.length * 0.25)];
        const q3 = numbers[Math.floor(numbers.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        
        outliers = numbers.filter(n => n < lowerBound || n > upperBound);
      }
      
      profile[col] = {
        dataType: isNumeric ? 'numeric' : isDate ? 'date' : isBool ? 'boolean' : 'text',
        uniqueValues: new Set(values).size,
        totalValues: allValues.length,
        missingValues: allValues.filter(v => v === null || v === undefined || v === "").length,
        patterns: Array.from(patterns.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3),
        outliers: outliers.length,
        consistency: (values.length / allValues.length * 100).toFixed(1)
      };
      
      if (isNumeric && values.length > 0) {
        const numbers = values.map(v => Number(v));
        const sum = numbers.reduce((a, b) => a + b, 0);
        const mean = sum / numbers.length;
        const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numbers.length;
        
        profile[col] = {
          ...profile[col],
          min: Math.min(...numbers),
          max: Math.max(...numbers),
          mean: mean,
          median: numbers.sort((a, b) => a - b)[Math.floor(numbers.length / 2)],
          standardDeviation: Math.sqrt(variance),
          skewness: calculateSkewness(numbers, mean, Math.sqrt(variance))
        };
      }
    });
    
    return profile;
  };

  // Calculate skewness for distribution analysis
  const calculateSkewness = (numbers: number[], mean: number, stdDev: number) => {
    if (stdDev === 0) return 0;
    const n = numbers.length;
    const skewness = numbers.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 3), 0) / n;
    return skewness;
  };

  // Excel-specific analysis
  const analyzeExcelFeatures = () => {
    const features = {
      hasFormulas: formulas.length > 0,
      formulaTypes: new Set(),
      referencesExternal: false,
      hasNamedRanges: false,
      hasConditionalFormatting: false,
      complexity: 'simple'
    };

    formulas.forEach(formula => {
      const f = formula.split(': ')[1] || formula;
      if (f.includes('SUM(')) features.formulaTypes.add('SUM');
      if (f.includes('AVERAGE(')) features.formulaTypes.add('AVERAGE');
      if (f.includes('VLOOKUP(')) features.formulaTypes.add('VLOOKUP');
      if (f.includes('IF(')) features.formulaTypes.add('IF');
      if (f.includes('COUNTIF(')) features.formulaTypes.add('COUNTIF');
      if (f.includes('[')) features.referencesExternal = true;
    });

    if (formulas.length > 10) features.complexity = 'complex';
    else if (formulas.length > 5) features.complexity = 'moderate';

    return features;
  };

  const duplicateAnalysis = findDuplicates();
  const dataProfile = performDataProfiling();
  const excelFeatures = analyzeExcelFeatures();
  const totalCells = data.length * (Object.keys(data[0] || {}).length - 1);
  const totalMissing = Object.values(dataProfile).reduce((acc: number, col: any) => acc + (col.missingValues || 0), 0);
  const dataQuality = ((totalCells - totalMissing) / totalCells * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Excel Intelligence Overview */}
      <Card className="bg-gradient-to-br from-dashboard-primary/10 via-dashboard-secondary/5 to-dashboard-accent/10 border border-dashboard-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-dashboard-primary">
            <Brain className="h-6 w-6" />
            <span>Excel Intelligence Analysis</span>
            <Badge variant="secondary" className="bg-dashboard-primary/20 text-dashboard-primary">
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
              <div className="text-3xl font-bold text-green-600">{dataQuality}%</div>
              <div className="text-sm text-muted-foreground">Data Quality Score</div>
              <Progress value={Number(dataQuality)} className="mt-2 h-2" />
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
              <div className="text-3xl font-bold text-blue-600">{formulas.length}</div>
              <div className="text-sm text-muted-foreground">Excel Formulas</div>
              <div className="text-xs text-blue-600 mt-1">{excelFeatures.complexity} complexity</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
              <div className="text-3xl font-bold text-purple-600">{Object.keys(dataProfile).length}</div>
              <div className="text-sm text-muted-foreground">Data Columns</div>
              <div className="text-xs text-purple-600 mt-1">Multi-type analysis</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
              <div className="text-3xl font-bold text-amber-600">{duplicateAnalysis.clusters.length}</div>
              <div className="text-sm text-muted-foreground">Data Clusters</div>
              <div className="text-xs text-amber-600 mt-1">Duplicate groups</div>
            </div>
          </div>

          {/* Excel Features Detection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-glass-bg/50 border border-glass-border">
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <FileSpreadsheet className="h-4 w-4 text-dashboard-primary" />
                <span>Excel Features Detected</span>
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Formula Functions:</span>
                  <div className="flex space-x-1">
                    {Array.from(excelFeatures.formulaTypes).map((type: any) => (
                      <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">External References:</span>
                  <Badge variant={excelFeatures.referencesExternal ? "destructive" : "secondary"}>
                    {excelFeatures.referencesExternal ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Complexity Level:</span>
                  <Badge variant={excelFeatures.complexity === 'complex' ? "destructive" : excelFeatures.complexity === 'moderate' ? "default" : "secondary"}>
                    {excelFeatures.complexity}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-glass-bg/50 border border-glass-border">
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Data Integrity Assessment</span>
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Duplicate Detection:</span>
                  <Badge variant={duplicateAnalysis.count > 0 ? "destructive" : "secondary"}>
                    {duplicateAnalysis.count > 0 ? `${duplicateAnalysis.count} found` : "Clean"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Missing Data:</span>
                  <Badge variant={totalMissing > totalCells * 0.1 ? "destructive" : totalMissing > 0 ? "default" : "secondary"}>
                    {((totalMissing / totalCells) * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Consistency:</span>
                  <Badge variant={Number(dataQuality) > 95 ? "secondary" : Number(dataQuality) > 80 ? "default" : "destructive"}>
                    {Number(dataQuality) > 95 ? "Excellent" : Number(dataQuality) > 80 ? "Good" : "Needs Review"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Advanced Formula Analysis */}
        <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <Zap className="h-5 w-5 text-dashboard-primary" />
              <span>Formula Intelligence</span>
              <Badge variant="secondary">{formulas.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formulas.length > 0 ? (
              <div className="space-y-4">
                {/* Formula Complexity Meter */}
                <div className="p-3 rounded-lg bg-dashboard-primary/5 border border-dashboard-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Complexity Analysis</span>
                    <Badge variant={excelFeatures.complexity === 'complex' ? "destructive" : excelFeatures.complexity === 'moderate' ? "default" : "secondary"}>
                      {excelFeatures.complexity}
                    </Badge>
                  </div>
                  <Progress 
                    value={excelFeatures.complexity === 'simple' ? 30 : excelFeatures.complexity === 'moderate' ? 60 : 90} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Based on formula count and function types
                  </div>
                </div>

                {/* Formula Examples */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Formula Examples:</span>
                    <Button variant="outline" size="sm" onClick={() => setShowAdvancedStats(!showAdvancedStats)}>
                      <Eye className="h-3 w-3 mr-1" />
                      {showAdvancedStats ? "Hide" : "Show"} Details
                    </Button>
                  </div>
                  
                  {formulas.slice(0, showAdvancedStats ? formulas.length : 5).map((formula, index) => {
                    const [cell, formulaText] = formula.split(': ');
                    const complexity = formulaText?.length > 50 ? 'complex' : formulaText?.length > 20 ? 'moderate' : 'simple';
                    
                    return (
                      <div key={index} className="p-3 rounded-lg bg-muted/20 border border-muted-foreground/10 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-dashboard-primary">{cell}</span>
                          <Badge variant="outline" className="text-xs">
                            {complexity}
                          </Badge>
                        </div>
                        <div className="font-mono text-sm text-foreground break-all bg-background/50 p-2 rounded">
                          {formulaText}
                        </div>
                      </div>
                    );
                  })}
                  
                  {!showAdvancedStats && formulas.length > 5 && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      ... and {formulas.length - 5} more formulas
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No formulas detected</p>
                <p className="text-sm">This file contains static data values only</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Smart Duplicate Analysis */}
        <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <Layers className="h-5 w-5 text-dashboard-secondary" />
              <span>Duplicate Intelligence</span>
              <Badge variant={duplicateAnalysis.count > 0 ? "destructive" : "secondary"}>
                {duplicateAnalysis.count} found
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {duplicateAnalysis.count > 0 ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center space-x-2 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {duplicateAnalysis.clusters.length} duplicate clusters detected
                    </span>
                  </div>
                  <div className="text-xs text-amber-600/80 mt-1">
                    Affecting {duplicateAnalysis.count} rows ({((duplicateAnalysis.count / data.length) * 100).toFixed(1)}% of data)
                  </div>
                </div>

                {/* Cluster Analysis */}
                <div className="space-y-3">
                  <span className="text-sm font-medium">Duplicate Clusters:</span>
                  {duplicateAnalysis.clusters.slice(0, 3).map((cluster: any, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/20 border border-muted-foreground/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-dashboard-secondary">
                          Cluster #{index + 1}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {cluster.length} rows
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rows: {cluster.join(', ')}
                      </div>
                    </div>
                  ))}
                  
                  {duplicateAnalysis.clusters.length > 3 && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      ... and {duplicateAnalysis.clusters.length - 3} more clusters
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>No duplicates found</p>
                <p className="text-sm">All data rows are unique</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Data Profiling */}
      <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <Activity className="h-5 w-5 text-dashboard-accent" />
            <span>Advanced Data Profiling</span>
            <Button variant="outline" size="sm" onClick={() => setSelectedColumn(selectedColumn ? null : Object.keys(dataProfile)[0])}>
              <Search className="h-3 w-3 mr-1" />
              {selectedColumn ? "Hide Details" : "Explore Column"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(dataProfile).map(([column, stats]: [string, any]) => (
              <div 
                key={column} 
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedColumn === column 
                    ? 'border-dashboard-primary bg-dashboard-primary/10' 
                    : 'border-muted-foreground/10 bg-muted/5 hover:bg-muted/10'
                }`}
                onClick={() => setSelectedColumn(selectedColumn === column ? null : column)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-foreground truncate">{column}</h4>
                  <div className="flex space-x-1">
                    <Badge variant={stats.dataType === 'numeric' ? 'default' : 'secondary'} className="text-xs">
                      {stats.dataType}
                    </Badge>
                    {stats.outliers > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {stats.outliers} outliers
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unique:</span>
                    <span className="font-medium">{stats.uniqueValues}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completeness:</span>
                    <span className={`font-medium ${Number(stats.consistency) > 90 ? 'text-green-600' : Number(stats.consistency) > 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {stats.consistency}%
                    </span>
                  </div>
                  
                  {stats.dataType === 'numeric' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Range:</span>
                        <span className="font-medium">{stats.min?.toFixed(1)} - {stats.max?.toFixed(1)}</span>
                      </div>
                      
                      {selectedColumn === column && (
                        <>
                          <Separator className="my-2" />
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Mean:</span>
                              <span>{stats.mean?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Median:</span>
                              <span>{stats.median?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Std Dev:</span>
                              <span>{stats.standardDeviation?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Skewness:</span>
                              <span className={stats.skewness > 1 ? 'text-yellow-600' : stats.skewness < -1 ? 'text-yellow-600' : 'text-green-600'}>
                                {stats.skewness?.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                  
                  {stats.missingValues > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span>Missing:</span>
                      <span className="font-medium">{stats.missingValues}</span>
                    </div>
                  )}
                  
                  {selectedColumn === column && stats.patterns.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Common Patterns:</span>
                        {stats.patterns.map(([pattern, count]: [string, number]) => (
                          <div key={pattern} className="flex justify-between text-xs">
                            <span className="font-mono">{pattern}</span>
                            <span>{count}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};