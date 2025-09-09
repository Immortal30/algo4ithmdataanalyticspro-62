import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
}

export const FileUpload = ({ onFileUpload, isLoading }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        onFileUpload(file);
      }
    }
  }, [onFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setSelectedFile(file);
      onFileUpload(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="relative overflow-hidden min-h-[300px]">
      {/* Animated floating orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-r from-dashboard-primary/20 to-dashboard-accent/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-gradient-to-r from-dashboard-secondary/20 to-dashboard-warning/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-gradient-to-r from-dashboard-accent/30 to-dashboard-primary/30 rounded-full blur-lg animate-pulse delay-500"></div>
      </div>
      
      {/* Main upload area */}
      <Card className="relative border-2 border-dashed border-dashboard-primary/30 shadow-xl bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl hover:border-dashboard-primary/50 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-dashboard-primary/3 via-dashboard-accent/3 to-dashboard-secondary/3 rounded-lg"></div>
        
        <div
          className={cn(
            "relative z-10 p-8 transition-all duration-500 ease-out rounded-lg",
            dragActive && "scale-[1.02] bg-gradient-to-br from-dashboard-primary/15 to-dashboard-accent/15 border-dashboard-primary/60",
            isLoading && "opacity-50 pointer-events-none"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            /* Selected file display */
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-dashboard-success/10 to-dashboard-primary/10 rounded-xl border border-dashboard-success/30 shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <FileSpreadsheet className="h-12 w-12 text-dashboard-success" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-dashboard-success rounded-full animate-ping"></div>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">{selectedFile.name}</p>
                  <p className="text-dashboard-success font-medium">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="h-10 w-10 p-0 hover:bg-destructive/20 hover:scale-110 transition-all duration-200 rounded-full"
              >
                <X className="h-5 w-5 text-destructive" />
              </Button>
            </div>
          ) : (
            /* Upload interface */
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Animated upload icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-dashboard-primary to-dashboard-accent rounded-full opacity-20 animate-ping"></div>
                <div className="relative bg-gradient-to-r from-dashboard-primary/20 to-dashboard-accent/20 p-4 rounded-full backdrop-blur-sm border border-dashboard-primary/30">
                  <Upload className="h-8 w-8 text-dashboard-primary" />
                </div>
              </div>
              
              {/* Title and description */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold gradient-text">
                  Transform Your Data
                </h3>
                <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                  Drop your Excel file and watch your data come to life with powerful analytics.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col items-center gap-3">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-dashboard-primary to-dashboard-accent hover:from-dashboard-primary/90 hover:to-dashboard-accent/90 shadow-md hover:shadow-lg hover:shadow-dashboard-primary/20 transition-all duration-200 text-white font-medium px-6 py-2 rounded-lg text-sm"
                  onClick={() => document.getElementById('file-input')?.click()}
                  disabled={isLoading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                
                <span className="text-muted-foreground text-xs">or drag and drop</span>
              </div>
              
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Format badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
                <span className="text-sm text-muted-foreground font-medium">Supported formats:</span>
                {['.xlsx', '.xls', '.csv'].map((format) => (
                  <span 
                    key={format}
                    className="px-4 py-2 bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm border border-muted-foreground/20 rounded-full text-sm font-medium text-foreground hover:from-dashboard-primary/20 hover:to-dashboard-accent/20 hover:border-dashboard-primary/40 transition-all duration-200"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-dashboard-accent/20 to-dashboard-primary/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-dashboard-secondary/20 to-dashboard-warning/20 rounded-full blur-lg"></div>
      </Card>
    </div>
  );
};