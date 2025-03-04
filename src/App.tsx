import React, { useState } from 'react';
import { PlusCircle, Download, Trash2, Save, Database, Edit, FileUp, FileDown, Eye, EyeOff } from 'lucide-react';
import DataTable from './components/DataTable';
import Header from './components/Header';
import PresetSelector from './components/PresetSelector';
import ImportButton from './components/ImportButton';
import ThemeSwitcher from './components/ThemeSwitcher';
import { generatePDF, exportCSV } from './utils/pdfGenerator';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from './context/ThemeContext';

// Define preset types
export type ColumnDefinition = {
  id: string;
  title: string;
  type: 'text' | 'number' | 'currency';
  locked?: boolean;
};

export type Preset = {
  id: string;
  name: string;
  columns: ColumnDefinition[];
};

export type DataRow = {
  id: string;
  color?: string;
  locked?: boolean;
  indexValue?: string;
  [key: string]: any;
};

function App() {
  const { currentTheme } = useTheme();
  
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
  const [rowColorOptions] = useState<string[]>(currentTheme.rowColorOptions);
  const [indexColumnLocked, setIndexColumnLocked] = useState(false);
  const [showIndexColumn, setShowIndexColumn] = useState(true);

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
        color: currentTheme.rowColorOptions[0], // default color
      };
      preset.columns.forEach((col) => {
        emptyRow[col.id] = '';
      });
      setData([emptyRow]);
      setIndexColumnLocked(false);
      setShowIndexColumn(true);
    }
  };

  // Add a new column
  const handleAddColumn = (position: number) => {
    setNewColumnPosition(position);
    setShowNewColumnInput(true);
  };

  // Delete a column
  const handleDeleteColumn = (columnId: string) => {
    // Check if column is locked
    const column = columns.find(col => col.id === columnId);
    if (column?.locked) {
      toast.error('Cannot delete a locked column. Unlock it first.');
      return;
    }
    
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

  // Toggle column lock
  const handleToggleColumnLock = (columnId: string) => {
    const updatedColumns = columns.map(col => {
      if (col.id === columnId) {
        return { ...col, locked: !col.locked };
      }
      return col;
    });
    
    setColumns(updatedColumns);
    toast.success(`Column ${updatedColumns.find(c => c.id === columnId)?.locked ? 'locked' : 'unlocked'}`);
  };
  
  // Toggle index column lock
  const handleToggleIndexColumnLock = () => {
    setIndexColumnLocked(!indexColumnLocked);
    toast.success(`Index column ${!indexColumnLocked ? 'locked' : 'unlocked'}`);
  };
  
  // Toggle index column visibility
  const handleToggleIndexColumn = () => {
    setShowIndexColumn(!showIndexColumn);
    toast.success(`Index column ${showIndexColumn ? 'hidden' : 'shown'}`);
  };
  
  // Handle index value change
  const handleIndexValueChange = (rowId: string, value: string) => {
    const updatedData = data.map(row => {
      if (row.id === rowId) {
        return { ...row, indexValue: value };
      }
      return row;
    });
    
    setData(updatedData);
  };

  // Toggle row lock
  const handleToggleRowLock = (rowId: string) => {
    const updatedData = data.map(row => {
      if (row.id === rowId) {
        return { ...row, locked: !row.locked };
      }
      return row;
    });
    
    setData(updatedData);
    toast.success(`Row ${updatedData.find(r => r.id === rowId)?.locked ? 'locked' : 'unlocked'}`);
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
      locked: false,
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
      color: currentTheme.rowColorOptions[0], // default color
      locked: false,
    };
    
    columns.forEach((col) => {
      newRow[col.id] = '';
    });
    
    setData([...data, newRow]);
  };

  // Remove a row
  const handleRemoveRow = (rowId: string) => {
    // Check if row is locked
    const row = data.find(r => r.id === rowId);
    if (row?.locked) {
      toast.error('Cannot delete a locked row. Unlock it first.');
      return;
    }
    
    setData(data.filter((row) => row.id !== rowId));
  };

  // Update cell data
  const handleCellChange = (rowId: string, columnId: string, value: any) => {
    // Check if row or column is locked
    const row = data.find(r => r.id === rowId);
    const column = columns.find(c => c.id === columnId);
    
    if (row?.locked) {
      toast.error('Cannot edit a locked row');
      return;
    }
    
    if (column?.locked) {
      toast.error('Cannot edit a locked column');
      return;
    }
    
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
    // Check if row is locked
    const row = data.find(r => r.id === rowId);
    if (row?.locked) {
      toast.error('Cannot change color of a locked row');
      return;
    }
    
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
    
    generatePDF(columns, data, tableName, showIndexColumn);
    toast.success(`PDF exported as ${tableName}.pdf`);
  };
  
  // Export data as CSV
  const handleExportCSV = () => {
    if (columns.length === 0 || data.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    exportCSV(columns, data, tableName, showIndexColumn);
    toast.success(`CSV exported as ${tableName}.csv`);
  };

  // Reset the table
  const handleReset = () => {
    setSelectedPreset(null);
    setColumns([]);
    setData([]);
    setTableName('My Table');
    setIndexColumnLocked(false);
    setShowIndexColumn(true);
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
    setIndexColumnLocked(false);
    setShowIndexColumn(true);
  };

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: currentTheme.backgroundColor }}
    >
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div 
          className="rounded-lg shadow-md p-6 mb-8"
          style={{ backgroundColor: '#ffffff' }}
        >
          <h2 
            className="text-xl font-semibold mb-4"
            style={{ color: currentTheme.textColor }}
          >
            Select a Preset or Create Custom Table
          </h2>
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
                        style={{ color: currentTheme.textColor }}
                      />
                      <button
                        onClick={saveTableName}
                        style={{ color: currentTheme.primaryButtonBg }}
                        className="hover:opacity-80"
                      >
                        <Save size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <h2 
                        className="text-xl font-semibold mr-2"
                        style={{ color: currentTheme.textColor }}
                      >
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
                    className="flex items-center px-3 py-2 text-white rounded hover:opacity-90 transition-opacity"
                    style={{ 
                      backgroundColor: currentTheme.primaryButtonBg,
                      color: '#ffffff'
                    }}
                  >
                    <PlusCircle size={16} className="mr-1" /> Add Row
                  </button>
                  <button
                    onClick={handleToggleIndexColumn}
                    className="flex items-center px-3 py-2 text-white rounded hover:opacity-90 transition-opacity"
                    style={{ 
                      backgroundColor: currentTheme.secondaryButtonBg,
                      color: '#ffffff'
                    }}
                    title={showIndexColumn ? "Hide index column" : "Show index column"}
                  >
                    {showIndexColumn ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
                    {showIndexColumn ? "Hide #" : "Show #"}
                  </button>
                  <ImportButton onImport={handleImport} />
                  <div className="relative group">
                    <button
                      onClick={handleExport}
                      className="flex items-center px-3 py-2 text-white rounded hover:opacity-90 transition-opacity"
                      style={{ 
                        backgroundColor: currentTheme.secondaryButtonBg,
                        color: '#ffffff'
                      }}
                    >
                      <Download size={16} className="mr-1" /> Export PDF
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center px-3 py-2 text-white rounded hover:opacity-90 transition-opacity ml-2"
                      style={{ 
                        backgroundColor: currentTheme.secondaryButtonBg,
                        color: '#ffffff'
                      }}
                    >
                      <FileDown size={16} className="mr-1" /> Export CSV
                    </button>
                  </div>
                  <button
                    onClick={handleReset}
                    className="flex items-center px-3 py-2 text-white rounded hover:opacity-90 transition-opacity"
                    style={{ 
                      backgroundColor: currentTheme.dangerButtonBg,
                      color: '#ffffff'
                    }}
                  >
                    <Trash2 size={16} className="mr-1" /> Reset
                  </button>
                </div>
              </div>
              
              {showNewColumnInput && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div 
                    className="p-6 rounded-lg shadow-lg w-96"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <h3 
                      className="text-lg font-semibold mb-4"
                      style={{ color: currentTheme.textColor }}
                    >
                      Add New Column
                    </h3>
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
                        className="px-4 py-2 text-white rounded hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: currentTheme.primaryButtonBg }}
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
                colorOptions={currentTheme.rowColorOptions}
                onRowColorChange={handleRowColorChange}
                onToggleColumnLock={handleToggleColumnLock}
                onToggleRowLock={handleToggleRowLock}
                indexColumnLocked={indexColumnLocked}
                onToggleIndexColumnLock={handleToggleIndexColumnLock}
                theme={currentTheme}
                showIndexColumn={showIndexColumn}
                onToggleIndexColumn={handleToggleIndexColumn}
                onIndexValueChange={handleIndexValueChange}
              />
            </div>
          )}
          
          {columns.length === 0 && (
            <div className="mt-8 text-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Database 
                size={48} 
                className="mx-auto mb-4" 
                style={{ color: '#9ca3af' }}
              />
              <p 
                className="mb-4"
                style={{ color: currentTheme.textColor }}
              >
                Select a preset or create a custom table to get started
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setColumns([
                      { id: 'column-1', title: 'Column 1', type: 'text', locked: false },
                    ]);
                    setData([{ 
                      id: `row-${Date.now()}`, 
                      'column-1': '', 
                      color: currentTheme.rowColorOptions[0],
                      locked: false
                    }]);
                  }}
                  className="px-4 py-2 text-white rounded hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: currentTheme.primaryButtonBg }}
                >
                  Create Custom Table
                </button>
                <ImportButton onImport={handleImport} />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <ThemeSwitcher />
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;