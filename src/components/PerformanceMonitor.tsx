import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Zap, 
  Clock, 
  MemoryStick, 
  Monitor, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Database,
  Gauge
} from "lucide-react";

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  visibleRows: number;
  totalRows: number;
  filteredRows: number;
  searchTime: number;
  sortTime: number;
}

interface PerformanceMonitorProps {
  data: any[];
  filteredData: any[];
  renderStartTime: number;
  onOptimize?: () => void;
}

export const PerformanceMonitor = ({
  data,
  filteredData,
  renderStartTime,
  onOptimize
}: PerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    visibleRows: 0,
    totalRows: data.length,
    filteredRows: filteredData.length,
    searchTime: 0,
    sortTime: 0
  });

  const [isOptimized, setIsOptimized] = useState(false);

  // Calculate performance metrics
  useEffect(() => {
    const calculateMetrics = () => {
      const renderTime = performance.now() - renderStartTime;
      
      // Estimate memory usage (rough calculation)
      const estimatedMemoryPerRow = 500; // bytes
      const memoryUsage = (data.length * estimatedMemoryPerRow) / (1024 * 1024); // MB
      
      setMetrics(prev => ({
        ...prev,
        renderTime,
        memoryUsage,
        totalRows: data.length,
        filteredRows: filteredData.length,
        visibleRows: Math.min(50, filteredData.length)
      }));
    };

    calculateMetrics();
  }, [data, filteredData, renderStartTime]);

  // Performance status
  const performanceStatus = useMemo(() => {
    const { renderTime, totalRows, memoryUsage } = metrics;
    
    if (totalRows > 100000 || renderTime > 1000 || memoryUsage > 100) {
      return { level: 'warning', message: 'Large dataset - virtualization active' };
    } else if (totalRows > 50000 || renderTime > 500 || memoryUsage > 50) {
      return { level: 'good', message: 'Good performance with optimization' };
    } else {
      return { level: 'excellent', message: 'Excellent performance' };
    }
  }, [metrics]);

  // Optimization recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    
    if (metrics.totalRows > 100000) {
      recs.push({
        type: 'critical',
        message: 'Consider data pagination or filtering for datasets over 100K rows',
        action: 'Implement server-side filtering'
      });
    }
    
    if (metrics.renderTime > 1000) {
      recs.push({
        type: 'warning',
        message: 'Slow render performance detected',
        action: 'Enable virtualization'
      });
    }
    
    if (metrics.filteredRows < metrics.totalRows * 0.1) {
      recs.push({
        type: 'info',
        message: 'Heavy filtering detected - consider refining data source',
        action: 'Optimize data queries'
      });
    }
    
    return recs;
  }, [metrics]);

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-amber-600';
      default: return 'text-red-600';
    }
  };

  const getStatusIcon = (level: string) => {
    switch (level) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-muted/10 to-transparent border-muted/30">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Activity className="h-4 w-4 text-dashboard-primary" />
          <span>Performance Monitor</span>
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-muted/30">
          <div className="flex items-center space-x-2">
            {getStatusIcon(performanceStatus.level)}
            <span className={`text-sm font-medium ${getStatusColor(performanceStatus.level)}`}>
              {performanceStatus.message}
            </span>
          </div>
          {onOptimize && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                onOptimize();
                setIsOptimized(true);
              }}
              disabled={isOptimized}
            >
              <Zap className="h-3 w-3 mr-1" />
              {isOptimized ? 'Optimized' : 'Optimize'}
            </Button>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>Render Time</span>
              </div>
              <span className="font-mono">{metrics.renderTime.toFixed(1)}ms</span>
            </div>
            <Progress 
              value={Math.min((metrics.renderTime / 1000) * 100, 100)} 
              className="h-1"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <MemoryStick className="h-3 w-3 text-muted-foreground" />
                <span>Memory</span>
              </div>
              <span className="font-mono">{metrics.memoryUsage.toFixed(1)}MB</span>
            </div>
            <Progress 
              value={Math.min((metrics.memoryUsage / 100) * 100, 100)} 
              className="h-1"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Database className="h-3 w-3 text-muted-foreground" />
                <span>Rows</span>
              </div>
              <span className="font-mono">
                {metrics.filteredRows.toLocaleString()} / {metrics.totalRows.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={(metrics.filteredRows / metrics.totalRows) * 100} 
              className="h-1"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Monitor className="h-3 w-3 text-muted-foreground" />
                <span>Visible</span>
              </div>
              <span className="font-mono">{metrics.visibleRows}</span>
            </div>
            <Progress 
              value={(metrics.visibleRows / Math.min(100, metrics.filteredRows)) * 100} 
              className="h-1"
            />
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Recommendations:</div>
            {recommendations.map((rec, index) => (
              <div 
                key={index}
                className={`p-2 rounded text-xs border ${
                  rec.type === 'critical' 
                    ? 'bg-red-50 border-red-200 text-red-700' 
                    : rec.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}
              >
                <div className="font-medium">{rec.message}</div>
                <div className="text-xs opacity-75 mt-1">{rec.action}</div>
              </div>
            ))}
          </div>
        )}

        {/* Performance Tips */}
        <div className="text-xs text-muted-foreground bg-muted/10 p-2 rounded">
          <div className="font-medium mb-1">💡 Performance Tips:</div>
          <ul className="space-y-1 text-xs">
            <li>• Virtualization is active for datasets over 1,000 rows</li>
            <li>• Use filters to reduce visible data for better performance</li>
            <li>• Sort operations are optimized for large datasets</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};