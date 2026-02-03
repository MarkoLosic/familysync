import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Color palette from design
export const lightTheme = {
  name: 'light' as const,
  colors: {
    // Backgrounds
    background: '#F8F9FA',
    card: '#FFFFFF',
    cardSecondary: '#ECEEF0',
    
    // Primary colors
    primary: '#A28EF9',
    primaryLight: '#A28EF920',
    
    // Accent colors
    green: '#A4F5A6',
    greenLight: '#A4F5A620',
    orange: '#FFD89D',
    orangeLight: '#FFD89D40',
    pink: '#F9C4D2',
    pinkLight: '#F9C4D220',
    
    // Text
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    
    // UI elements
    border: '#E5E7EB',
    inputBg: '#F3F4F6',
    
    // Status
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Tab bar
    tabBar: '#1A1A1A',
    tabBarBorder: '#2A2A2A',
    tabActive: '#FFFFFF',
    tabInactive: '#6B7280',
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
  },
};

export const darkTheme = {
  name: 'dark' as const,
  colors: {
    // Backgrounds
    background: '#181A20',
    card: '#23262F',
    cardSecondary: '#2D3039',
    
    // Primary colors
    primary: '#A78BFA',
    primaryLight: '#A78BFA20',
    
    // Accent colors
    green: '#4ADE80',
    greenLight: '#22C55E20',
    orange: '#FBBF24',
    orangeLight: '#F59E0B20',
    pink: '#F472B6',
    pinkLight: '#F472B620',
    
    // Text
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    
    // UI elements
    border: '#3F3F46',
    inputBg: '#181A20',
    
    // Status
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    
    // Tab bar
    tabBar: '#181A20',
    tabBarBorder: '#23262F',
    tabActive: '#A78BFA',
    tabInactive: '#6B7280',
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export const colorfulTheme = {
  name: 'colorful' as const,
  colors: {
    // Backgrounds
    background: '#FFF8E1',
    card: '#FFFFFF',
    cardSecondary: '#F0F8FF',
    
    // Primary colors
    primary: '#FF6B6B',
    primaryLight: '#FF6B6B20',
    
    // Accent colors
    green: '#51CF66',
    greenLight: '#51CF6620',
    orange: '#FFD43B',
    orangeLight: '#FFD43B20',
    pink: '#FF8A65',
    pinkLight: '#FF8A6520',
    
    // Text
    text: '#2D3436',
    textSecondary: '#636E72',
    textMuted: '#B2BEC3',
    
    // UI elements
    border: '#DFE6E9',
    inputBg: '#F8F9FA',
    
    // Status
    success: '#51CF66',
    warning: '#FFD43B',
    error: '#FF6B6B',
    info: '#74B9FF',
    
    // Tab bar
    tabBar: '#2D3436',
    tabBarBorder: '#34495E',
    tabActive: '#FF6B6B',
    tabInactive: '#636E72',
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
  },
};

export type Theme = typeof lightTheme | typeof darkTheme | typeof colorfulTheme;
export type ThemeName = 'light' | 'dark' | 'colorful';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  toggleTheme: () => void;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@spona_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'colorful') {
        setThemeName(savedTheme);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const saveTheme = async (name: ThemeName) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const themes: ThemeName[] = ['light', 'dark', 'colorful'];
    const currentIndex = themes.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % themes.length;
    const newTheme = themes[nextIndex];
    setThemeName(newTheme);
    saveTheme(newTheme);
  };

  const setTheme = (name: ThemeName) => {
    setThemeName(name);
    saveTheme(name);
  };

  const theme = themeName === 'light' ? lightTheme : themeName === 'dark' ? darkTheme : colorfulTheme;

  return (
    <ThemeContext.Provider value={{ theme, themeName, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
