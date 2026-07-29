import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type Direction = 'ltr' | 'rtl';

interface ThemeContextType {
  direction: Direction;
  toggleDirection: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [direction, setDirection] = useState<Direction>('ltr');

  useEffect(() => {
    // Automatically set direction based on language
    const lang = i18n.language;
    if (lang === 'ar') {
      setDirection('rtl');
    } else {
      setDirection('ltr');
    }
  }, [i18n.language]);

  useEffect(() => {
    document.documentElement.dir = direction;
    // ensure Cairo font is applied via a class on body or html if not globally applied
    if (direction === 'rtl' || i18n.language === 'ar') {
       document.documentElement.classList.add('font-cairo');
    } else {
       // if we want to remove it for English, but usually Cairo supports English nicely too
       document.documentElement.classList.add('font-cairo'); 
    }
  }, [direction, i18n.language]);

  const toggleDirection = () => {
    setDirection(prev => prev === 'ltr' ? 'rtl' : 'ltr');
  };

  return (
    <ThemeContext.Provider value={{ direction, toggleDirection }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
