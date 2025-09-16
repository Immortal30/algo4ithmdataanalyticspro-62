import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface NumericComparison {
  column: string;
  file1Avg: string;
  file2Avg: string;
  difference: string;
  isIncrease: boolean;
}

interface NumericComparisonsProps {
  comparisons: NumericComparison[];
}

export const NumericComparisons = ({ comparisons }: NumericComparisonsProps) => {
  if (comparisons.length === 0) {
    return (
      <Card className="border-dashboard-border bg-dashboard-card/50">
        <CardContent className="p-12 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No numeric columns found for comparison</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashboard-border bg-gradient-to-br from-dashboard-card/50 to-dashboard-card">
      <CardHeader className="border-b border-dashboard-border">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-dashboard-primary" />
          Numeric Column Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comparisons.map((comparison) => {
            const diff = parseFloat(comparison.difference);
            const absDiff = Math.abs(diff);
            const progressValue = Math.min(absDiff, 100);
            
            return (
              <div 
                key={comparison.column} 
                className="group relative p-4 rounded-xl bg-gradient-to-br from-background/50 to-background border border-dashboard-border hover:border-dashboard-primary/50 hover:shadow-elegant transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm uppercase tracking-wider">{comparison.column}</h4>
                    <div className="flex items-center gap-1.5">
                      {diff === 0 ? (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      ) : comparison.isIncrease ? (
                        <TrendingUp className="h-4 w-4 text-dashboard-success animate-pulse" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-dashboard-destructive animate-pulse" />
                      )}
                      <span className={`font-bold text-sm ${
                        diff === 0 ? 'text-muted-foreground' :
                        comparison.isIncrease ? 'text-dashboard-success' : 'text-dashboard-destructive'
                      }`}>
                        {comparison.isIncrease && diff !== 0 ? '+' : ''}{comparison.difference}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">File 1 Average</p>
                        <p className="font-mono text-sm font-semibold">{comparison.file1Avg}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xs text-muted-foreground">File 2 Average</p>
                        <p className="font-mono text-sm font-semibold">{comparison.file2Avg}</p>
                      </div>
                    </div>
                    
                    {diff !== 0 && (
                      <div className="space-y-1">
                        <Progress 
                          value={progressValue} 
                          className={`h-2 ${comparison.isIncrease ? 'bg-dashboard-success/20' : 'bg-dashboard-destructive/20'}`}
                        />
                        <p className="text-xs text-muted-foreground text-center">
                          {absDiff > 100 ? 'Change exceeds 100%' : `${absDiff.toFixed(1)}% change`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};