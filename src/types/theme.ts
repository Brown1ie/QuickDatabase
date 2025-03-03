export interface Theme {
    id: string;
    name: string;
    // Main background color
    backgroundColor: string;
    // Header gradient colors
    headerGradientFrom: string;
    headerGradientTo: string;
    // Text colors
    headerTextColor: string;
    textColor: string;
    // Button colors
    primaryButtonBg: string;
    primaryButtonHoverBg: string;
    secondaryButtonBg: string;
    secondaryButtonHoverBg: string;
    dangerButtonBg: string;
    dangerButtonHoverBg: string;
    // Row color options
    rowColorOptions: string[];
  }
  
  // Default theme (current colors)
  export const defaultTheme: Theme = {
    id: 'default',
    name: 'Default Blue',
    backgroundColor: '#f9fafb', // light gray
    headerGradientFrom: '#2563eb', // blue-600
    headerGradientTo: '#4338ca', // indigo-700
    headerTextColor: '#ffffff', // white
    textColor: '#1f2937', // gray-800
    primaryButtonBg: '#2563eb', // blue-600
    primaryButtonHoverBg: '#1d4ed8', // blue-700
    secondaryButtonBg: '#10b981', // green-600
    secondaryButtonHoverBg: '#059669', // green-700
    dangerButtonBg: '#dc2626', // red-600
    dangerButtonHoverBg: '#b91c1c', // red-700
    rowColorOptions: [
      '#ffffff', // white (default)
      '#f0f9ff', // light blue
      '#f0fdf4', // light green
      '#fef2f2', // light red
      '#fffbeb', // light yellow
      '#f5f3ff', // light purple
    ],
  };
  
  // Dark theme
  export const darkTheme: Theme = {
    id: 'dark',
    name: 'Dark Mode',
    backgroundColor: '#111827', // gray-900
    headerGradientFrom: '#1e3a8a', // blue-900
    headerGradientTo: '#312e81', // indigo-900
    headerTextColor: '#f3f4f6', // gray-100
    textColor: '#e5e7eb', // gray-200
    primaryButtonBg: '#3b82f6', // blue-500
    primaryButtonHoverBg: '#2563eb', // blue-600
    secondaryButtonBg: '#10b981', // green-500
    secondaryButtonHoverBg: '#059669', // green-600
    dangerButtonBg: '#ef4444', // red-500
    dangerButtonHoverBg: '#dc2626', // red-600
    rowColorOptions: [
      '#1f2937', // gray-800 (default for dark mode)
      '#1e3a8a', // blue-900
      '#064e3b', // green-900
      '#7f1d1d', // red-900
      '#78350f', // yellow-900
      '#4c1d95', // purple-900
    ],
  };
  
  // Purple theme
  export const purpleTheme: Theme = {
    id: 'purple',
    name: 'Purple Passion',
    backgroundColor: '#f5f3ff', // purple-50
    headerGradientFrom: '#7c3aed', // purple-600
    headerGradientTo: '#c026d3', // fuchsia-600
    headerTextColor: '#ffffff', // white
    textColor: '#4b5563', // gray-600
    primaryButtonBg: '#8b5cf6', // purple-500
    primaryButtonHoverBg: '#7c3aed', // purple-600
    secondaryButtonBg: '#d946ef', // fuchsia-500
    secondaryButtonHoverBg: '#c026d3', // fuchsia-600
    dangerButtonBg: '#f43f5e', // rose-500
    dangerButtonHoverBg: '#e11d48', // rose-600
    rowColorOptions: [
      '#ffffff', // white (default)
      '#ede9fe', // purple-100
      '#fae8ff', // fuchsia-100
      '#ffe4e6', // rose-100
      '#dbeafe', // blue-100
      '#ecfdf5', // green-100
    ],
  };
  
  // Nature theme
  export const natureTheme: Theme = {
    id: 'nature',
    name: 'Natural Green',
    backgroundColor: '#f0fdf4', // green-50
    headerGradientFrom: '#16a34a', // green-600
    headerGradientTo: '#0d9488', // teal-600
    headerTextColor: '#ffffff', // white
    textColor: '#374151', // gray-700
    primaryButtonBg: '#22c55e', // green-500
    primaryButtonHoverBg: '#16a34a', // green-600
    secondaryButtonBg: '#14b8a6', // teal-500
    secondaryButtonHoverBg: '#0d9488', // teal-600
    dangerButtonBg: '#f97316', // orange-500
    dangerButtonHoverBg: '#ea580c', // orange-600
    rowColorOptions: [
      '#ffffff', // white (default)
      '#d1fae5', // green-100
      '#ccfbf1', // teal-100
      '#e0f2fe', // sky-100
      '#fff7ed', // orange-100
      '#fef3c7', // amber-100
    ],
  };
  
  // All available themes
  export const themes: Theme[] = [
    defaultTheme,
    darkTheme,
    purpleTheme,
    natureTheme,
  ];