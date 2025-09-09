import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, TrendingUp, TrendingDown } from "lucide-react";

interface CorrelationMatrixProps {
  data: any[];
  columns: string[];
}

export const CorrelationMatrix = ({ data, columns }: CorrelationMatrixProps) => {
  const correlationData = useMemo(() => {
    if (!data.length || columns.length < 2) return null;

    // Calculate correlation coefficient for each pair
    const matrix: Record<string, Record<string, number>> = {};
    
    columns.forEach(col1 => {
      matrix[col1] = {};
      columns.forEach(col2 => {
        if (col1 === col2) {
          matrix[col1][col2] = 1;
        } else {
          // Get numeric values
          const values1 = data.map(row => Number(row[col1])).filter(v => !isNaN(v));
          const values2 = data.map(row => Number(row[col2])).filter(v => !isNaN(v));
          
          if (values1.length === 0 || values2.length === 0) {
            matrix[col1][col2] = 0;
            return;
          }
          
          // Calculate means
          const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
          const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;
          
          // Calculate correlation
          let numerator = 0;
          let denominator1 = 0;
          let denominator2 = 0;
          
          for (let i = 0; i < Math.min(values1.length, values2.length); i++) {
            const diff1 = values1[i] - mean1;
            const diff2 = values2[i] - mean2;
            numerator += diff1 * diff2;
            denominator1 += diff1 * diff1;
            denominator2 += diff2 * diff2;
          }
          
          const correlation = denominator1 * denominator2 === 0 
            ? 0 
            : numerator / Math.sqrt(denominator1 * denominator2);
          
          matrix[col1][col2] = correlation;
        }
      });
    });
    
    return matrix;
  }, [data, columns]);
  
  const getCorrelationColor = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue > 0.7) return 'hsl(var(--destructive))';
    if (absValue > 0.5) return 'hsl(var(--warning))';
    if (absValue > 0.3) return 'hsl(var(--primary))';
    return 'hsl(var(--muted-foreground))';
  };
  
  const getCorrelationOpacity = (value: number) => {
    return Math.abs(value) * 0.8 + 0.2;
  };
  
  if (!correlationData) {
    return null;
  }
  
  return (
    <Card className="border-border/50 bg-gradient-to-br from-background via-background to-muted/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Correlation Matrix</CardTitle>
          <Badge variant="outline" className="ml-auto text-xs">
            {columns.length}x{columns.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Column headers */}
            <div className="flex">
              <div className="w-24 shrink-0" /> {/* Empty corner cell */}
              {columns.map(col => (
                <div 
                  key={col} 
                  className="w-24 shrink-0 text-xs font-medium text-muted-foreground p-1 text-center truncate"
                  title={col}
                >
                  {col}
                </div>
              ))}
            </div>
            
            {/* Matrix rows */}
            {columns.map(row => (
              <div key={row} className="flex">
                <div className="w-24 shrink-0 text-xs font-medium text-muted-foreground p-1 truncate" title={row}>
                  {row}
                </div>
                {columns.map(col => {
                  const value = correlationData[row][col];
                  const isStrong = Math.abs(value) > 0.7;
                  const isModerate = Math.abs(value) > 0.5;
                  
                  return (
                    <div
                      key={`${row}-${col}`}
                      className="w-24 shrink-0 p-1"
                    >
                      <div
                        className="relative h-16 rounded flex items-center justify-center text-xs font-medium transition-all hover:scale-105"
                        style={{
                          backgroundColor: getCorrelationColor(value),
                          opacity: getCorrelationOpacity(value)
                        }}
                      >
                        <span className="text-foreground mix-blend-difference">
                          {value.toFixed(2)}
                        </span>
                        {value > 0.7 && <TrendingUp className="absolute top-1 right-1 h-3 w-3" />}
                        {value < -0.7 && <TrendingDown className="absolute top-1 right-1 h-3 w-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--destructive))', opacity: 0.9 }} />
            <span className="text-muted-foreground">Strong (±0.7-1.0)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--warning))', opacity: 0.7 }} />
            <span className="text-muted-foreground">Moderate (±0.5-0.7)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--primary))', opacity: 0.5 }} />
            <span className="text-muted-foreground">Weak (±0.3-0.5)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};