import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { currentTheme, themes, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const toggleThemeMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={toggleThemeMenu}
        className={`p-3 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200`}
        style={{ 
          backgroundColor: currentTheme.primaryButtonBg,
          color: currentTheme.headerTextColor
        }}
        title="Change theme"
      >
        <Palette size={20} />
      </button>

      {isOpen && (
        <div 
          className="absolute bottom-16 left-0 p-4 rounded-lg shadow-xl w-64 border"
          style={{ 
            backgroundColor: currentTheme.backgroundColor,
            borderColor: currentTheme.primaryButtonBg,
            color: currentTheme.textColor
          }}
        >
          <h3 className="text-lg font-semibold mb-3">Select Theme</h3>
          <div className="space-y-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`w-full text-left px-3 py-2 rounded flex items-center transition-colors duration-200 ${
                  currentTheme.id === theme.id ? 'font-semibold' : ''
                }`}
                style={{ 
                  backgroundColor: currentTheme.id === theme.id 
                    ? `${theme.primaryButtonBg}20` // 20% opacity
                    : 'transparent',
                  borderLeft: currentTheme.id === theme.id 
                    ? `4px solid ${theme.primaryButtonBg}` 
                    : '4px solid transparent'
                }}
              >
                <div 
                  className="w-6 h-6 rounded-full mr-3"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.headerGradientFrom}, ${theme.headerGradientTo})` 
                  }}
                ></div>
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;