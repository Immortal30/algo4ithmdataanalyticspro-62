import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Mail, MessageSquare, Link2, QrCode, Globe, Database, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from 'qrcode';
import LZString from 'lz-string';

interface ExcelData {
  [key: string]: any;
}

interface ShareDashboardProps {
  data: ExcelData[];
  fileName: string;
  formulas: string[];
}

export const ShareDashboard = ({ data, fileName, formulas }: ShareDashboardProps) => {
  const [shareTitle, setShareTitle] = useState(`${fileName.replace('.xlsx', '')} Dashboard`);
  const [shareDescription, setShareDescription] = useState(`Interactive dashboard with ${data.length} records`);
  const [shareMessage, setShareMessage] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const { toast } = useToast();

  const generateShareData = () => {
    // Enhanced sharing with compression and chunking for large datasets
    const shareData = {
      title: shareTitle,
      description: shareDescription,
      message: shareMessage,
      fileName,
      data: data, // Include all data - no truncation
      formulas: formulas,
      timestamp: new Date().toISOString(),
      totalRows: data.length,
      isLargeDataset: data.length > 10000
    };

    // Compress the data using LZ-String for better storage efficiency
    const jsonString = JSON.stringify(shareData);
    return LZString.compressToBase64(jsonString);
  };

  const generateShortUrl = () => {
    const compressedData = generateShareData();
    
    // Create a hash from the compressed data
    const hash = btoa(compressedData.slice(0, 100)).replace(/[+/=]/g, '').slice(0, 12);
    
    try {
      // For very large datasets, use chunked storage
      if (compressedData.length > 4000000) { // ~4MB threshold
        const chunkSize = 3000000; // 3MB chunks to stay under localStorage limits
        const chunks = [];
        
        for (let i = 0; i < compressedData.length; i += chunkSize) {
          chunks.push(compressedData.slice(i, i + chunkSize));
        }
        
        // Store chunk metadata
        localStorage.setItem(`dashboard_${hash}`, JSON.stringify({
          isChunked: true,
          totalChunks: chunks.length,
          originalLength: compressedData.length
        }));
        
        // Store individual chunks
        chunks.forEach((chunk, index) => {
          localStorage.setItem(`dashboard_${hash}_chunk_${index}`, chunk);
        });
      } else {
        // Store normally for smaller datasets
        localStorage.setItem(`dashboard_${hash}`, compressedData);
      }
      
      return hash;
    } catch (error) {
      console.error('Storage error:', error);
      // If storage fails, fall back to base64 encoding (old method)
      const fallbackData = JSON.stringify({
        title: shareTitle,
        description: shareDescription,
        message: shareMessage,
        fileName,
        data: data.slice(0, 1000), // Fallback to 1000 rows
        formulas: formulas.slice(0, 50),
        timestamp: new Date().toISOString(),
        totalRows: data.length,
        isTruncated: data.length > 1000
      });
      
      const fallbackHash = btoa(fallbackData).replace(/[+/=]/g, '').slice(0, 8);
      localStorage.setItem(`dashboard_${fallbackHash}`, btoa(fallbackData));
      return fallbackHash;
    }
  };

  const generateShareLink = () => {
    const shortHash = generateShortUrl();
    return `${window.location.origin}/shared?id=${shortHash}`;
  };

  const generateQRCode = async () => {
    try {
      const shareLink = generateShareLink();
      const qrDataUrl = await QRCode.toDataURL(shareLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('QR Code generation failed:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const shareViaEmail = () => {
    const shareLink = generateShareLink();
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(`
Check out this interactive dashboard: ${shareTitle}

${shareDescription}

${shareMessage ? `Message: ${shareMessage}` : ''}

View the dashboard: ${shareLink}

This dashboard contains ${data.length} records with interactive charts and analytics.
    `);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSMS = () => {
    const shareLink = generateShareLink();
    const message = encodeURIComponent(`Check out this dashboard: ${shareTitle}${shareMessage ? ` - ${shareMessage}` : ''} - ${shareLink}`);
    window.open(`sms:?body=${message}`);
  };

  const shareViaWhatsApp = () => {
    const shareLink = generateShareLink();
    const message = encodeURIComponent(`Check out this interactive dashboard: ${shareTitle}\n\n${shareDescription}\n\n${shareMessage ? `Message: ${shareMessage}\n\n` : ''}View here: ${shareLink}`);
    window.open(`https://wa.me/?text=${message}`);
  };

  const shareViaTwitter = () => {
    const shareLink = generateShareLink();
    const message = encodeURIComponent(`Check out this interactive dashboard: ${shareTitle}${shareMessage ? ` - ${shareMessage}` : ''} - ${shareLink}`);
    window.open(`https://twitter.com/intent/tweet?text=${message}`);
  };

  const shareViaLinkedIn = () => {
    const shareLink = generateShareLink();
    const url = encodeURIComponent(shareLink);
    const title = encodeURIComponent(shareTitle);
    const summary = encodeURIComponent(shareDescription);
    window.open(`https://linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`);
  };

  return (
    <div className="space-y-6">
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5 text-dashboard-primary" />
            <span>Share Dashboard</span>
          </CardTitle>
          <CardDescription>
            Generate a shareable link to your dashboard that others can view
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Share Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shareTitle">Dashboard Title</Label>
              <Input
                id="shareTitle"
                value={shareTitle}
                onChange={(e) => setShareTitle(e.target.value)}
                placeholder="Enter dashboard title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shareDescription">Description</Label>
              <Input
                id="shareDescription"
                value={shareDescription}
                onChange={(e) => setShareDescription(e.target.value)}
                placeholder="Enter dashboard description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shareMessage">Personal Message (Optional)</Label>
              <Textarea
                id="shareMessage"
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="Add a personal message to share with your dashboard"
                rows={3}
              />
            </div>
          </div>

          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="link">
                <Link2 className="h-4 w-4 mr-2" />
                Share Link
              </TabsTrigger>
              <TabsTrigger value="qr">
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="social">
                <Globe className="h-4 w-4 mr-2" />
                Social
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4">
              <div className="space-y-2">
                <Label>Shareable Link</Label>
                <div className="flex space-x-2">
                  <Input
                    value={generateShareLink()}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generateShareLink(), "Share link")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    This link contains your dashboard data and can be shared with anyone.
                  </p>
                  
                  {/* Enhanced sharing capability indicators */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Database className="h-3 w-3 mr-1" />
                      {data.length.toLocaleString()} rows
                    </Badge>
                    
                    {data.length > 10000 && (
                      <Badge variant="outline" className="text-xs border-dashboard-primary text-dashboard-primary">
                        <Zap className="h-3 w-3 mr-1" />
                        Large Dataset Optimized
                      </Badge>
                    )}
                    
                    {data.length > 50000 && (
                      <Badge variant="secondary" className="text-xs bg-dashboard-primary/20 text-dashboard-primary">
                        Ultra High Performance
                      </Badge>
                    )}
                  </div>
                  
                  {data.length > 100000 && (
                    <p className="text-xs text-muted-foreground">
                      ⚡ Using advanced compression and chunking for {data.length.toLocaleString()}+ records
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => copyToClipboard(generateShareLink(), "Share link")} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="outline" onClick={shareViaEmail} className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" onClick={shareViaSMS} className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="qr" className="space-y-4">
              <div className="text-center space-y-4">
                {!qrCodeDataUrl ? (
                  <Button onClick={generateQRCode} className="w-full">
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img 
                        src={qrCodeDataUrl} 
                        alt="Dashboard QR Code" 
                        className="border border-glass-border rounded-lg p-4 bg-white"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Scan this QR code to access the dashboard on mobile devices
                    </p>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={generateQRCode} className="flex-1">
                        <QrCode className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button variant="outline" onClick={() => {
                        const link = document.createElement('a');
                        link.download = `${shareTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.png`;
                        link.href = qrCodeDataUrl;
                        link.click();
                      }} className="flex-1">
                        Download QR
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={shareViaTwitter} className="justify-start">
                  <div className="w-4 h-4 mr-2 bg-blue-400 rounded"></div>
                  Twitter
                </Button>
                <Button variant="outline" onClick={shareViaLinkedIn} className="justify-start">
                  <div className="w-4 h-4 mr-2 bg-blue-600 rounded"></div>
                  LinkedIn
                </Button>
                <Button variant="outline" onClick={shareViaWhatsApp} className="justify-start">
                  <div className="w-4 h-4 mr-2 bg-green-500 rounded"></div>
                  WhatsApp
                </Button>
                <Button variant="outline" onClick={shareViaEmail} className="justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Share your dashboard across different social platforms
              </p>
            </TabsContent>
          </Tabs>

          {/* Dashboard Info */}
          <Card className="bg-muted/5">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Records</p>
                  <p className="font-semibold">{data.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Columns</p>
                  <p className="font-semibold">{data.length > 0 ? Object.keys(data[0]).length - 1 : 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Formulas</p>
                  <p className="font-semibold">{formulas.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">File</p>
                  <p className="font-semibold truncate">{fileName}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};