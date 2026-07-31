import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsService, AppSettings } from '@/services/settingsService';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isLoading: boolean;
}

const defaultSettings: AppSettings = {
  CompanyNameAr: 'NMO Labs Operations OS',
  CompanyNameEn: 'NMO Labs Operations OS',
  PrimaryColor: '#0f172a',
  Currency: 'SAR',
  Timezone: 'Asia/Riyadh',
  Platforms: '["منصة زد"]',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingsService.getSettings();
      if (res.success && res.data?.settings) {
        setSettings((prev) => ({ ...prev, ...res.data.settings }));
        applyBranding(res.data.settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      applyBranding(updated);
      return updated;
    });
  };

  const applyBranding = (config: AppSettings) => {
    if (config.PrimaryColor) {
      document.documentElement.style.setProperty('--primary-color', config.PrimaryColor);
    }
    if (config.CompanyNameAr) {
      document.title = config.CompanyNameAr;
    }
    if (config.FaviconURL) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = config.FaviconURL;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
