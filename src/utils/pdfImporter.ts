import { ColumnDefinition, DataRow } from '../App';

export interface ImportResult {
  tableName: string;
  columns: ColumnDefinition[];
  data: DataRow[];
  success: boolean;
  error?: string;
  themeId?: string;
}

// Simple CSV parser function
const parseCSV = (csvText: string): string[][] => {
  const lines = csvText.split('\n');
  return lines.map(line => {
    // Handle quoted values with commas inside them
    const result = [];
    let inQuote = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        result.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    result.push(currentValue);
    return result;
  }).filter(row => row.length > 0 && row.some(cell => cell.trim() !== ''));
};

export const importPDF = async (file: File): Promise<ImportResult> => {
  try {
    // Since PDF.js is causing issues, we'll use a simpler approach
    // We'll ask users to upload CSV files instead of PDFs
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return {
        tableName: 'Import Failed',
        columns: [],
        data: [],
        success: false,
        error: 'Please upload a CSV file instead of a PDF. Due to browser limitations, we now support CSV imports.'
      };
    }
    
    // Read the file as text
    const text = await file.text();
    const parsedData = parseCSV(text);
    
    if (parsedData.length < 2) {
      return {
        tableName: 'Import Failed',
        columns: [],
        data: [],
        success: false,
        error: 'CSV file must contain at least a header row and one data row'
      };
    }
    
    // First row is headers
    const headers = parsedData[0];
    
    // Extract table name from file name
    let tableName = file.name.replace(/\.csv$/i, '').replace(/_/g, ' ');
    if (!tableName) {
      tableName = 'Imported Table';
    }
    
    // Check if the first column is an index column
    const hasIndexColumn = headers[0] === '#';
    const startColumnIndex = hasIndexColumn ? 1 : 0;

    // Check for color and theme columns
    const hasColorColumn = headers.includes('_color');
    const hasThemeColumn = headers.includes('_theme');
    const colorColumnIndex = headers.indexOf('_color');
    const themeColumnIndex = headers.indexOf('_theme');
    
    // Create column definitions (excluding special columns)
    const columns: ColumnDefinition[] = headers
      .slice(startColumnIndex)
      .filter(header => header !== '_color' && header !== '_theme')
      .map((header, index) => {
        const id = header.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        // Try to detect column type
        let type: 'text' | 'number' | 'currency' = 'text';
        
        if (header.toLowerCase().includes('price') || 
            header.toLowerCase().includes('cost') || 
            header.toLowerCase().includes('$')) {
          type = 'currency';
        } else if (header.toLowerCase().includes('rating') || 
                  header.toLowerCase().includes('count') || 
                  header.toLowerCase().includes('number')) {
          type = 'number';
        }
        
        return {
          id: id || `column-${index}`,
          title: header,
          type
        };
      });
    
    // Extract data rows
    const data: DataRow[] = [];
    let importedThemeId: string | undefined;
    
    // Start from the second row (index 1)
    for (let i = 1; i < parsedData.length; i++) {
      const rowData: DataRow = {
        id: `row-${i-1}`,
        color: '#ffffff', // default color
        locked: false
      };
      
      // Add index value if present
      if (hasIndexColumn) {
        rowData.indexValue = parsedData[i][0];
      }
      
      // Map cells to columns (excluding special columns)
      let colIndex = startColumnIndex;
      columns.forEach((col) => {
        if (colIndex !== colorColumnIndex && colIndex !== themeColumnIndex) {
          let value = parsedData[i][colIndex];
          
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
        colIndex++;
      });

      // Add color if present
      if (hasColorColumn) {
        rowData.color = parsedData[i][colorColumnIndex].replace(/"/g, '') || '#ffffff';
      }

      // Get theme if present
      if (hasThemeColumn && !importedThemeId) {
        importedThemeId = parsedData[i][themeColumnIndex].replace(/"/g, '');
      }
      
      data.push(rowData);
    }
    
    return {
      tableName,
      columns,
      data,
      success: true,
      themeId: importedThemeId
    };
  } catch (error) {
    console.error('Error importing file:', error);
    return {
      tableName: 'Import Failed',
      columns: [],
      data: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error importing file'
    };
  }
};