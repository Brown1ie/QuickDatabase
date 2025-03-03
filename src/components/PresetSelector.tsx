import React from 'react';
import { Preset } from '../App';
import { useTheme } from '../context/ThemeContext';

interface PresetSelectorProps {
  presets: Preset[];
  onSelect: (presetId: string) => void;
  selectedPresetId: string | undefined;
}

const PresetSelector: React.FC<PresetSelectorProps> = ({ 
  presets, 
  onSelect, 
  selectedPresetId 
}) => {
  const { currentTheme } = useTheme();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {presets.map((preset) => (
        <div
          key={preset.id}
          className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
            selectedPresetId === preset.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
          onClick={() => onSelect(preset.id)}
          style={{ 
            borderColor: selectedPresetId === preset.id ? currentTheme.primaryButtonBg : undefined,
            backgroundColor: selectedPresetId === preset.id ? `${currentTheme.primaryButtonBg}10` : undefined
          }}
        >
          <h3 
            className="font-semibold text-lg mb-2"
            style={{ color: currentTheme.textColor }}
          >
            {preset.name}
          </h3>
          <div className="text-sm text-gray-600">
            <p>{preset.columns.length} columns</p>
            <p className="mt-1">
              Columns: {preset.columns.map((col) => col.title).join(', ')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PresetSelector;