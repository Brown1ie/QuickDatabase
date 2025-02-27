import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ColumnDefinition, DataRow } from '../App';

// Add the missing type for jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

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
  
  // Generate the table
  doc.autoTable({
    startY: 40,
    head: [tableColumns.map((col) => col.header)],
    body: tableData.map((row) => 
      tableColumns.map((col) => row[col.dataKey])
    ),
    theme: 'grid',
    headStyles: {
      fillColor: [66, 133, 244],
      textColor: 255,
      fontStyle: 'bold',
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