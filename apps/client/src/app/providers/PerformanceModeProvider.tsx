import React, { createContext, useContext, useEffect, useState } from 'react';
import { PerformanceMode, PerformanceSettings, DEFAULT_PERFORMANCE_SETTINGS } from '@streaming/types';

interface PerformanceContextType {
  settings: PerformanceSettings;
  setMode: (mode: PerformanceMode) => void;
  isOptimized: boolean;
  isEnhanced: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const PerformanceModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PerformanceSettings>(DEFAULT_PERFORMANCE_SETTINGS);

  useEffect(() => {
    // Загружаем настройки из localStorage
    const saved = localStorage.getItem('performanceMode');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
      } catch (error) {
        console.error('Ошибка загрузки настроек производительности:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Сохраняем настройки в localStorage и cookies
    localStorage.setItem('performanceMode', JSON.stringify(settings));
    
    // Устанавливаем cookie для серверной части
    document.cookie = `performanceMode=${settings.mode}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Добавляем класс для глобальных стилей
    document.documentElement.setAttribute('data-performance', settings.mode);
  }, [settings]);

  const setMode = (mode: PerformanceMode) => {
    const newSettings = mode === 'enhanced' 
      ? { mode, animations: true, effects: true, highQuality: true }
      : { mode, animations: false, effects: false, highQuality: false };
    
    setSettings(newSettings);
  };

  const isOptimized = settings.mode === 'optimized';
  const isEnhanced = settings.mode === 'enhanced';

  return (
    <PerformanceContext.Provider value={{ settings, setMode, isOptimized, isEnhanced }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformanceMode = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceMode must be used within PerformanceModeProvider');
  }
  return context;
};