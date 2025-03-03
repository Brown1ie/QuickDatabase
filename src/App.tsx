import React, { useState } from 'react';
import { PlusCircle, Download, Trash2, Save, Database, Edit, FileUp, FileDown } from 'lucide-react';
import DataTable from './components/DataTable';
import Header from './components/Header';
import PresetSelector from './components/PresetSelector';
import ImportButton from './components/ImportButton';
import { generatePDF, exportCSV } from './utils/pdfGenerator';
import toast, { Toaster } from 'react-hot-toast';

// Define preset types
export type ColumnDefinition = {
  id: string;
  title: string;
  type: 'text' | 'number' | 'currency';
};

export type Preset = {
  id: string;
  name: string;
  columns: ColumnDefinition[];
};

export type DataRow = {
  id: string;
  color?: string;
  [key: string]: any;
};

function App() {
  // Predefined presets
  const presets: Preset[] = [
    {
      id: 'flight-options',
      name: 'Flight Options',
      columns: [
        { id: 'from', title: 'From', type: 'text' },
        { id: 'to', title: 'To', type: 'text' },
        { id: 'price', title: 'Price', type: 'currency' },
      ],
    },
    {
      id: 'hotel-comparison',
      name: 'Hotel Comparison',
      columns: [
        { id: 'hotel', title: 'Hotel Name', type: 'text' },
        { id: 'location', title: 'Location', type: 'text' },
        { id: 'price', title: 'Price/Night', type: 'currency' },
        { id: 'rating', title: 'Rating', type: 'number' },
      ],
    },
  ];

  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [columns, setColumns] = useState<ColumnDefinition[]>([]);
  const [data, setData] = useState<DataRow[]>([]);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [showNewColumnInput, setShowNewColumnInput] = useState(false);
  const [newColumnPosition, setNewColumnPosition] = useState<number | null>(null);
  const [tableName, setTableName] = useState('My Table');
  const [isEditingTableName, setIsEditingTableName] = useState(false);
  const [rowColorOptions] = useState<string[]>([
    '#ffffff', // white (default)
    '#f0f9ff', // light blue
    '#f0fdf4', // light green
    '#fef2f2', // light red
    '#fffbeb', // light yellow
    '#f5f3ff', // light purple
  ]);

  // Handle preset selection
  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPreset(preset);
      setColumns(preset.columns);
      setTableName(preset.name);
      
      // Initialize with one empty row
      const emptyRow: DataRow = {
        id: `row-${Date.now()}`,
        color: '#ffffff', // default color
      };
      preset.columns.forEach((col) => {
        emptyRow[col.id] = '';
      });
      setData([emptyRow]);
    }
  };

  // Add a new column
  const handleAddColumn = (position: number) => {
    setNewColumnPosition(position);
    setShowNewColumnInput(true);
  };

  // Delete a column
  const handleDeleteColumn = (columnId: string) => {
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete the column "${columns.find(c => c.id === columnId)?.title}"? This will remove all data in this column.`)) {
      return;
    }
    
    // Remove the column from columns array
    const updatedColumns = columns.filter(col => col.id !== columnId);
    
    // Remove the column data from all rows
    const updatedData = data.map(row => {
      const newRow = { ...row };
      delete newRow[columnId];
      return newRow;
    });
    
    setColumns(updatedColumns);
    setData(updatedData);
    
    // If we had a preset selected, we're now in a custom mode
    if (selectedPreset) {
      setSelectedPreset(null);
      toast.success('Switched to custom layout');
    }
    
    toast.success('Column deleted');
  };

  // Confirm adding a new column
  const confirmAddColumn = () => {
    if (!newColumnTitle.trim()) {
      toast.error('Column title cannot be empty');
      return;
    }

    const newColumnId = newColumnTitle.toLowerCase().replace(/\s+/g, '-');
    
    const newColumn: ColumnDefinition = {
      id: newColumnId,
      title: newColumnTitle,
      type: 'text',
    };

    const position = newColumnPosition !== null ? newColumnPosition : columns.length;
    const updatedColumns = [
      ...columns.slice(0, position),
      newColumn,
      ...columns.slice(position),
    ];

    // Update data to include the new column
    const updatedData = data.map((row) => ({
      ...row,
      [newColumnId]: '',
    }));

    setColumns(updatedColumns);
    setData(updatedData);
    setNewColumnTitle('');
    setShowNewColumnInput(false);
    setNewColumnPosition(null);
    
    // If we had a preset selected, we're now in a custom mode
    if (selectedPreset) {
      setSelectedPreset(null);
      toast.success('Switched to custom layout');
    }
  };

  // Add a new row
  const handleAddRow = () => {
    const newRow: DataRow = {
      id: `row-${Date.now()}`,
      color: '#ffffff', // default color
    };
    
    columns.forEach((col) => {
      newRow[col.id] = '';
    });
    
    setData([...data, newRow]);
  };

  // Remove a row
  const handleRemoveRow = (rowId: string) => {
    setData(data.filter((row) => row.id !== rowId));
  };

  // Update cell data
  const handleCellChange = (rowId: string, columnId: string, value: any) => {
    const updatedData = data.map((row) => {
      if (row.id === rowId) {
        return {
          ...row,
          [columnId]: value,
        };
      }
      return row;
    });
    
    setData(updatedData);
  };

  // Update row color
  const handleRowColorChange = (rowId: string, color: string) => {
    const updatedData = data.map((row) => {
      if (row.id === rowId) {
        return {
          ...row,
          color,
        };
      }
      return row;
    });
    
    setData(updatedData);
  };

  // Export data as PDF
  const handleExport = () => {
    if (columns.length === 0 || data.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    generatePDF(columns, data, tableName);
    toast.success(`PDF exported as ${tableName}.pdf`);
  };
  
  // Export data as CSV
  const handleExportCSV = () => {
    if (columns.length === 0 || data.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    exportCSV(columns, data, tableName);
    toast.success(`CSV exported as ${tableName}.csv`);
  };

  // Reset the table
  const handleReset = () => {
    setSelectedPreset(null);
    setColumns([]);
    setData([]);
    setTableName('My Table');
    toast.success('Table reset');
  };

  // Handle table name change
  const handleTableNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableName(e.target.value);
  };

  // Toggle table name editing
  const toggleTableNameEditing = () => {
    setIsEditingTableName(!isEditingTableName);
  };

  // Save table name
  const saveTableName = () => {
    if (!tableName.trim()) {
      setTableName('My Table');
    }
    setIsEditingTableName(false);
  };

  // Handle data import
  const handleImport = (importedTableName: string, importedColumns: ColumnDefinition[], importedData: DataRow[]) => {
    setSelectedPreset(null); // Switch to custom mode
    setTableName(importedTableName);
    setColumns(importedColumns);
    setData(importedData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select a Preset or Create Custom Table</h2>
          <PresetSelector 
            presets={presets} 
            onSelect={handlePresetSelect} 
            selectedPresetId={selectedPreset?.id} 
          />
          
          {columns.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  {isEditingTableName ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={tableName}
                        onChange={handleTableNameChange}
                        className="text-xl font-semibold px-2 py-1 border rounded mr-2"
                        autoFocus
                        onBlur={saveTableName}
                        onKeyDown={(e) => e.key === 'Enter' && saveTableName()}
                      />
                      <button
                        onClick={saveTableName}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Save size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <h2 className="text-xl font-semibold mr-2">
                        {tableName}
                      </h2>
                      <button
                        onClick={toggleTableNameEditing}
                        className="text-gray-500 hover:text-gray-700"
                        title="Edit table name"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddRow}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <PlusCircle size={16} className="mr-1" /> Add Row
                  </button>
                  <ImportButton onImport={handleImport} />
                  <div className="relative group">
                    <button
                      onClick={handleExport}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Download size={16} className="mr-1" /> Export PDF
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center px-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 ml-2"
                    >
                      <FileDown size={16} className="mr-1" /> Export CSV
                    </button>
                  </div>
                  <button
                    onClick={handleReset}
                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Trash2 size={16} className="mr-1" /> Reset
                  </button>
                </div>
              </div>
              
              {showNewColumnInput && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                    <h3 className="text-lg font-semibold mb-4">Add New Column</h3>
                    <input
                      type="text"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      placeholder="Column Title"
                      className="w-full px-3 py-2 border rounded mb-4"
                      autoFocus
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setShowNewColumnInput(false);
                          setNewColumnTitle('');
                        }}
                        className="px-4 py-2 border rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmAddColumn}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <DataTable
                columns={columns}
                data={data}
                onCellChange={handleCellChange}
                onAddColumn={handleAddColumn}
                onRemoveRow={handleRemoveRow}
                onDeleteColumn={handleDeleteColumn}
                colorOptions={rowColorOptions}
                onRowColorChange={handleRowColorChange}
              />
            </div>
          )}
          
          {columns.length === 0 && (
            <div className="mt-8 text-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Database size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">
                Select a preset or create a custom table to get started
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setColumns([
                      { id: 'column-1', title: 'Column 1', type: 'text' },
                    ]);
                    setData([{ id: `row-${Date.now()}`, 'column-1': '', color: '#ffffff' }]);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Custom Table
                </button>
                <ImportButton onImport={handleImport} />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;