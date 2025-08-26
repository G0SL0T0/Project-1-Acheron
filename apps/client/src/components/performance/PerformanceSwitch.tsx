import React from 'react';
import { usePerformance } from '@hooks/usePerformance';

interface PerformanceSwitchProps {
  optimized: React.ReactNode;
  enhanced: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PerformanceSwitch: React.FC<PerformanceSwitchProps> = ({
  optimized,
  enhanced,
  fallback,
}) => {
  const { isOptimized, isEnhanced } = usePerformance();

  if (isOptimized) {
    return <>{optimized}</>;
  }

  if (isEnhanced) {
    return <>{enhanced}</>;
  }

  return <>{fallback || optimized}</>;
};