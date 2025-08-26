import { usePerformanceMode } from '../app/providers/PerformanceModeProvider';
import { useMemo } from 'react';

export const usePerformance = () => {
  const { settings, isOptimized, isEnhanced } = usePerformanceMode();

  // Оптимизированные настройки для компонентов
  const componentSettings = useMemo(() => ({
    // Анимации
    enableAnimations: settings.animations,
    animationDuration: isOptimized ? 0 : 300,
    
    // Эффекты
    enableEffects: settings.effects,
    enableShadows: settings.highQuality,
    enableGradients: settings.highQuality,
    
    // Качество изображений
    imageQuality: isOptimized ? 0.7 : 0.9,
    lazyLoadImages: isOptimized,
    
    // Рендеринг
    virtualizationThreshold: isOptimized ? 50 : 100,
    debounceTime: isOptimized ? 300 : 100,
  }), [settings, isOptimized, isEnhanced]);

  return {
    settings,
    isOptimized,
    isEnhanced,
    componentSettings,
  };
};