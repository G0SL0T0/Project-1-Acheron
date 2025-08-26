// Базовые типы
export * from '@prisma/client'

// Типы для безопасности
export interface SecurityAudit {
  id: string
  userId: string
  action: string
  ipAddress: string
  userAgent?: string
  successful: boolean
  metadata?: Record<string, any>
  createdAt: Date
}

// Типы для мониторинга
export interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  module: string
  action?: string
  userId?: string
  ipAddress?: string
  userAgent?: string
  method?: string
  path?: string
  statusCode?: number
  responseTime?: number
  metadata?: Record<string, any>
}

// Типы для производительности
export type PerformanceMode = 'optimized' | 'enhanced'

export interface PerformanceSettings {
  mode: PerformanceMode
  animations: boolean
  effects: boolean
  highQuality: boolean
}

// Типы для OAuth
export type OAuthProvider = 'google' | 'yandex'

export interface OAuthProfile {
  provider: OAuthProvider
  providerId: string
  email: string
  name?: string
  avatar?: string
}

// Типы для социальных сетей
export interface SocialLinks {
  // Российские соцсети
  vk?: string
  telegram?: string
  ok?: string
  dzen?: string
  boosty?: string
  vkPlay?: string
  yandexZen?: string
  mailRu?: string
  
  // Зарубежные соцсети
  twitter?: string
  youtube?: string
  twitch?: string
  instagram?: string
  facebook?: string
  
  // Другие платформы
  tiktok?: string
  discord?: string
  github?: string
}