import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ColumnDetailsProps {
  columnDetails: {
    common: string[];
    uniqueToFile1: string[];
    uniqueToFile2: string[];
  };
}

export const ColumnDetails = ({ columnDetails }: ColumnDetailsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="border-dashboard-success/30 bg-gradient-to-br from-dashboard-success/5 to-dashboard-success/10 hover:shadow-elegant transition-all duration-300">
        <CardHeader className="border-b border-dashboard-success/20">
          <CardTitle className="flex items-center gap-2 text-dashboard-success">
            <CheckCircle className="h-5 w-5" />
            Common Columns ({columnDetails.common.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {columnDetails.common.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {columnDetails.common.map((col) => (
                <Badge 
                  key={col} 
                  variant="secondary" 
                  className="bg-dashboard-success/10 text-dashboard-success border-dashboard-success/30 hover:bg-dashboard-success/20 transition-all"
                >
                  {col}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No common columns found</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashboard-warning/30 bg-gradient-to-br from-dashboard-warning/5 to-dashboard-warning/10 hover:shadow-elegant transition-all duration-300">
        <CardHeader className="border-b border-dashboard-warning/20">
          <CardTitle className="flex items-center gap-2 text-dashboard-warning">
            <AlertCircle className="h-5 w-5" />
            Unique to File 1 ({columnDetails.uniqueToFile1.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {columnDetails.uniqueToFile1.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {columnDetails.uniqueToFile1.map((col) => (
                <Badge 
                  key={col} 
                  className="bg-dashboard-warning/10 text-dashboard-warning border-dashboard-warning/30 hover:bg-dashboard-warning/20 transition-all"
                >
                  {col}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No unique columns in File 1</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashboard-destructive/30 bg-gradient-to-br from-dashboard-destructive/5 to-dashboard-destructive/10 hover:shadow-elegant transition-all duration-300">
        <CardHeader className="border-b border-dashboard-destructive/20">
          <CardTitle className="flex items-center gap-2 text-dashboard-destructive">
            <XCircle className="h-5 w-5" />
            Unique to File 2 ({columnDetails.uniqueToFile2.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {columnDetails.uniqueToFile2.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {columnDetails.uniqueToFile2.map((col) => (
                <Badge 
                  key={col} 
                  className="bg-dashboard-destructive/10 text-dashboard-destructive border-dashboard-destructive/30 hover:bg-dashboard-destructive/20 transition-all"
                >
                  {col}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No unique columns in File 2</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};