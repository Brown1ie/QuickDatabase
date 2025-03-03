import React from 'react';
import { Database } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header: React.FC = () => {
  const { currentTheme } = useTheme();
  
  return (
    <header 
      className="text-white shadow-md"
      style={{ 
        background: `linear-gradient(to right, ${currentTheme.headerGradientFrom}, ${currentTheme.headerGradientTo})` 
      }}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database size={32} className="mr-3" />
            <div>
              <h1 className="text-2xl font-bold">DataOrganizer</h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Organize and export your data with ease</p>
            </div>
          </div>
          <div>
            <a 
              href="https://github.com/Brown1ie" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-blue-200 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;