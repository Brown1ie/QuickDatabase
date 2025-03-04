import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ColumnDefinition, DataRow } from '../App';

// Add the missing type for jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Helper function to convert hex color to RGB
const hexToRgb = (hex: string): [number, number, number] => {
  // Default to white if no color is provided
  if (!hex || hex === '#ffffff') return [255, 255, 255];
  
  // Remove the # if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16) || 255;
  const g = parseInt(hex.substring(2, 4), 16) || 255;
  const b = parseInt(hex.substring(4, 6), 16) || 255;
  
  return [r, g, b];
};

// Helper function to lighten a color for PDF
const lightenColor = (rgb: [number, number, number], factor: number = 0.9): [number, number, number] => {
  return [
    Math.min(255, rgb[0] + (255 - rgb[0]) * factor),
    Math.min(255, rgb[1] + (255 - rgb[1]) * factor),
    Math.min(255, rgb[2] + (255 - rgb[2]) * factor)
  ];
};

export const generatePDF = (
  columns: ColumnDefinition[], 
  data: DataRow[], 
  tableName: string = 'Data Export',
  includeIndexColumn: boolean = true
) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: tableName,
    subject: `Exported data from DataOrganizer: ${tableName}`,
    creator: 'DataOrganizer',
  });
  
  // Add title
  doc.setFontSize(20);
  doc.text(tableName, 14, 22);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.setTextColor(100);
  const timestamp = new Date().toLocaleString();
  doc.text(`Generated on: ${timestamp}`, 14, 30);
  
  // Format data for the table
  const tableColumns = includeIndexColumn 
    ? [{ header: '#', dataKey: 'index' }].concat(columns.map((column) => ({
        header: column.title,
        dataKey: column.id,
      })))
    : columns.map((column) => ({
        header: column.title,
        dataKey: column.id,
      }));
  
  const tableData = data.map((row, index) => {
    const rowData: Record<string, any> = {};
    
    // Add index column if needed
    if (includeIndexColumn) {
      rowData['index'] = row.indexValue || (index + 1).toString();
    }
    
    // Add other columns
    columns.forEach((column) => {
      // Format the value based on column type
      if (column.type === 'currency' && row[column.id]) {
        rowData[column.id] = `$${parseFloat(row[column.id]).toFixed(2)}`;
      } else {
        rowData[column.id] = row[column.id] || '';
      }
    });
    
    // Add color information
    rowData.color = row.color || '#ffffff';
    
    return rowData;
  });
  
  // Generate the table with row colors
  doc.autoTable({
    startY: 40,
    head: [tableColumns.map((col) => col.header)],
    body: tableData.map((row) => {
      // Remove color from the data array that goes to the table
      const { color, ...rowData } = row;
      return Object.values(rowData);
    }),
    theme: 'grid',
    headStyles: {
      fillColor: [66, 133, 244],
      textColor: 255,
      fontStyle: 'bold',
    },
    // Use row colors from data
    didParseCell: function(data) {
      const rowIndex = data.row.index;
      if (rowIndex >= 0 && rowIndex < tableData.length) {
        const rowColor = tableData[rowIndex].color || '#ffffff';
        if (data.section === 'body') {
          // Convert hex color to RGB and lighten it for better readability
          const rgb = lightenColor(hexToRgb(rowColor));
          data.cell.styles.fillColor = rgb;
        }
      }
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    margin: { top: 40 },
  });
  
  // Save the PDF with the table name
  const fileName = `${tableName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(fileName);
};

// Export CSV function
export const exportCSV = (
  columns: ColumnDefinition[], 
  data: DataRow[], 
  tableName: string = 'Data Export',
  includeIndexColumn: boolean = true
) => {
  // Create CSV header row
  let headers = includeIndexColumn ? ['#'] : [];
  headers = headers.concat(columns.map(col => col.title));
  const headerRow = headers.map(header => `"${header}"`).join(',');
  
  // Create CSV data rows
  const dataRows = data.map((row, index) => {
    let values = [];
    
    // Add index column if needed
    if (includeIndexColumn) {
      values.push(`"${row.indexValue || (index + 1)}"`);
    }
    
    // Add other columns
    values = values.concat(columns.map(col => {
      let value = row[col.id] || '';
      
      // Format currency values
      if (col.type === 'currency' && value) {
        value = `$${parseFloat(value).toFixed(2)}`;
      }
      
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }));
    
    return values.join(',');
  });
  
  // Combine all rows
  const csvContent = [headerRow, ...dataRows].join('\n');
  
  // Create a blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${tableName.replace(/\s+/g, '-').toLowerCase()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};