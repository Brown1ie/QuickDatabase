import { ColumnDefinition, DataRow } from '../App';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface ImportResult {
  tableName: string;
  columns: ColumnDefinition[];
  data: DataRow[];
  success: boolean;
  error?: string;
}

export const importPDF = async (file: File): Promise<ImportResult> => {
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Get the first page
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    
    // Extract text items
    const textItems = textContent.items.map((item: any) => item.str);
    
    // Try to extract table name (usually at the top of the document)
    let tableName = 'Imported Table';
    if (textItems.length > 0) {
      tableName = textItems[0].trim();
    }
    
    // Try to extract column headers and data
    // This is a simplified approach - PDF parsing is complex and may need refinement
    // for different PDF structures
    
    // Find potential column headers (usually in the first few lines)
    let headerLine = -1;
    let headers: string[] = [];
    
    // Look for a line that might contain headers
    for (let i = 1; i < Math.min(10, textItems.length); i++) {
      const line = textItems[i].trim();
      if (line && line.includes(' ')) {
        // Potential header line with multiple columns
        headers = line.split(/\s{2,}/).filter((h: string) => h.trim());
        if (headers.length >= 2) {
          headerLine = i;
          break;
        }
      }
    }
    
    if (headerLine === -1 || headers.length === 0) {
      return {
        tableName,
        columns: [],
        data: [],
        success: false,
        error: 'Could not detect table headers in the PDF'
      };
    }
    
    // Create column definitions
    const columns: ColumnDefinition[] = headers.map((header, index) => {
      const id = header.toLowerCase().replace(/\s+/g, '-');
      // Try to detect column type
      let type: 'text' | 'number' | 'currency' = 'text';
      if (header.toLowerCase().includes('price') || header.toLowerCase().includes('cost')) {
        type = 'currency';
      } else if (header.toLowerCase().includes('rating') || header.toLowerCase().includes('count')) {
        type = 'number';
      }
      
      return {
        id,
        title: header,
        type
      };
    });
    
    // Extract data rows
    const data: DataRow[] = [];
    let rowIndex = 0;
    
    // Start from the line after headers
    for (let i = headerLine + 1; i < textItems.length; i++) {
      const line = textItems[i].trim();
      if (!line) continue;
      
      // Split the line into cells
      const cells = line.split(/\s{2,}/).filter((c: string) => c.trim());
      
      // If we have enough cells, consider it a data row
      if (cells.length >= columns.length) {
        const rowData: DataRow = {
          id: `row-${rowIndex++}`,
          color: '#ffffff'
        };
        
        // Map cells to columns
        columns.forEach((col, colIndex) => {
          if (colIndex < cells.length) {
            let value = cells[colIndex];
            
            // Try to convert to appropriate type
            if (col.type === 'number') {
              const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
              if (!isNaN(num)) {
                value = num.toString();
              }
            } else if (col.type === 'currency') {
              const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
              if (!isNaN(num)) {
                value = num.toString();
              }
            }
            
            rowData[col.id] = value;
          }
        });
        
        data.push(rowData);
      }
    }
    
    return {
      tableName,
      columns,
      data,
      success: true
    };
  } catch (error) {
    console.error('Error importing PDF:', error);
    return {
      tableName: 'Import Failed',
      columns: [],
      data: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error importing PDF'
    };
  }
};