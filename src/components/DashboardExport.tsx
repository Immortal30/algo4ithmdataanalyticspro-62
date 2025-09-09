import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Download, Image, FileText, Loader2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardExportProps {
  fileName: string;
  data: any[];
}

export const DashboardExport = ({ fileName, data }: DashboardExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'png' | 'pdf' | null>(null);
  const { toast } = useToast();

  const captureElement = async (selector: string, fileName: string, options = {}) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) return null;

    try {
      // Temporarily show the element if it's hidden
      const originalDisplay = element.style.display;
      element.style.display = 'block';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure fonts are loaded in cloned document
          const clonedElement = clonedDoc.querySelector(selector) as HTMLElement;
          if (clonedElement) {
            clonedElement.style.fontFamily = 'inherit';
          }
        },
        ...options
      });

      // Restore original display
      element.style.display = originalDisplay;

      return {
        canvas,
        fileName,
        dataURL: canvas.toDataURL('image/png', 1.0)
      };
    } catch (error) {
      console.warn(`Failed to capture ${fileName}:`, error);
      return null;
    }
  };

  const exportDashboardAsPNG = async () => {
    if (!data.length) {
      toast({
        title: "No Data",
        description: "Please upload data before exporting dashboard",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportType('png');

    try {
      const sections = [
        { selector: '[data-export="kpi-cards"]', fileName: 'kpi-cards' },
        { selector: '[data-export="charts-section"]', fileName: 'charts-section' },
        { selector: '[data-export="statistics-section"]', fileName: 'statistics-section' }
      ];

      const capturedImages = [];
      
      for (const section of sections) {
        const captured = await captureElement(section.selector, section.fileName);
        if (captured) {
          capturedImages.push(captured);
        }
      }

      if (capturedImages.length === 0) {
        throw new Error('No dashboard sections could be captured');
      }

      // Create ZIP file with all images
      const zip = new JSZip();
      const timestamp = new Date().toISOString().split('T')[0];
      
      capturedImages.forEach((img, index) => {
        const imageData = img.dataURL.split(',')[1]; // Remove data:image/png;base64, prefix
        zip.file(`${img.fileName}_${timestamp}.png`, imageData, { base64: true });
      });

      // Generate ZIP and download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace('.xlsx', '')}_dashboard_images_${timestamp}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful!",
        description: `Dashboard images exported as ZIP file`,
      });

    } catch (error) {
      console.error('PNG Export Error:', error);
      toast({
        title: "Export Failed",
        description: "Unable to export dashboard images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const exportDetailedPDFReport = async () => {
    if (!data.length) {
      toast({
        title: "No Data",
        description: "Please upload data before exporting report",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportType('pdf');

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Title Page
      pdf.setFontSize(28);
      pdf.setTextColor(44, 82, 130);
      pdf.text(`Dashboard Analytics Report`, 20, yPosition);
      yPosition += 20;

      pdf.setFontSize(18);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Data Source: ${fileName.replace('.xlsx', '')}`, 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Total Records: ${data.length}`, 20, yPosition);
      yPosition += 15;

      // Executive Summary
      pdf.setFontSize(16);
      pdf.setTextColor(44, 82, 130);
      pdf.text('Executive Summary', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      // Calculate summary metrics
      const numericColumns = Object.keys(data[0] || {}).filter(key => {
        const value = data[0][key];
        return !isNaN(Number(value)) && value !== "" && key !== "id";
      });

      const dataQuality = ((data.filter(row => Object.values(row).every(val => val !== null && val !== "")).length / data.length) * 100).toFixed(1);
      
      pdf.text(`• Dataset contains ${data.length} records across ${numericColumns.length} numeric metrics`, 20, yPosition);
      yPosition += 6;
      pdf.text(`• Data quality score: ${dataQuality}% (based on completeness)`, 20, yPosition);
      yPosition += 6;
      pdf.text(`• Analysis performed on ${numericColumns.length} key performance indicators`, 20, yPosition);
      yPosition += 15;

      // Key Insights
      pdf.setFontSize(16);
      pdf.setTextColor(44, 82, 130);
      pdf.text('Key Insights', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      numericColumns.slice(0, 5).forEach((col) => {
        const values = data.map(row => Number(row[col]) || 0);
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        
        pdf.text(`• ${col}: Average ${avg.toFixed(2)}, Range ${min.toFixed(2)} - ${max.toFixed(2)}`, 20, yPosition);
        yPosition += 6;
        
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
      });

      yPosition += 10;

      // Dashboard Visualizations
      const sections = [
        { selector: '[data-export="kpi-cards"]', title: 'Key Performance Indicators', description: 'Overview of critical business metrics and performance indicators' },
        { selector: '[data-export="charts-section"]', title: 'Data Visualizations', description: 'Comprehensive charts showing data distribution and trends' },
        { selector: '[data-export="statistics-section"]', title: 'Statistical Analysis', description: 'Detailed statistical breakdown including central tendency and variability measures' }
      ];

      for (const section of sections) {
        const captured = await captureElement(section.selector, section.title);
        
        if (captured) {
          // Check if we need a new page
          if (yPosition + 60 > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }

          // Section title and description
          pdf.setFontSize(16);
          pdf.setTextColor(44, 82, 130);
          pdf.text(section.title, 20, yPosition);
          yPosition += 10;

          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.text(section.description, 20, yPosition);
          yPosition += 15;

          // Calculate image dimensions
          const imgWidth = captured.canvas.width;
          const imgHeight = captured.canvas.height;
          const ratio = Math.min((pageWidth - 40) / imgWidth, (pageHeight - yPosition - 20) / imgHeight);
          const finalWidth = imgWidth * ratio;
          const finalHeight = imgHeight * ratio;

          // Check if image fits on current page
          if (yPosition + finalHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }

          // Add the image
          pdf.addImage(captured.dataURL, 'PNG', 20, yPosition, finalWidth, finalHeight);
          yPosition += finalHeight + 20;
        }
      }

      // Detailed Statistical Analysis
      if (yPosition + 50 > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.setTextColor(44, 82, 130);
      pdf.text('Detailed Statistical Analysis', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      numericColumns.forEach((col, index) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        const values = data.map(row => Number(row[col]) || 0).filter(v => !isNaN(v));
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        const median = values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
        const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        pdf.setFontSize(12);
        pdf.setTextColor(44, 82, 130);
        pdf.text(`${col}`, 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Mean: ${avg.toFixed(2)} | Median: ${median.toFixed(2)} | Std Dev: ${stdDev.toFixed(2)}`, 25, yPosition);
        yPosition += 5;
        pdf.text(`Min: ${min.toFixed(2)} | Max: ${max.toFixed(2)} | Range: ${(max - min).toFixed(2)}`, 25, yPosition);
        yPosition += 5;
        pdf.text(`Total: ${sum.toFixed(2)} | Count: ${values.length} values`, 25, yPosition);
        yPosition += 10;
      });

      // Recommendations
      if (yPosition + 30 > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.setTextColor(44, 82, 130);
      pdf.text('Recommendations', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      const recommendations = [
        "• Monitor key metrics regularly to identify trends and anomalies",
        "• Focus on data quality improvement to increase the current score",
        "• Consider setting up automated alerts for critical threshold breaches",
        "• Implement regular data validation checks to maintain accuracy",
        "• Explore correlations between high-performing metrics for optimization opportunities"
      ];

      recommendations.forEach(rec => {
        pdf.text(rec, 20, yPosition);
        yPosition += 6;
      });

      // Save the PDF
      const pdfName = `${fileName.replace('.xlsx', '')}_detailed_report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(pdfName);

      toast({
        title: "Export Successful!",
        description: `Detailed report exported as ${pdfName}`,
      });

    } catch (error) {
      console.error('PDF Report Export Error:', error);
      toast({
        title: "Export Failed",
        description: "Unable to export detailed report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        className="w-full" 
        variant="outline" 
        onClick={exportDashboardAsPNG}
        disabled={isExporting || !data.length}
      >
        {isExporting && exportType === 'png' ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Camera className="h-4 w-4 mr-2" />
        )}
        {isExporting && exportType === 'png' ? 'Exporting...' : 'Export as PNG'}
      </Button>
      
      <Button 
        className="w-full" 
        variant="outline" 
        onClick={exportDetailedPDFReport}
        disabled={isExporting || !data.length}
      >
        {isExporting && exportType === 'pdf' ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileText className="h-4 w-4 mr-2" />
        )}
        {isExporting && exportType === 'pdf' ? 'Generating...' : 'Export as PDF Report'}
      </Button>
    </div>
  );
};