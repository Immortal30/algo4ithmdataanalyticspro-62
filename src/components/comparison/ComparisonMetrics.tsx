import { Card, CardContent } from "@/components/ui/card";
import { Table, BarChart3, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ComparisonMetricsProps {
  metrics: {
    file1Records: number;
    file2Records: number;
    commonColumns: number;
    uniqueToFile1: number;
    uniqueToFile2: number;
  };
}

export const ComparisonMetrics = ({ metrics }: ComparisonMetricsProps) => {
  const recordDifference = metrics.file2Records - metrics.file1Records;
  const recordPercentChange = metrics.file1Records > 0 
    ? ((recordDifference / metrics.file1Records) * 100).toFixed(1)
    : "N/A";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="border-dashboard-border bg-gradient-to-br from-dashboard-card/50 to-dashboard-card hover:shadow-elegant transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">File 1 Records</p>
              <p className="text-3xl font-bold gradient-text">{metrics.file1Records.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-dashboard-primary/10 flex items-center justify-center">
              <Table className="h-6 w-6 text-dashboard-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashboard-border bg-gradient-to-br from-dashboard-card/50 to-dashboard-card hover:shadow-elegant transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">File 2 Records</p>
              <p className="text-3xl font-bold gradient-text">{metrics.file2Records.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-dashboard-accent/10 flex items-center justify-center">
              <Table className="h-6 w-6 text-dashboard-accent" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashboard-border bg-gradient-to-br from-dashboard-card/50 to-dashboard-card hover:shadow-elegant transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Record Difference</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{Math.abs(recordDifference).toLocaleString()}</p>
                {recordDifference !== 0 && (
                  <div className="flex items-center gap-1">
                    {recordDifference > 0 ? (
                      <TrendingUp className="h-4 w-4 text-dashboard-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-dashboard-destructive" />
                    )}
                    <span className={`text-sm font-medium ${recordDifference > 0 ? 'text-dashboard-success' : 'text-dashboard-destructive'}`}>
                      {recordPercentChange}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-dashboard-secondary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-dashboard-secondary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashboard-border bg-gradient-to-br from-dashboard-card/50 to-dashboard-card hover:shadow-elegant transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Common Columns</p>
              <p className="text-3xl font-bold text-dashboard-success">{metrics.commonColumns}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-dashboard-success/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-dashboard-success" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashboard-border bg-gradient-to-br from-dashboard-card/50 to-dashboard-card hover:shadow-elegant transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Unique Columns</p>
              <p className="text-3xl font-bold text-dashboard-warning">
                {metrics.uniqueToFile1 + metrics.uniqueToFile2}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-dashboard-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-dashboard-warning" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};