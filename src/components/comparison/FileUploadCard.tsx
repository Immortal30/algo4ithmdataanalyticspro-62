import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/FileUpload";
import { CheckCircle, FileSpreadsheet } from "lucide-react";

interface FileUploadCardProps {
  fileNumber: 1 | 2;
  fileName: string;
  dataLength: number;
  isLoading: boolean;
  onFileUpload: (file: File) => Promise<void>;
}

export const FileUploadCard = ({ 
  fileNumber, 
  fileName, 
  dataLength, 
  isLoading, 
  onFileUpload 
}: FileUploadCardProps) => {
  const isFile1 = fileNumber === 1;
  
  return (
    <Card className={`${
      isFile1 
        ? 'border-dashboard-primary/30 bg-gradient-to-br from-dashboard-primary/5 to-dashboard-primary/10' 
        : 'border-dashboard-accent/30 bg-gradient-to-br from-dashboard-accent/5 to-dashboard-accent/10'
    } hover:shadow-elegant transition-all duration-300`}>
      <CardHeader className={`border-b ${
        isFile1 ? 'border-dashboard-primary/20' : 'border-dashboard-accent/20'
      }`}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className={`h-5 w-5 ${
              isFile1 ? 'text-dashboard-primary' : 'text-dashboard-accent'
            }`} />
            <span>File {fileNumber}</span>
          </div>
          {fileName && (
            <Badge variant="secondary" className="font-normal text-xs">
              {fileName}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <FileUpload onFileUpload={onFileUpload} isLoading={isLoading} />
        {dataLength > 0 && (
          <div className={`mt-4 p-4 rounded-lg bg-dashboard-success/10 border border-dashboard-success/30 animate-fade-in`}>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-dashboard-success" />
              <p className="text-sm font-medium text-dashboard-success">
                {dataLength.toLocaleString()} records loaded successfully
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};