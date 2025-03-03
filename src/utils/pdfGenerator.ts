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

export const generatePDF = (columns: ColumnDefinition[], data: DataRow[], tableName: string = 'Data Export') => {
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
  const tableColumns = columns.map((column) => ({
    header: column.title,
    dataKey: column.id,
  }));
  
  const tableData = data.map((row) => {
    const rowData: Record<string, any> = {};
    columns.forEach((column) => {
      // Format the value based on column type
      if (column.type === 'currency' && row[column.id]) {
        rowData[column.id] = `$${parseFloat(row[column.id]).toFixed(2)}`;
      } else {
        rowData[column.id] = row[column.id] || '';
      }
    });
    return rowData;
  });
  
  // Generate the table with row colors
  doc.autoTable({
    startY: 40,
    head: [tableColumns.map((col) => col.header)],
    body: tableData.map((row, index) => 
      tableColumns.map((col) => row[col.dataKey])
    ),
    theme: 'grid',
    headStyles: {
      fillColor: [66, 133, 244],
      textColor: 255,
      fontStyle: 'bold',
    },
    // Use row colors from data
    didParseCell: function(data) {
      const rowIndex = data.row.index;
      if (rowIndex >= 0 && rowIndex < data.table.body.length) {
        const rowColor = data.row.raw?.color || data[rowIndex]?.color || '#ffffff';
        if (data.section === 'body') {
          // Convert hex color to RGB and lighten it for better readability
          const rgb = lightenColor(hexToRgb(rowColor));
          data.cell.styles.fillColor = rgb;
        }
      }
    },
    // Add row colors
    willDrawCell: function(data) {
      if (data.section === 'body') {
        const rowIndex = data.row.index;
        const originalRow = data.row.index < data.length ? data[rowIndex] : null;
        if (originalRow && originalRow.color && originalRow.color !== '#ffffff') {
          const rgb = lightenColor(hexToRgb(originalRow.color));
          data.cell.styles.fillColor = rgb;
        }
      }
    },
    // Map row data to include color information
    rowStyles: function(row, rowIndex) {
      const originalRow = data[rowIndex];
      if (originalRow && originalRow.color && originalRow.color !== '#ffffff') {
        const rgb = lightenColor(hexToRgb(originalRow.color));
        return { fillColor: rgb };
      }
      return {};
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