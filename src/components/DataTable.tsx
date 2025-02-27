import React, { useState } from 'react';
import { PlusCircle, Trash2, Palette } from 'lucide-react';
import { ColumnDefinition, DataRow } from '../App';

interface DataTableProps {
  columns: ColumnDefinition[];
  data: DataRow[];
  onCellChange: (rowId: string, columnId: string, value: any) => void;
  onAddColumn: (position: number) => void;
  onRemoveRow: (rowId: string) => void;
  colorOptions: string[];
  onRowColorChange: (rowId: string, color: string) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onCellChange,
  onAddColumn,
  onRemoveRow,
  colorOptions,
  onRowColorChange,
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              #
            </th>
            
            {columns.map((column, index) => (
              <React.Fragment key={column.id}>
                {index === 0 && (
                  <th className="w-10 px-2">
                    <button
                      onClick={() => onAddColumn(0)}
                      className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
                      title="Add column before"
                    >
                      <PlusCircle size={16} />
                    </button>
                  </th>
                )}
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column.title}
                </th>
                
                <th className="w-10 px-2">
                  <button
                    onClick={() => onAddColumn(index + 1)}
                    className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {rowIndex + 1}
              </td>
              
              {columns.map((column, colIndex) => (
                <React.Fragment key={`${row.id}-${column.id}`}>
                  {colIndex === 0 && <td className="w-10"></td>}
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type={column.type === 'number' || column.type === 'currency' ? 'number' : 'text'}
                      value={row[column.id] || ''}
                      onChange={(e) => {
                        const value = column.type === 'number' || column.type === 'currency'
                          ? e.target.valueAsNumber || ''
                          : e.target.value;
                        onCellChange(row.id, column.id, value);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Enter ${column.title.toLowerCase()}`}
                      step={column.type === 'currency' ? '0.01' : '1'}
                    />
                  </td>
                  
                  <td className="w-10"></td>
                </React.Fragment>
              ))}
              
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <button
                      onClick={() => toggleColorPicker(row.id)}
                      className="text-gray-600 hover:text-gray-800 mr-2"
                      title="Change row color"
                    >
                      <Palette size={16} />
                    </button>
                    
                    {activeColorPicker === row.id && (
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
                            title={color === '#ffffff' ? 'Default' : color}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onRemoveRow(row.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Remove row"
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