import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown,
  Download,
  Database,
  Eye,
  Grid3X3,
  MoreHorizontal,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PerformanceMonitor } from "./PerformanceMonitor";

interface VirtualizedTableProps {
  data: any[];
  maxHeight?: number;
  enableFilter?: boolean;
  enableSort?: boolean;
  enableSearch?: boolean;
  enableExport?: boolean;
  onRowSelect?: (row: any, index: number) => void;
  className?: string;
}

export const VirtualizedTable = ({
  data,
  maxHeight = 600,
  enableFilter = true,
  enableSort = true,
  enableSearch = true,
  enableExport = true,
  onRowSelect,
  className
}: VirtualizedTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filterColumn, setFilterColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleEnd, setVisibleEnd] = useState(50);
  const [renderStartTime] = useState(() => performance.now());
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ROW_HEIGHT = 40;
  const BUFFER_SIZE = 10;

  // Get columns from data
  const columns = useMemo(() => {
    if (!data.length) return [];
    return Object.keys(data[0]).filter(key => key !== 'id');
  }, [data]);

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column-specific filter
    if (filterColumn && filterColumn !== 'no-filter' && filterValue) {
      filtered = filtered.filter(row =>
        String(row[filterColumn]).toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // Handle numeric sorting
        if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
          return sortConfig.direction === 'asc' 
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        }
        
        // Handle string sorting
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, filterColumn, filterValue]);

  const handleSort = useCallback((key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const handleRowClick = useCallback((row: any, index: number) => {
    setSelectedRowIndex(index);
    onRowSelect?.(row, index);
  }, [onRowSelect]);

  // Calculate column widths dynamically
  const calculateColumnWidth = useCallback((columnIndex: number) => {
    const column = columns[columnIndex];
    if (!column) return 120;
    
    // Find the maximum width needed for this column
    const maxLength = Math.max(
      column.length,
      ...processedData.slice(0, 100).map(row => String(row[column] || '').length)
    );
    
    return Math.min(Math.max(maxLength * 8 + 20, 100), 300);
  }, [columns, processedData]);

  const totalWidth = columns.reduce((total, _, index) => total + calculateColumnWidth(index), 0);

  // Handle scroll for virtualization
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    
    const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
    const endIndex = Math.min(
      processedData.length - 1,
      startIndex + Math.ceil(containerHeight / ROW_HEIGHT) + BUFFER_SIZE
    );
    
    setVisibleStart(Math.max(0, startIndex - BUFFER_SIZE));
    setVisibleEnd(endIndex);
  }, [processedData.length]);

  // Update visible range when data changes
  useEffect(() => {
    setVisibleStart(0);
    setVisibleEnd(Math.min(50, processedData.length - 1));
  }, [processedData.length]);

  // Virtual row renderer
  const VirtualRow = ({ index, row }: { index: number; row: any }) => {
    const isSelected = selectedRowIndex === index;
    
    return (
      <div
        className={cn(
          "flex items-center border-b border-muted/20 hover:bg-muted/10 cursor-pointer transition-colors",
          isSelected && "bg-dashboard-primary/10 border-dashboard-primary/30"
        )}
        style={{ height: ROW_HEIGHT }}
        onClick={() => handleRowClick(row, index)}
      >
        {columns.map((column, colIndex) => (
          <div
            key={column}
            className="px-3 py-2 text-sm flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ width: calculateColumnWidth(colIndex) }}
            title={String(row[column] || '')}
          >
            {String(row[column] || '')}
          </div>
        ))}
      </div>
    );
  };

  // Header renderer
  const HeaderRow = () => (
    <div className="flex items-center border-b-2 border-muted bg-muted/20 sticky top-0 z-10">
      {columns.map((column, colIndex) => (
        <div
          key={column}
          className="px-3 py-3 text-sm font-medium flex items-center justify-between flex-shrink-0 cursor-pointer hover:bg-muted/30 transition-colors"
          style={{ width: calculateColumnWidth(colIndex) }}
          onClick={() => enableSort && handleSort(column)}
        >
          <span className="truncate" title={column}>{column}</span>
          {enableSort && (
            <div className="ml-1 flex flex-col">
              <ChevronUp 
                className={cn(
                  "h-3 w-3",
                  sortConfig?.key === column && sortConfig.direction === 'asc'
                    ? "text-dashboard-primary" 
                    : "text-muted-foreground/50"
                )}
              />
              <ChevronDown 
                className={cn(
                  "h-3 w-3 -mt-1",
                  sortConfig?.key === column && sortConfig.direction === 'desc'
                    ? "text-dashboard-primary" 
                    : "text-muted-foreground/50"
                )}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const exportData = useCallback(() => {
    const csvContent = [
      columns.join(','),
      ...processedData.map(row => 
        columns.map(col => `"${String(row[col] || '').replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [columns, processedData]);

  // Auto-show performance monitor for large datasets
  useEffect(() => {
    setShowPerformanceMonitor(data.length > 10000);
  }, [data.length]);

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Performance Monitor */}
      {showPerformanceMonitor && (
        <PerformanceMonitor 
          data={data}
          filteredData={processedData}
          renderStartTime={renderStartTime}
          onOptimize={() => {
            // Trigger optimization logic if needed
            setVisibleEnd(Math.min(100, processedData.length));
          }}
        />
      )}
      
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Grid3X3 className="h-5 w-5 text-dashboard-primary" />
              <span>Data Viewer</span>
              <Badge variant="secondary" className="bg-dashboard-primary/20 text-dashboard-primary">
                {processedData.length.toLocaleString()} rows
              </Badge>
              {data.length > 10000 && (
                <Badge variant="outline" className="text-xs">
                  Virtualized
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {data.length > 1000 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
                >
                  <Activity className="h-4 w-4 mr-1" />
                  Monitor
                </Button>
              )}
              {enableExport && (
                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              )}
            </div>
          </div>
        
        {/* Controls */}
        {(enableSearch || enableFilter) && (
          <div className="flex flex-col sm:flex-row gap-4">
            {enableSearch && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search all columns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            
            {enableFilter && (
              <div className="flex gap-2">
                <Select value={filterColumn} onValueChange={setFilterColumn}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-filter">No filter</SelectItem>
                    {columns.map(column => (
                      <SelectItem key={column} value={column}>{column}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {filterColumn && filterColumn !== 'no-filter' && (
                  <Input
                    placeholder={`Filter ${filterColumn}...`}
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="w-[200px]"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        {processedData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No data found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="border rounded-b-lg overflow-hidden">
            <ScrollArea className="w-full" style={{ height: maxHeight + 50 }}>
              <div style={{ width: Math.max(totalWidth, 800), minWidth: '100%' }}>
                <HeaderRow />
                <div 
                  ref={containerRef}
                  className="overflow-y-auto"
                  style={{ height: maxHeight }}
                  onScroll={handleScroll}
                >
                  {/* Virtual container with proper height */}
                  <div style={{ height: processedData.length * ROW_HEIGHT, position: 'relative' }}>
                    {/* Visible rows only */}
                    <div style={{ transform: `translateY(${visibleStart * ROW_HEIGHT}px)` }}>
                      {processedData.slice(visibleStart, visibleEnd + 1).map((row, index) => (
                        <VirtualRow 
                          key={visibleStart + index} 
                          index={visibleStart + index} 
                          row={row} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}
        
        {/* Stats footer */}
        <div className="p-4 border-t bg-muted/20">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>Showing {processedData.length.toLocaleString()} of {data.length.toLocaleString()} rows</span>
              {searchTerm && (
                <Badge variant="outline" className="text-xs">
                  Search: "{searchTerm}"
                </Badge>
              )}
              {filterColumn && filterColumn !== 'no-filter' && filterValue && (
                <Badge variant="outline" className="text-xs">
                  Filter: {filterColumn} = "{filterValue}"
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Virtualized for performance</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};