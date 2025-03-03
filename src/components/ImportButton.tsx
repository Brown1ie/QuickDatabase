import React, { useRef } from 'react';
import { FileUp } from 'lucide-react';
import { importPDF } from '../utils/pdfImporter';
import toast from 'react-hot-toast';

interface ImportButtonProps {
  onImport: (tableName: string, columns: any[], data: any[]) => void;
}

const ImportButton: React.FC<ImportButtonProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Now accepting CSV files instead of PDFs
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    toast.loading('Importing data...', { id: 'import-data' });
    
    try {
      const result = await importPDF(file);
      
      if (result.success && result.columns.length > 0 && result.data.length > 0) {
        onImport(result.tableName, result.columns, result.data);
        toast.success('Data imported successfully', { id: 'import-data' });
      } else {
        toast.error(result.error || 'Failed to extract data from file', { id: 'import-data' });
      }
    } catch (error) {
      console.error('Error importing file:', error);
      toast.error('Error importing file', { id: 'import-data' });
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        title="Import CSV"
      >
        <FileUp size={16} className="mr-1" /> Import CSV
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,text/csv"
        className="hidden"
      />
    </>
  );
};

export default ImportButton;