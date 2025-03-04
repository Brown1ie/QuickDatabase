import React, { useEffect, useState } from 'react';
import { Database } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getGitHubInfo } from '../utils/githubInfo';

const Header: React.FC = () => {
  const { currentTheme } = useTheme();
  const [version, setVersion] = useState('V1.0');
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchGitHubInfo = async () => {
      try {
        const info = await getGitHubInfo();
        setVersion(info.version);
        setLastUpdated(info.lastUpdated);
      } catch (error) {
        console.error('Error fetching version info:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGitHubInfo();
  }, []);
  
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
          <div className="flex flex-col items-end">
            <a 
              href="https://github.com/Brown1ie/QuickDatabase" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-blue-200 transition-colors mb-1"
            >
              GitHub
            </a>
            <div className="text-sm opacity-80">
              <span>{loading ? 'Loading...' : version}</span>
              {lastUpdated && (
                <div className="text-xs opacity-70">
                  Last updated: {lastUpdated}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;