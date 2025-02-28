import React, { useRef } from 'react';
import { FileUp } from 'lucide-react';
import { importPDF } from '../utils/pdfImporter.ts';
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
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    toast.loading('Importing PDF...', { id: 'import-pdf' });
    
    try {
      const result = await importPDF(file);
      
      if (result.success && result.columns.length > 0 && result.data.length > 0) {
        onImport(result.tableName, result.columns, result.data);
        toast.success('PDF imported successfully', { id: 'import-pdf' });
      } else {
        toast.error(result.error || 'Failed to extract data from PDF', { id: 'import-pdf' });
      }
    } catch (error) {
      console.error('Error importing PDF:', error);
      toast.error('Error importing PDF', { id: 'import-pdf' });
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
        title="Import PDF"
      >
        <FileUp size={16} className="mr-1" /> Import PDF
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />
    </>
  );
};

export default ImportButton;