import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LockdownService } from '../services/lockdown.service';
import { LoggingService } from '../services/logging.service';

@Injectable()
export class LockdownMiddleware implements NestMiddleware {
  constructor(
    private readonly lockdownService: LockdownService,
    private readonly loggingService: LoggingService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Проверяем, активна ли блокировка
    if (!this.lockdownService.isLockdownActive()) {
      return next();
    }

    const userId = (req as any).user?.id;
    const userRoles = (req as any).user?.roles || [];
    const ipAddress = this.getClientIp(req);

    // Проверяем доступ
    const access = this.lockdownService.checkAccess(userId, userRoles, ipAddress);

    if (!access.allowed) {
      // Логируем попытку доступа во время блокировки
      await this.loggingService.warn(
        'Access attempt during lockdown',
        'SECURITY',
        {
          userId,
          ipAddress,
          metadata: {
            path: req.path,
            method: req.method,
            userAgent: req.headers['user-agent'],
            lockdownReason: access.reason,
          },
        }
      );

      // Возвращаем ответ о недоступности сервиса
      return res.status(503).json({
        error: 'Service Unavailable',
        message: access.config?.message || 'System is currently under lockdown',
        lockdown: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Для администраторов логируем доступ
    if (access.allowed && access.config) {
      await this.loggingService.info(
        'Admin access during lockdown',
        'SECURITY',
        {
          userId,
          ipAddress,
          metadata: {
            path: req.path,
            method: req.method,
            lockdownReason: access.config.reason,
          },
        }
      );
    }

    next();
  }

  private getClientIp(req: Request): string {
    return (req.headers['x-forwarded-for'] as string) || 
           (req.headers['x-real-ip'] as string) || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           'unknown';
  }
}