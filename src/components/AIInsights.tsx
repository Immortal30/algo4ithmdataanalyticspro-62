import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExcelData {
  [key: string]: any;
}

interface AIInsightsProps {
  data: ExcelData[];
  numericColumns: string[];
}

interface Insight {
  type: 'trend' | 'anomaly' | 'correlation' | 'prediction' | 'optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action?: string;
  value?: string | number;
}

export const AIInsights = ({ data, numericColumns }: AIInsightsProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeData = () => {
    if (!data.length || !numericColumns.length) return [];

    const generatedInsights: Insight[] = [];

    // Advanced Data Quality Analysis
    const uniqueValuesInsight = analyzeUniqueValues();
    if (uniqueValuesInsight) generatedInsights.push(uniqueValuesInsight);

    // Distribution Analysis
    const distributionInsights = analyzeDistributions();
    generatedInsights.push(...distributionInsights);

    // Seasonal Pattern Detection
    const seasonalInsights = detectSeasonalPatterns();
    generatedInsights.push(...seasonalInsights);

    // Growth Rate Analysis
    const growthInsights = analyzeGrowthRates();
    generatedInsights.push(...growthInsights);

    // Value Concentration Analysis
    const concentrationInsights = analyzeValueConcentration();
    generatedInsights.push(...concentrationInsights);

    // Cross-Column Pattern Analysis
    const patternInsights = analyzeCrossColumnPatterns();
    generatedInsights.push(...patternInsights);

    // Trend Analysis (Enhanced)
    numericColumns.forEach(column => {
      const values = data.map(row => Number(row[column]) || 0);
      const trend = calculateTrend(values);
      const volatility = calculateVolatility(values);
      
      if (Math.abs(trend) > 0.05) {
        generatedInsights.push({
          type: 'trend',
          title: `${column} shows ${trend > 0 ? 'upward' : 'downward'} trend ${volatility > 0.3 ? '(volatile)' : '(stable)'}`,
          description: `${column} has a ${trend > 0 ? 'positive' : 'negative'} trend of ${(trend * 100).toFixed(1)}% with ${volatility > 0.3 ? 'high' : 'low'} volatility`,
          impact: Math.abs(trend) > 0.3 ? 'high' : Math.abs(trend) > 0.15 ? 'medium' : 'low',
          action: trend > 0 ? (volatility > 0.3 ? 'Monitor for sustainability' : 'Capitalize on growth') : 'Investigate decline causes',
          value: `${(trend * 100).toFixed(1)}%`
        });
      }
    });

    // Smart Anomaly Detection
    numericColumns.forEach(column => {
      const values = data.map(row => Number(row[column]) || 0);
      const anomalies = detectSmartAnomalies(values);
      
      if (anomalies.outliers.length > 0) {
        const severity = anomalies.outliers.length > values.length * 0.1 ? 'severe' : 'moderate';
        generatedInsights.push({
          type: 'anomaly',
          title: `${anomalies.outliers.length} ${severity} outliers in ${column}`,
          description: `Found ${anomalies.outliers.length} data points deviating by ${anomalies.avgDeviation.toFixed(1)}σ from the mean`,
          impact: severity === 'severe' ? 'high' : 'medium',
          action: `${severity === 'severe' ? 'Immediate review required' : 'Schedule data validation'}`,
          value: `${anomalies.outliers.length} points`
        });
      }
    });

    // Enhanced Correlation Analysis
    if (numericColumns.length >= 2) {
      const correlations = findAllCorrelations();
      correlations.forEach(corr => {
        if (Math.abs(corr.value) > 0.6) {
          const strength = Math.abs(corr.value) > 0.8 ? 'very strong' : 'strong';
          generatedInsights.push({
            type: 'correlation',
            title: `${strength} ${corr.value > 0 ? 'positive' : 'negative'} correlation: ${corr.col1} ↔ ${corr.col2}`,
            description: `${corr.col1} and ${corr.col2} show a ${strength} ${corr.value > 0 ? 'positive' : 'inverse'} relationship (r=${corr.value.toFixed(3)})`,
            impact: Math.abs(corr.value) > 0.8 ? 'high' : 'medium',
            action: corr.value > 0 ? 'Use for predictive modeling' : 'Investigate inverse relationship',
            value: `r=${corr.value.toFixed(3)}`
          });
        }
      });
    }

    // Performance Benchmarking
    numericColumns.forEach(column => {
      const benchmarkInsight = analyzeBenchmark(column);
      if (benchmarkInsight) generatedInsights.push(benchmarkInsight);
    });

    // Advanced Predictions
    numericColumns.forEach(column => {
      const predictionInsight = generateAdvancedPrediction(column);
      if (predictionInsight) generatedInsights.push(predictionInsight);
    });

    return generatedInsights.sort((a, b) => {
      const impactWeight = { high: 3, medium: 2, low: 1 };
      return impactWeight[b.impact] - impactWeight[a.impact];
    });
  };

  const calculateVolatility = (values: number[]): number => {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return mean !== 0 ? stdDev / Math.abs(mean) : 0;
  };

  const detectSmartAnomalies = (values: number[]) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const threshold = 2.5 * stdDev; // More sensitive threshold
    
    const outliers = values.filter(val => Math.abs(val - mean) > threshold);
    const avgDeviation = outliers.length > 0 
      ? outliers.reduce((acc, val) => acc + Math.abs(val - mean), 0) / (outliers.length * stdDev)
      : 0;
    
    return { outliers, avgDeviation };
  };

  const findAllCorrelations = () => {
    const correlations = [];
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];
        const correlation = calculateCorrelation(
          data.map(row => Number(row[col1]) || 0),
          data.map(row => Number(row[col2]) || 0)
        );
        correlations.push({ col1, col2, value: correlation });
      }
    }
    return correlations;
  };

  const analyzeDistribution = (values: number[]) => {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    // Calculate skewness
    const skewness = values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 3), 0) / n;
    
    // Calculate kurtosis
    const kurtosis = values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 4), 0) / n;
    
    return { skewness, kurtosis };
  };

  const analyzeBenchmark = (column: string): Insight | null => {
    const values = data.map(row => Number(row[column]) || 0);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const performance = max !== 0 ? (avg / max) * 100 : 0;
    
    if (performance < 40) {
      return {
        type: 'optimization' as const,
        title: `${column} shows significant optimization opportunity`,
        description: `Current average (${avg.toFixed(1)}) is only ${performance.toFixed(1)}% of best performance (${max.toFixed(1)})`,
        impact: 'high' as const,
        action: 'Analyze top 10% performers to identify success factors',
        value: `${performance.toFixed(1)}% efficiency`
      };
    }
    return null;
  };

  const generateAdvancedPrediction = (column: string): Insight | null => {
    const values = data.map(row => Number(row[column]) || 0);
    if (values.length < 5) return null;
    
    const prediction = predictNextValue(values);
    const currentAvg = values.reduce((a, b) => a + b, 0) / values.length;
    const recentTrend = calculateTrend(values.slice(-Math.min(5, values.length)));
    const confidence = Math.max(0.3, 1 - calculateVolatility(values));
    
    const change = currentAvg !== 0 ? ((prediction - currentAvg) / currentAvg) * 100 : 0;
    
    if (Math.abs(change) > 8) {
      return {
        type: 'prediction' as const,
        title: `${column} forecasted ${change > 0 ? 'growth' : 'decline'} (${(confidence * 100).toFixed(0)}% confidence)`,
        description: `Model predicts ${Math.abs(change).toFixed(1)}% ${change > 0 ? 'increase' : 'decrease'} based on recent ${recentTrend > 0 ? 'upward' : 'downward'} momentum`,
        impact: Math.abs(change) > 25 ? 'high' as const : 'medium' as const,
        action: change > 0 ? 'Prepare scaling strategies' : 'Develop contingency plans',
        value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
      };
    }
    return null;
  };

  const analyzeUniqueValues = (): Insight | null => {
    const allColumns = Object.keys(data[0] || {});
    const uniqueAnalysis = allColumns.map(col => {
      const values = data.map(row => row[col]);
      const unique = new Set(values).size;
      return { column: col, unique, total: values.length, ratio: unique / values.length };
    });

    const mostUnique = uniqueAnalysis.find(col => col.ratio > 0.9 && col.total > 10);
    if (mostUnique) {
      return {
        type: 'optimization',
        title: `${mostUnique.column} contains mostly unique values`,
        description: `${mostUnique.column} has ${mostUnique.unique} unique values out of ${mostUnique.total} records (${(mostUnique.ratio * 100).toFixed(1)}% uniqueness)`,
        impact: 'medium',
        action: 'Consider using as a primary identifier or grouping key',
        value: `${(mostUnique.ratio * 100).toFixed(1)}% unique`
      };
    }
    return null;
  };

  const analyzeDistributions = () => {
    const insights: Insight[] = [];
    
    numericColumns.forEach(column => {
      const values = data.map(row => Number(row[column]) || 0);
      const distribution = analyzeDistribution(values);
      
      if (distribution.skewness > 1.5) {
        insights.push({
          type: 'anomaly',
          title: `${column} shows heavy right skew`,
          description: `${column} distribution is heavily skewed (skewness: ${distribution.skewness.toFixed(2)}), indicating potential outliers or exponential growth`,
          impact: 'medium',
          action: 'Consider log transformation or outlier investigation',
          value: `skew: ${distribution.skewness.toFixed(2)}`
        });
      }
      
      if (distribution.kurtosis > 3) {
        insights.push({
          type: 'anomaly',
          title: `${column} has high concentration around mean`,
          description: `${column} shows high kurtosis (${distribution.kurtosis.toFixed(2)}), indicating data clustering around central values`,
          impact: 'low',
          action: 'Investigate factors causing data concentration',
          value: `kurtosis: ${distribution.kurtosis.toFixed(2)}`
        });
      }
    });
    
    return insights;
  };

  const detectSeasonalPatterns = () => {
    const insights: Insight[] = [];
    
    // Look for date columns
    const dateColumns = Object.keys(data[0] || {}).filter(col => {
      const sample = data[0][col];
      return typeof sample === 'string' && (
        sample.includes('/') || sample.includes('-') || sample.includes('.')
      );
    });

    if (dateColumns.length > 0 && numericColumns.length > 0) {
      insights.push({
        type: 'prediction',
        title: `Potential time-series patterns detected`,
        description: `Found date column(s): ${dateColumns.join(', ')}. Time-based analysis could reveal seasonal trends in your numeric data`,
        impact: 'medium',
        action: 'Sort by date and analyze temporal patterns',
        value: `${dateColumns.length} date columns`
      });
    }
    
    return insights;
  };

  const analyzeGrowthRates = () => {
    const insights: Insight[] = [];
    
    numericColumns.forEach(column => {
      const values = data.map(row => Number(row[column]) || 0);
      if (values.length < 3) return;
      
      const growthRates = [];
      for (let i = 1; i < values.length; i++) {
        if (values[i-1] !== 0) {
          growthRates.push((values[i] - values[i-1]) / values[i-1]);
        }
      }
      
      if (growthRates.length > 0) {
        const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
        const growthVolatility = calculateVolatility(growthRates);
        
        if (Math.abs(avgGrowth) > 0.1) {
          insights.push({
            type: 'trend',
            title: `${column} growth rate: ${avgGrowth > 0 ? 'accelerating' : 'decelerating'}`,
            description: `Average period-over-period growth of ${(avgGrowth * 100).toFixed(1)}% with ${growthVolatility > 0.5 ? 'high' : 'low'} volatility`,
            impact: Math.abs(avgGrowth) > 0.3 ? 'high' : 'medium',
            action: avgGrowth > 0 ? 'Plan for scaling' : 'Implement improvement strategies',
            value: `${(avgGrowth * 100).toFixed(1)}%`
          });
        }
      }
    });
    
    return insights;
  };

  const analyzeValueConcentration = () => {
    const insights: Insight[] = [];
    
    numericColumns.forEach(column => {
      const values = data.map(row => Number(row[column]) || 0);
      const sortedValues = [...values].sort((a, b) => b - a);
      const total = sortedValues.reduce((a, b) => a + b, 0);
      
      // Calculate Pareto (80/20) distribution
      let cumSum = 0;
      let paretoIndex = 0;
      for (let i = 0; i < sortedValues.length; i++) {
        cumSum += sortedValues[i];
        if (cumSum >= total * 0.8) {
          paretoIndex = i + 1;
          break;
        }
      }
      
      const paretoRatio = paretoIndex / sortedValues.length;
      
      if (paretoRatio < 0.2) {
        insights.push({
          type: 'optimization',
          title: `${column} follows 80/20 distribution`,
          description: `Top ${paretoIndex} records (${(paretoRatio * 100).toFixed(1)}%) account for 80% of total ${column} value`,
          impact: 'high',
          action: 'Focus optimization efforts on top performers',
          value: `${(paretoRatio * 100).toFixed(1)}% of records`
        });
      }
    });
    
    return insights;
  };

  const analyzeCrossColumnPatterns = () => {
    const insights: Insight[] = [];
    const allColumns = Object.keys(data[0] || {});
    
    // Find columns with similar patterns
    for (let i = 0; i < allColumns.length; i++) {
      for (let j = i + 1; j < allColumns.length; j++) {
        const col1 = allColumns[i];
        const col2 = allColumns[j];
        
        // Check for identical values pattern
        const identicalCount = data.filter(row => 
          String(row[col1]).toLowerCase() === String(row[col2]).toLowerCase()
        ).length;
        
        const identicalRatio = identicalCount / data.length;
        
        if (identicalRatio > 0.8 && identicalRatio < 1) {
          insights.push({
            type: 'anomaly',
            title: `${col1} and ${col2} have matching values`,
            description: `${(identicalRatio * 100).toFixed(1)}% of records have identical values between ${col1} and ${col2}`,
            impact: 'medium',
            action: 'Check for data duplication or consider consolidating columns',
            value: `${(identicalRatio * 100).toFixed(1)}% match`
          });
        }
      }
    }
    
    return insights;
  };

  const calculateTrend = (values: number[]): number => {
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
  };

  const detectAnomalies = (values: number[]): number[] => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const threshold = 2 * stdDev;

    return values.filter(val => Math.abs(val - mean) > threshold);
  };

  const calculateCorrelation = (x: number[], y: number[]): number => {
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
  };

  const predictNextValue = (values: number[]): number => {
    const n = values.length;
    if (n < 3) return values[n - 1] || 0;

    // Simple linear regression prediction
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * values[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return slope * n + intercept;
  };

  useEffect(() => {
    if (data.length && numericColumns.length) {
      setIsAnalyzing(true);
      setTimeout(() => {
        const newInsights = analyzeData();
        setInsights(newInsights);
        setIsAnalyzing(false);
      }, 1000);
    }
  }, [data, numericColumns]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'correlation': return <BarChart3 className="h-4 w-4" />;
      case 'prediction': return <Target className="h-4 w-4" />;
      case 'optimization': return <Lightbulb className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.type]) acc[insight.type] = [];
    acc[insight.type].push(insight);
    return acc;
  }, {} as Record<string, Insight[]>);

  if (!data.length || !numericColumns.length) {
    return (
      <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Upload data to see AI-powered insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-glass-bg to-transparent backdrop-blur-sm border border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-dashboard-primary" />
          <span>Smart Analytics Hub</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dashboard-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing your data...</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No significant insights found</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="trend">Trends</TabsTrigger>
              <TabsTrigger value="anomaly">Anomalies</TabsTrigger>
              <TabsTrigger value="correlation">Correlations</TabsTrigger>
              <TabsTrigger value="prediction">Predictions</TabsTrigger>
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="p-4 rounded-lg border border-glass-border bg-card/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getInsightIcon(insight.type)}
                      <h4 className="font-medium">{insight.title}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      {insight.value && (
                        <Badge variant="outline" className="text-dashboard-primary">
                          {insight.value}
                        </Badge>
                      )}
                      <Badge variant={getImpactColor(insight.impact) as any}>
                        {insight.impact}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  {insight.action && (
                    <p className="text-sm font-medium text-dashboard-primary">💡 {insight.action}</p>
                  )}
                </div>
              ))}
            </TabsContent>

            {Object.entries(groupedInsights).map(([type, typeInsights]) => (
              <TabsContent key={type} value={type} className="space-y-4">
                {typeInsights.map((insight, index) => (
                  <div key={index} className="p-4 rounded-lg border border-glass-border bg-card/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getInsightIcon(insight.type)}
                        <h4 className="font-medium">{insight.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        {insight.value && (
                          <Badge variant="outline" className="text-dashboard-primary">
                            {insight.value}
                          </Badge>
                        )}
                        <Badge variant={getImpactColor(insight.impact) as any}>
                          {insight.impact}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                    {insight.action && (
                      <p className="text-sm font-medium text-dashboard-primary">💡 {insight.action}</p>
                    )}
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};