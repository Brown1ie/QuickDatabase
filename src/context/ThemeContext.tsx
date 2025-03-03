import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Theme, defaultTheme, themes } from '../types/theme';

interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: defaultTheme,
  themes: themes,
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Try to get saved theme from localStorage
  const getSavedTheme = (): Theme => {
    try {
      const savedThemeId = localStorage.getItem('dataOrganizerTheme');
      if (savedThemeId) {
        const foundTheme = themes.find(t => t.id === savedThemeId);
        if (foundTheme) return foundTheme;
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    return defaultTheme;
  };

  const [currentTheme, setCurrentTheme] = useState<Theme>(getSavedTheme());

  const setTheme = (themeId: string) => {
    const newTheme = themes.find(t => t.id === themeId) || defaultTheme;
    setCurrentTheme(newTheme);
    
    // Save to localStorage
    try {
      localStorage.setItem('dataOrganizerTheme', newTheme.id);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themes, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};