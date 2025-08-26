import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MonitoringService {
  private readonly metrics = {
    httpRequestsTotal: new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    }),

    httpRequestDuration: new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    databaseConnections: new promClient.Gauge({
      name: 'database_connections_active',
      help: 'Number of active database connections',
    }),

    authFailures: new promClient.Counter({
      name: 'auth_failures_total',
      help: 'Total number of authentication failures',
      labelNames: ['type'],
    }),

    wafBlocks: new promClient.Counter({
      name: 'waf_blocks_total',
      help: 'Total number of WAF blocks',
      labelNames: ['attack_type'],
    }),
  };

  // Учет HTTP запросов
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.metrics.httpRequestsTotal.inc({ method, route, status_code: statusCode });
    this.metrics.httpRequestDuration.observe({ method, route }, duration / 1000);
  }

  // Обновление метрик БД
  updateDatabaseMetrics(activeConnections: number) {
    this.metrics.databaseConnections.set(activeConnections);
  }

  // Учет неудачных аутентификаций
  recordAuthFailure(type: string) {
    this.metrics.authFailures.inc({ type });
  }

  // Учет блокировок WAF
  recordWafBlock(attackType: string) {
    this.metrics.wafBlocks.inc({ attack_type: attackType });
  }

  // Получение метрик в формате Prometheus
  getMetrics(): string {
    return promClient.register.metrics();
  }
}