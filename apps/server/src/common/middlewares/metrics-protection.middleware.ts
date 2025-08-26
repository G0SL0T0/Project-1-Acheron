import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class MetricsProtectionMiddleware implements NestMiddleware {
  private readonly allowedIPs: string[];
  private readonly apiKey: string;

  constructor() {
    // Белый список IP для доступа к метрикам
    this.allowedIPs = process.env.METRICS_ALLOWED_IPS?.split(',') || ['127.0.0.1'];
    this.apiKey = process.env.METRICS_API_KEY || crypto.randomBytes(32).toString('hex');
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Защита эндпоинта /metrics
    if (req.path.startsWith('/metrics')) {
      // Проверка IP
      const clientIP = req.ip || req.connection.remoteAddress;
      if (!this.allowedIPs.includes(clientIP)) {
        return res.status(403).json({ error: 'IP not allowed' });
      }

      // Проверка API ключа
      const providedKey = req.headers['x-metrics-api-key'];
      if (providedKey !== this.apiKey) {
        return res.status(403).json({ error: 'Invalid API key' });
      }

      // Проверка User-Agent
      const userAgent = req.headers['user-agent'];
      if (!userAgent || userAgent.includes('curl')) {
        return res.status(403).json({ error: 'Invalid user agent' });
      }
    }

    // Защита Grafana (если используется)
    if (req.path.startsWith('/grafana')) {
      // Дополнительные проверки для Grafana
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.substring(7);
      if (token !== this.apiKey) {
        return res.status(403).json({ error: 'Invalid token' });
      }
    }

    next();
  }
}