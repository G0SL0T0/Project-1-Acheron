import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggingService } from './logging.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

interface LockdownConfig {
  isActive: boolean;
  reason: string;
  initiatedBy: string;
  initiatedAt: Date;
  estimatedDuration?: number;
  affectedServices: string[];
  allowAdminAccess: boolean;
  message: string;
}

@Injectable()
export class LockdownService implements OnModuleInit {
  private configPath: string;
  private currentConfig: LockdownConfig | null = null;
  private lockdownTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService,
    private readonly configService: ConfigService,
  ) {
    this.configPath = path.join(process.cwd(), 'lockdown-config.json');
  }

  async onModuleInit() {
    await this.loadConfig();
    
    // Если есть активная блокировка, запускаем таймер
    if (this.currentConfig?.isActive) {
      this.startLockdownTimer();
    }
  }

  // Инициация блокировки
  async initiateLockdown(
    reason: string,
    initiatedBy: string,
    options: {
      estimatedDuration?: number;
      affectedServices?: string[];
      allowAdminAccess?: boolean;
      customMessage?: string;
    } = {}
  ): Promise<LockdownConfig> {
    const config: LockdownConfig = {
      isActive: true,
      reason,
      initiatedBy,
      initiatedAt: new Date(),
      estimatedDuration: options.estimatedDuration,
      affectedServices: options.affectedServices || ['all'],
      allowAdminAccess: options.allowAdminAccess ?? true,
      message: options.customMessage || this.generateLockdownMessage(reason),
    };

    // Сохраняем конфигурацию
    await this.saveConfig(config);
    this.currentConfig = config;

    // Логируем событие
    await this.loggingService.error(
      `SYSTEM LOCKDOWN INITIATED: ${reason}`,
      'SECURITY',
      {
        initiatedBy,
        config,
        ipAddress: 'system',
        metadata: {
          severity: 'critical',
          impact: 'total',
        },
      }
    );

    // Запускаем таймер автоматического снятия блокировки
    if (config.estimatedDuration) {
      this.startLockdownTimer();
    }

    // Применяем блокировку к сервисам
    await this.applyLockdown(config);

    return config;
  }

  // Снятие блокировки
  async liftLockdown(initiatedBy: string): Promise<void> {
    if (!this.currentConfig?.isActive) {
      return;
    }

    const config: LockdownConfig = {
      ...this.currentConfig,
      isActive: false,
      initiatedBy,
    };

    await this.saveConfig(config);
    this.currentConfig = null;

    // Очищаем таймер
    if (this.lockdownTimer) {
      clearTimeout(this.lockdownTimer);
      this.lockdownTimer = null;
    }

    // Логируем событие
    await this.loggingService.info(
      'SYSTEM LOCKDOWN LIFTED',
      'SECURITY',
      {
        initiatedBy,
        previousConfig: this.currentConfig,
        ipAddress: 'system',
      }
    );

    // Снимаем блокировку с сервисов
    await this.liftLockdownRestrictions();
  }

  // Проверка статуса блокировки
  isLockdownActive(): boolean {
    return this.currentConfig?.isActive || false;
  }

  // Получение текущей конфигурации
  getCurrentConfig(): LockdownConfig | null {
    return this.currentConfig;
  }

  // Проверка доступа для пользователя
  checkAccess(userId: string, userRoles: string[], ipAddress: string): {
    allowed: boolean;
    reason?: string;
    config?: LockdownConfig;
  } {
    if (!this.currentConfig?.isActive) {
      return { allowed: true };
    }

    const config = this.currentConfig;

    // Проверяем доступ администратора
    if (config.allowAdminAccess && userRoles.includes('ADMIN')) {
      await this.loggingService.warn(
        'Admin access during lockdown',
        'SECURITY',
        {
          userId,
          ipAddress,
          metadata: {
            action: 'admin_access_during_lockdown',
            lockdownReason: config.reason,
          },
        }
      );
      return { allowed: true, config };
    }

    // Проверяем IP адрес в белом списке (если есть)
    if (this.isIpWhitelisted(ipAddress)) {
      return { allowed: true, config };
    }

    // Блокируем доступ
    return {
      allowed: false,
      reason: config.reason,
      config,
    };
  }

  // Middleware для проверки блокировки
  lockdownMiddleware() {
    return async (req: any, res: any, next: any) => {
      if (!this.currentConfig?.isActive) {
        return next();
      }

      const userId = req.user?.id;
      const userRoles = req.user?.roles || [];
      const ipAddress = this.getClientIp(req);

      const access = this.checkAccess(userId, userRoles, ipAddress);

      if (!access.allowed) {
        await this.loggingService.warn(
          'Access denied during lockdown',
          'SECURITY',
          {
            userId,
            ipAddress,
            metadata: {
              path: req.path,
              method: req.method,
              lockdownReason: access.reason,
            },
          }
        );

        return res.status(503).json({
          error: 'Service Unavailable',
          message: this.currentConfig.message,
          lockdown: true,
        });
      }

      next();
    };
  }

  // Приватные методы
  private async loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        this.currentConfig = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load lockdown config:', error);
    }
  }

  private async saveConfig(config: LockdownConfig) {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Failed to save lockdown config:', error);
    }
  }

  private startLockdownTimer() {
    if (!this.currentConfig?.estimatedDuration) {
      return;
    }

    this.lockdownTimer = setTimeout(async () => {
      await this.liftLockdown('system');
    }, this.currentConfig.estimatedDuration);
  }

  private generateLockdownMessage(reason: string): string {
    const messages = {
      'security_breach': 'Система временно недоступна из-за угрозы безопасности. Мы работаем над решением проблемы.',
      'maintenance': 'Система находится на техническом обслуживании. Приносим извинения за неудобства.',
      'ddos_attack': 'Система подвергается DDoS атаке. Доступ временно ограничен.',
      'data_breach': 'Обнаружена утечка данных. Система заблокирована для расследования.',
      'default': 'Система временно недоступна. Пожалуйста, попробуйте позже.',
    };

    return messages[reason as keyof typeof messages] || messages.default;
  }

  private async applyLockdown(config: LockdownConfig) {
    // Блокируем базу данных (только чтение)
    try {
      await this.prisma.$executeRaw`
        ALTER SYSTEM SET default_transaction_read_only = on;
      `;
    } catch (error) {
      console.error('Failed to set DB read-only:', error);
    }

    // Блокируем новые подключения к БД
    try {
      await this.prisma.$executeRaw`
        SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE state = 'active' 
        AND usename NOT IN ('postgres', 'streaming')
        AND query NOT LIKE '%pg_stat_activity%';
      `;
    } catch (error) {
      console.error('Failed to terminate DB connections:', error);
    }

    // Здесь добавляем блокировку других сервисов
  }

  private async liftLockdownRestrictions() {
    // Снимаем блокировку с БД
    try {
      await this.prisma.$executeRaw`
        ALTER SYSTEM SET default_transaction_read_only = off;
      `;
    } catch (error) {
      console.error('Failed to lift DB read-only:', error);
    }
  }

  private isIpWhitelisted(ipAddress: string): boolean {
    // В реальном приложении здесь была бы проверка against whitelist
    const whitelist = process.env.LOCKDOWN_WHITELIST?.split(',') || [];
    return whitelist.includes(ipAddress);
  }

  private getClientIp(req: any): string {
    return (req.headers['x-forwarded-for'] as string) || 
           (req.headers['x-real-ip'] as string) || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           'unknown';
  }
}