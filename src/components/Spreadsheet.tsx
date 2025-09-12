import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Save, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Copy, 
  Clipboard,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Calculator
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Cell {
  value: string;
  formula?: string;
  style?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    align?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    color?: string;
  };
}

interface SpreadsheetProps {
  onDataChange?: (data: any[]) => void;
  initialData?: any[];
}

export const Spreadsheet: React.FC<SpreadsheetProps> = ({ onDataChange, initialData }) => {
  const [cells, setCells] = useState<Record<string, Cell>>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<string[]>([]);
  const [rows, setRows] = useState(50);
  const [cols, setCols] = useState(26);
  const [history, setHistory] = useState<Record<string, Cell>[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [formulaBar, setFormulaBar] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with data if provided
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      const newCells: Record<string, Cell> = {};
      initialData.forEach((row, rowIndex) => {
        Object.keys(row).forEach((key, colIndex) => {
          const cellKey = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
          newCells[cellKey] = { value: String(row[key] || '') };
        });
      });
      setCells(newCells);
    }
  }, [initialData]);

  const getColumnLabel = (index: number): string => {
    let label = '';
    while (index >= 0) {
      label = String.fromCharCode(65 + (index % 26)) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  };

  const getCellKey = (row: number, col: number): string => {
    return `${getColumnLabel(col)}${row + 1}`;
  };

  const evaluateFormula = (formula: string): string => {
    if (!formula.startsWith('=')) return formula;
    
    try {
      let expression = formula.substring(1);
      
      // Replace cell references with values
      const cellRefRegex = /([A-Z]+)(\d+)/g;
      expression = expression.replace(cellRefRegex, (match, col, row) => {
        const cellKey = `${col}${row}`;
        const cell = cells[cellKey];
        return cell?.value || '0';
      });
      
      // SUM function
      expression = expression.replace(/SUM\(([A-Z]+\d+):([A-Z]+\d+)\)/g, (match, start, end) => {
        const startMatch = start.match(/([A-Z]+)(\d+)/);
        const endMatch = end.match(/([A-Z]+)(\d+)/);
        if (!startMatch || !endMatch) return '0';
        
        const startCol = startMatch[1].charCodeAt(0) - 65;
        const startRow = parseInt(startMatch[2]) - 1;
        const endCol = endMatch[1].charCodeAt(0) - 65;
        const endRow = parseInt(endMatch[2]) - 1;
        
        let sum = 0;
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            const key = getCellKey(r, c);
            const value = parseFloat(cells[key]?.value || '0');
            if (!isNaN(value)) sum += value;
          }
        }
        return sum.toString();
      });
      
      // AVERAGE function
      expression = expression.replace(/AVERAGE\(([A-Z]+\d+):([A-Z]+\d+)\)/g, (match, start, end) => {
        const startMatch = start.match(/([A-Z]+)(\d+)/);
        const endMatch = end.match(/([A-Z]+)(\d+)/);
        if (!startMatch || !endMatch) return '0';
        
        const startCol = startMatch[1].charCodeAt(0) - 65;
        const startRow = parseInt(startMatch[2]) - 1;
        const endCol = endMatch[1].charCodeAt(0) - 65;
        const endRow = parseInt(endMatch[2]) - 1;
        
        let sum = 0;
        let count = 0;
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            const key = getCellKey(r, c);
            const value = parseFloat(cells[key]?.value || '0');
            if (!isNaN(value)) {
              sum += value;
              count++;
            }
          }
        }
        return count > 0 ? (sum / count).toString() : '0';
      });
      
      // Basic math evaluation
      const result = Function('"use strict"; return (' + expression + ')')();
      return String(result);
    } catch (error) {
      return '#ERROR';
    }
  };

  const handleCellChange = (key: string, value: string) => {
    const newCells = { ...cells };
    const isFormula = value.startsWith('=');
    
    newCells[key] = {
      ...newCells[key],
      formula: isFormula ? value : undefined,
      value: isFormula ? evaluateFormula(value) : value
    };
    
    setCells(newCells);
    addToHistory(newCells);
    
    // Update connected dashboard
    if (onDataChange) {
      const data = exportToArray(newCells);
      onDataChange(data);
    }
  };

  const exportToArray = (cellData: Record<string, Cell>): any[] => {
    const data: any[] = [];
    const headers: string[] = [];
    
    // Get headers from first row
    for (let c = 0; c < cols; c++) {
      const key = getCellKey(0, c);
      if (cellData[key]?.value) {
        headers.push(cellData[key].value);
      }
    }
    
    // Get data rows
    for (let r = 1; r < rows; r++) {
      const row: any = {};
      let hasData = false;
      
      for (let c = 0; c < headers.length; c++) {
        const key = getCellKey(r, c);
        const value = cellData[key]?.value || '';
        if (value) hasData = true;
        row[headers[c] || `Column${c + 1}`] = value;
      }
      
      if (hasData) data.push(row);
    }
    
    return data;
  };

  const addToHistory = (newCells: Record<string, Cell>) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newCells);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCells(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCells(history[historyIndex + 1]);
    }
  };

  const copyCell = () => {
    if (selectedCell && cells[selectedCell]) {
      navigator.clipboard.writeText(cells[selectedCell].value);
      toast({
        title: "Copied",
        description: "Cell content copied to clipboard"
      });
    }
  };

  const pasteCell = async () => {
    if (selectedCell) {
      const text = await navigator.clipboard.readText();
      handleCellChange(selectedCell, text);
    }
  };

  const deleteCell = () => {
    if (selectedCell) {
      const newCells = { ...cells };
      delete newCells[selectedCell];
      setCells(newCells);
      addToHistory(newCells);
    }
  };

  const applyStyle = (styleKey: string, value: any) => {
    if (selectedCell) {
      const newCells = { ...cells };
      if (!newCells[selectedCell]) {
        newCells[selectedCell] = { value: '' };
      }
      newCells[selectedCell].style = {
        ...newCells[selectedCell].style,
        [styleKey]: value
      };
      setCells(newCells);
      addToHistory(newCells);
    }
  };

  const saveToFile = () => {
    const wb = XLSX.utils.book_new();
    const wsData: any[][] = [];
    
    for (let r = 0; r < rows; r++) {
      const row: any[] = [];
      for (let c = 0; c < cols; c++) {
        const key = getCellKey(r, c);
        row.push(cells[key]?.value || '');
      }
      wsData.push(row);
    }
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'spreadsheet.xlsx');
    
    toast({
      title: "Saved",
      description: "Spreadsheet saved successfully"
    });
  };

  const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const newCells: Record<string, Cell> = {};
      jsonData.forEach((row: any, rowIndex: number) => {
        row.forEach((value: any, colIndex: number) => {
          if (value !== undefined && value !== null && value !== '') {
            const key = getCellKey(rowIndex, colIndex);
            newCells[key] = { value: String(value) };
          }
        });
      });
      
      setCells(newCells);
      addToHistory(newCells);
      
      toast({
        title: "Loaded",
        description: "File loaded successfully"
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const addRow = () => {
    setRows(rows + 1);
  };

  const addColumn = () => {
    setCols(cols + 1);
  };

  return (
    <Card className="p-4 bg-black/90 border-gray-800">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Button onClick={saveToFile} size="sm" variant="outline" className="bg-black border-gray-700 text-white hover:bg-gray-900">
          <Save className="h-4 w-4 mr-1" /> Save
        </Button>
        <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="outline" className="bg-black border-gray-700 text-white hover:bg-gray-900">
          <Upload className="h-4 w-4 mr-1" /> Load
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={loadFromFile}
          className="hidden"
        />
        
        <div className="h-6 w-px bg-gray-700" />
        
        <Button onClick={undo} size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Undo className="h-4 w-4" />
        </Button>
        <Button onClick={redo} size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Redo className="h-4 w-4" />
        </Button>
        
        <div className="h-6 w-px bg-gray-700" />
        
        <Button onClick={copyCell} size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Copy className="h-4 w-4" />
        </Button>
        <Button onClick={pasteCell} size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Clipboard className="h-4 w-4" />
        </Button>
        <Button onClick={deleteCell} size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <div className="h-6 w-px bg-gray-700" />
        
        <Button onClick={() => applyStyle('bold', true)} size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Bold className="h-4 w-4" />
        </Button>
        <Button onClick={() => applyStyle('italic', true)} size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Italic className="h-4 w-4" />
        </Button>
        <Button onClick={() => applyStyle('underline', true)} size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Underline className="h-4 w-4" />
        </Button>
        
        <div className="h-6 w-px bg-gray-700" />
        
        <Button onClick={() => applyStyle('align', 'left')} size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button onClick={() => applyStyle('align', 'center')} size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button onClick={() => applyStyle('align', 'right')} size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <div className="h-6 w-px bg-gray-700" />
        
        <Button onClick={addRow} size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-1" /> Row
        </Button>
        <Button onClick={addColumn} size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-1" /> Column
        </Button>
      </div>

      {/* Formula Bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-gray-300 min-w-[60px] text-center">
          {selectedCell || 'A1'}
        </div>
        <Input
          value={editingCell ? formulaBar : (selectedCell && cells[selectedCell]?.formula) || (selectedCell && cells[selectedCell]?.value) || ''}
          onChange={(e) => setFormulaBar(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && selectedCell) {
              handleCellChange(selectedCell, formulaBar);
              setEditingCell(null);
            }
          }}
          onFocus={() => selectedCell && setEditingCell(selectedCell)}
          onBlur={() => setEditingCell(null)}
          placeholder="Enter value or formula (=SUM(A1:A10))"
          className="flex-1 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
        />
      </div>

      {/* Spreadsheet Grid */}
      <div className="overflow-auto max-h-[600px] border border-gray-700 rounded bg-gray-950">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="border border-gray-700 bg-gray-900 text-gray-400 p-2 min-w-[40px] w-[40px]"></th>
              {Array.from({ length: cols }, (_, i) => (
                <th key={i} className="border border-gray-700 bg-gray-900 text-gray-300 p-2 min-w-[100px] font-medium">
                  {getColumnLabel(i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, rowIndex) => (
              <tr key={rowIndex}>
                <td className="border border-gray-700 bg-gray-900 text-gray-400 p-2 text-center font-medium sticky left-0">
                  {rowIndex + 1}
                </td>
                {Array.from({ length: cols }, (_, colIndex) => {
                  const key = getCellKey(rowIndex, colIndex);
                  const cell = cells[key];
                  const isSelected = selectedCell === key;
                  
                  return (
                    <td
                      key={colIndex}
                      className={cn(
                        "border border-gray-700 p-0 min-w-[100px]",
                        isSelected ? "ring-2 ring-primary ring-inset" : "",
                        "bg-gray-950 hover:bg-gray-900"
                      )}
                      onClick={() => {
                        setSelectedCell(key);
                        setFormulaBar(cell?.formula || cell?.value || '');
                      }}
                    >
                      <Input
                        value={editingCell === key ? formulaBar : cell?.value || ''}
                        onChange={(e) => setFormulaBar(e.target.value)}
                        onFocus={() => {
                          setSelectedCell(key);
                          setEditingCell(key);
                          setFormulaBar(cell?.formula || cell?.value || '');
                        }}
                        onBlur={() => {
                          if (editingCell === key) {
                            handleCellChange(key, formulaBar);
                            setEditingCell(null);
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleCellChange(key, formulaBar);
                            setEditingCell(null);
                            
                            // Move to next row
                            const nextRow = rowIndex + 1;
                            if (nextRow < rows) {
                              const nextKey = getCellKey(nextRow, colIndex);
                              setSelectedCell(nextKey);
                            }
                          }
                        }}
                        className={cn(
                          "w-full h-full border-0 bg-transparent text-white px-2 py-1 focus:ring-0 focus:outline-none",
                          cell?.style?.bold && "font-bold",
                          cell?.style?.italic && "italic",
                          cell?.style?.underline && "underline",
                          cell?.style?.align === 'center' && "text-center",
                          cell?.style?.align === 'right' && "text-right"
                        )}
                        style={{
                          backgroundColor: cell?.style?.backgroundColor,
                          color: cell?.style?.color
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Bar */}
      <div className="mt-2 text-xs text-gray-500 flex justify-between">
        <span>
          {rows} rows × {cols} columns
        </span>
        <span>
          {Object.keys(cells).length} cells with data
        </span>
      </div>
    </Card>
  );
};