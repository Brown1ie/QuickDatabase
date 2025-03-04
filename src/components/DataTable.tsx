import React, { useState } from 'react';
import { PlusCircle, Trash2, Palette, XCircle, Lock, Unlock } from 'lucide-react';
import { ColumnDefinition, DataRow } from '../App';
import { Theme } from '../types/theme';

interface DataTableProps {
  columns: ColumnDefinition[];
  data: DataRow[];
  onCellChange: (rowId: string, columnId: string, value: any) => void;
  onAddColumn: (position: number) => void;
  onRemoveRow: (rowId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  colorOptions: string[];
  onRowColorChange: (rowId: string, color: string) => void;
  onToggleColumnLock: (columnId: string) => void;
  onToggleRowLock: (rowId: string) => void;
  indexColumnLocked: boolean;
  onToggleIndexColumnLock: () => void;
  theme: Theme;
  showIndexColumn: boolean;
  onToggleIndexColumn: () => void;
  onIndexValueChange: (rowId: string, value: string) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onCellChange,
  onAddColumn,
  onRemoveRow,
  onDeleteColumn,
  colorOptions,
  onRowColorChange,
  onToggleColumnLock,
  onToggleRowLock,
  indexColumnLocked,
  onToggleIndexColumnLock,
  theme,
  showIndexColumn,
  onToggleIndexColumn,
  onIndexValueChange
}) => {
  // Format value based on column type
  const formatValue = (value: any, type: string): string => {
    if (value === null || value === undefined || value === '') return '';
    
    if (type === 'currency' && !isNaN(parseFloat(value))) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(parseFloat(value));
    }
    
    return String(value);
  };

  // State for color picker visibility
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  // Toggle color picker for a row
  const toggleColorPicker = (rowId: string) => {
    if (activeColorPicker === rowId) {
      setActiveColorPicker(null);
    } else {
      setActiveColorPicker(rowId);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {showIndexColumn && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-between">
                  <span>#</span>
                  <div className="flex items-center">
                    <button
                      onClick={onToggleIndexColumnLock}
                      className={`ml-2 ${indexColumnLocked ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-800`}
                      title={indexColumnLocked ? "Unlock index column" : "Lock index column"}
                    >
                      {indexColumnLocked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                    <button
                      onClick={onToggleIndexColumn}
                      className="ml-2 text-red-500 hover:text-red-700"
                      title="Hide index column"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              </th>
            )}
            
            {columns.map((column, index) => (
              <React.Fragment key={column.id}>
                {index === 0 && (
                  <th className="w-10 px-2">
                    <button
                      onClick={() => onAddColumn(0)}
                      className="p-1 rounded-full hover:bg-blue-100"
                      style={{ color: theme.primaryButtonBg }}
                      title="Add column before"
                    >
                      <PlusCircle size={16} />
                    </button>
                  </th>
                )}
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-between">
                    <span>{column.title}</span>
                    <div className="flex items-center">
                      <button
                        onClick={() => onToggleColumnLock(column.id)}
                        className={`mr-2 ${column.locked ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-800`}
                        title={column.locked ? "Unlock column" : "Lock column"}
                      >
                        {column.locked ? <Lock size={14} /> : <Unlock size={14} />}
                      </button>
                      {columns.length > 1 && (
                        <button
                          onClick={() => onDeleteColumn(column.id)}
                          className="text-red-500 hover:text-red-700"
                          title={`Delete ${column.title} column`}
                          disabled={column.locked}
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </th>
                
                <th className="w-10 px-2">
                  <button
                    onClick={() => onAddColumn(index + 1)}
                    className="p-1 rounded-full hover:bg-blue-100"
                    style={{ color: theme.primaryButtonBg }}
                    title="Add column after"
                  >
                    <PlusCircle size={16} />
                  </button>
                </th>
              </React.Fragment>
            ))}
            
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={row.id} style={{ backgroundColor: row.color || '#ffffff' }}>
              {showIndexColumn && (
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${indexColumnLocked || row.locked ? 'border-2 border-red-300' : ''}`}>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={row.indexValue || (rowIndex + 1).toString()}
                      onChange={(e) => onIndexValueChange(row.id, e.target.value)}
                      className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:border-transparent ${
                        indexColumnLocked || row.locked 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      disabled={indexColumnLocked || row.locked}
                      readOnly={indexColumnLocked || row.locked}
                    />
                    {row.locked && <Lock size={14} className="text-blue-600 ml-2" />}
                  </div>
                </td>
              )}
              
              {columns.map((column, colIndex) => (
                <React.Fragment key={`${row.id}-${column.id}`}>
                  {colIndex === 0 && <td className="w-10"></td>}
                  
                  <td className={`px-6 py-4 whitespace-nowrap ${column.locked || row.locked ? 'border-2 border-red-300' : ''}`}>
                    <input
                      type={column.type === 'number' || column.type === 'currency' ? 'number' : 'text'}
                      value={row[column.id] || ''}
                      onChange={(e) => {
                        const value = column.type === 'number' || column.type === 'currency'
                          ? e.target.valueAsNumber || ''
                          : e.target.value;
                        onCellChange(row.id, column.id, value);
                      }}
                      className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:border-transparent ${
                        column.locked || row.locked 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder={`Enter ${column.title.toLowerCase()}`}
                      step={column.type === 'currency' ? '0.01' : '1'}
                      disabled={column.locked || row.locked}
                      readOnly={column.locked || row.locked}
                    />
                  </td>
                  
                  <td className="w-10"></td>
                </React.Fragment>
              ))}
              
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggleRowLock(row.id)}
                    className={`${row.locked ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-800`}
                    title={row.locked ? "Unlock row" : "Lock row"}
                  >
                    {row.locked ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => toggleColorPicker(row.id)}
                      className="text-gray-600 hover:text-gray-800 mr-2"
                      title="Change row color"
                      disabled={row.locked}
                    >
                      <Palette size={16} className={row.locked ? 'opacity-50' : ''} />
                    </button>
                    
                    {activeColorPicker === row.id && !row.locked && (
                      <div className="absolute right-0 mt-2 p-2 bg-white border rounded-md shadow-lg z-10 flex flex-wrap gap-1 w-32">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              onRowColorChange(row.id, color);
                              setActiveColorPicker(null);
                            }}
                            className="w-6 h-6 rounded-full border border-gray-300"
                            style={{ backgroundColor: color }}
                            title={color === colorOptions[0] ? 'Default' : color}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onRemoveRow(row.id)}
                    className={`text-red-600 hover:text-red-800 ${row.locked ? 'opacity-50' : ''}`}
                    title="Remove row"
                    disabled={row.locked}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;