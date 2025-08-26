import { Controller, Get, Res, Req } from '@nestjs/common';
import { Response } from 'express';
import { MonitoringService } from '../services/monitoring.service';
import { MetricsProtectionMiddleware } from '../middlewares/metrics-protection.middleware';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get()
  getMetrics(@Res() res: Response, @Req() req) {
    // Дополнительная проверка (хотя middleware уже защищает)
    const apiKey = req.headers['x-metrics-api-key'];
    if (apiKey !== process.env.METRICS_API_KEY) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.set('Content-Type', 'text/plain');
    res.send(this.monitoringService.getMetrics());
  }
}