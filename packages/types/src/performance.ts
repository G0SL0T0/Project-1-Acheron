export type PerformanceMode = 'optimized' | 'enhanced';

export interface PerformanceSettings {
  mode: PerformanceMode;
  animations: boolean;
  effects: boolean;
  highQuality: boolean;
}

export const DEFAULT_PERFORMANCE_SETTINGS: PerformanceSettings = {
  mode: 'optimized',
  animations: false,
  effects: false,
  highQuality: false,
};

export const ENHANCED_PERFORMANCE_SETTINGS: PerformanceSettings = {
  mode: 'enhanced',
  animations: true,
  effects: true,
  highQuality: true,
};