import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardPDFExportProps {
  fileName: string;
  data: any[];
}

export const DashboardPDFExport = ({ fileName, data }: DashboardPDFExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportDashboardToPDF = async () => {
    if (!data.length) {
      toast({
        title: "No Data",
        description: "Please upload data before exporting dashboard",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Add title
      pdf.setFontSize(24);
      pdf.setTextColor(44, 82, 130); // dashboard-primary color
      pdf.text(`Dashboard Report: ${fileName.replace('.xlsx', '')}`, 20, yPosition);
      yPosition += 15;

      // Add metadata
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Total Records: ${data.length}`, 20, yPosition);
      yPosition += 15;

      // Capture dashboard sections
      const sections = [
        { selector: '[data-export="kpi-cards"]', title: 'Key Performance Indicators' },
        { selector: '[data-export="charts-section"]', title: 'Data Visualizations' },
        { selector: '[data-export="statistics-section"]', title: 'Statistical Analysis' }
      ];

      for (const section of sections) {
        const element = document.querySelector(section.selector) as HTMLElement;
        
        if (element) {
          try {
            // Temporarily show the element if it's hidden
            const originalDisplay = element.style.display;
            element.style.display = 'block';

            // Capture the element as canvas
            const canvas = await html2canvas(element, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              logging: false,
              width: element.scrollWidth,
              height: element.scrollHeight
            });

            // Restore original display
            element.style.display = originalDisplay;

            // Calculate dimensions to fit the page
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min((pageWidth - 40) / imgWidth, (pageHeight - yPosition - 20) / imgHeight);
            const finalWidth = imgWidth * ratio;
            const finalHeight = imgHeight * ratio;

            // Check if we need a new page
            if (yPosition + finalHeight > pageHeight - 20) {
              pdf.addPage();
              yPosition = 20;
            }

            // Add section title
            pdf.setFontSize(16);
            pdf.setTextColor(44, 82, 130);
            pdf.text(section.title, 20, yPosition);
            yPosition += 10;

            // Add the image
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 20, yPosition, finalWidth, finalHeight);
            yPosition += finalHeight + 15;

          } catch (error) {
            console.warn(`Failed to capture ${section.title}:`, error);
          }
        }
      }

      // Add summary page if needed
      if (yPosition + 50 > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }

      // Add summary statistics
      pdf.setFontSize(16);
      pdf.setTextColor(44, 82, 130);
      pdf.text('Data Summary', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      // Get numeric columns and their stats
      const firstRow = data[0] || {};
      const numericColumns = Object.keys(firstRow).filter(key => {
        const value = firstRow[key];
        return !isNaN(Number(value)) && value !== "" && key !== "id";
      });

      numericColumns.slice(0, 10).forEach((col, index) => {
        const values = data.map(row => Number(row[col]) || 0);
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);

        pdf.text(`${col}:`, 20, yPosition);
        pdf.text(`Avg: ${avg.toFixed(2)} | Min: ${min.toFixed(2)} | Max: ${max.toFixed(2)}`, 60, yPosition);
        yPosition += 6;

        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
      });

      // Save the PDF
      const pdfName = `${fileName.replace('.xlsx', '')}_dashboard_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(pdfName);

      toast({
        title: "Export Successful!",
        description: `Dashboard exported as ${pdfName}`,
      });

    } catch (error) {
      console.error('PDF Export Error:', error);
      toast({
        title: "Export Failed",
        description: "Unable to export dashboard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={exportDashboardToPDF}
      disabled={isExporting || !data.length}
      className="bg-gradient-to-r from-dashboard-primary to-dashboard-secondary text-white border-none hover:opacity-90"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <FileText className="h-4 w-4 mr-2" />
      )}
      {isExporting ? 'Exporting...' : 'Export Dashboard PDF'}
    </Button>
  );
};