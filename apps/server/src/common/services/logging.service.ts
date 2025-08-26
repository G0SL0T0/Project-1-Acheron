import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  module: string;
  action?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  responseTime?: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class LoggingService implements OnModuleInit {
  private readonly logs: LogEntry[] = [];
  private readonly maxLogsInMemory = 1000;
  private subscribers: Set<(log: LogEntry) => void> = new Set();

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // Создаем таблицу для логов если ее нет
    await this.createLogsTable();
    
    // Запускаем периодическую очистку старых логов
    setInterval(() => this.cleanupOldLogs(), 24 * 60 * 60 * 1000); // Раз в день
  }

  private async createLogsTable() {
    await this.prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS system_logs (
        id VARCHAR(36) PRIMARY KEY,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        level VARCHAR(10) NOT NULL,
        message TEXT NOT NULL,
        module VARCHAR(50) NOT NULL,
        action VARCHAR(50),
        user_id VARCHAR(36),
        ip_address INET,
        user_agent TEXT,
        method VARCHAR(10),
        path TEXT,
        status_code INTEGER,
        response_time INTEGER,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
      CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_system_logs_module ON system_logs(module);
    `;
  }

  // Основной метод логирования
  async log(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<LogEntry> {
    const logEntry: LogEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    };

    // Добавляем в память
    this.addToMemory(logEntry);

    // Сохраняем в базу данных
    await this.saveToDatabase(logEntry);

    // Уведомляем подписчиков
    this.notifySubscribers(logEntry);

    return logEntry;
  }

  // Удобные методы для разных уровней
  async info(message: string, module: string, data: Partial<Omit<LogEntry, 'id' | 'timestamp' | 'level' | 'message' | 'module'>> = {}) {
    return this.log({ level: 'info', message, module, ...data });
  }

  async warn(message: string, module: string, data: Partial<Omit<LogEntry, 'id' | 'timestamp' | 'level' | 'message' | 'module'>> = {}) {
    return this.log({ level: 'warn', message, module, ...data });
  }

  async error(message: string, module: string, data: Partial<Omit<LogEntry, 'id' | 'timestamp' | 'level' | 'message' | 'module'>> = {}) {
    return this.log({ level: 'error', message, module, ...data });
  }

  async debug(message: string, module: string, data: Partial<Omit<LogEntry, 'id' | 'timestamp' | 'level' | 'message' | 'module'>> = {}) {
    return this.log({ level: 'debug', message, module, ...data });
  }

  // Логирование HTTP запросов
  async logHttpRequest(request: Request, responseTime: number, statusCode: number, userId?: string) {
    return this.info('HTTP Request', 'HTTP', {
      action: `${request.method} ${request.path}`,
      userId,
      ipAddress: this.getClientIp(request),
      userAgent: request.headers['user-agent'],
      method: request.method,
      path: request.path,
      statusCode,
      responseTime,
      metadata: {
        query: request.query,
        body: this.sanitizeBody(request.body),
      },
    });
  }

  // Логирование операций с базой данных
  async logDatabaseOperation(operation: string, table: string, duration: number, userId?: string, success = true) {
    const level = success ? 'debug' : 'error';
    const message = success ? `DB Operation: ${operation} on ${table}` : `DB Operation Failed: ${operation} on ${table}`;
    
    return this.log({
      level,
      message,
      module: 'DATABASE',
      action: operation,
      userId,
      metadata: { table, duration, success },
    });
  }

  // Логирование событий безопасности
  async logSecurityEvent(event: string, request: Request, userId?: string, metadata?: Record<string, any>) {
    return this.warn(`Security Event: ${event}`, 'SECURITY', {
      userId,
      ipAddress: this.getClientIp(request),
      userAgent: request.headers['user-agent'],
      metadata,
    });
  }

  // Получение логов с фильтрацией
  async getLogs(filters: {
    level?: string;
    module?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}) {
    const { level, module, userId, startDate, endDate, limit = 100, offset = 0 } = filters;

    const whereClause: any = {};
    if (level) whereClause.level = level;
    if (module) whereClause.module = module;
    if (userId) whereClause.user_id = userId;
    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp.gte = startDate;
      if (endDate) whereClause.timestamp.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.$queryRaw`
        SELECT * FROM system_logs
        WHERE ${Object.keys(whereClause).length > 0 ? this.buildWhereClause(whereClause) : '1=1'}
        ORDER BY timestamp DESC
        LIMIT ${limit} OFFSET ${offset}
      ` as any[],
      this.prisma.$queryRaw`
        SELECT COUNT(*) as total FROM system_logs
        WHERE ${Object.keys(whereClause).length > 0 ? this.buildWhereClause(whereClause) : '1=1'}
      ` as any[],
    ]);

    return {
      logs: logs.map(this.mapDbLogToEntry),
      total: total[0].total,
    };
  }

  // Получение статистики по логам
  async getLogStats() {
    const stats = await this.prisma.$queryRaw`
      SELECT 
        level,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(CASE WHEN timestamp > NOW() - INTERVAL '1 hour' THEN 1 END) as recent_count
      FROM system_logs
      WHERE timestamp > NOW() - INTERVAL '24 hours'
      GROUP BY level
    ` as any[];

    return stats;
  }

  // Подписка на реальное время
  subscribe(callback: (log: LogEntry) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Приватные методы
  private addToMemory(logEntry: LogEntry) {
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs.shift();
    }
  }

  private async saveToDatabase(logEntry: LogEntry) {
    try {
      await this.prisma.$queryRaw`
        INSERT INTO system_logs (
          id, timestamp, level, message, module, action, user_id, 
          ip_address, user_agent, method, path, status_code, response_time, metadata
        ) VALUES (
          ${logEntry.id},
          ${logEntry.timestamp.toISOString()},
          ${logEntry.level},
          ${logEntry.message},
          ${logEntry.module},
          ${logEntry.action || null},
          ${logEntry.userId || null},
          ${logEntry.ipAddress || null},
          ${logEntry.userAgent || null},
          ${logEntry.method || null},
          ${logEntry.path || null},
          ${logEntry.statusCode || null},
          ${logEntry.responseTime || null},
          ${JSON.stringify(logEntry.metadata || {})}::jsonb
        )
      `;
    } catch (error) {
      console.error('Failed to save log to database:', error);
    }
  }

  private notifySubscribers(logEntry: LogEntry) {
    this.subscribers.forEach(callback => {
      try {
        callback(logEntry);
      } catch (error) {
        console.error('Error in log subscriber:', error);
      }
    });
  }

  private async cleanupOldLogs() {
    try {
      await this.prisma.$queryRaw`
        DELETE FROM system_logs 
        WHERE timestamp < NOW() - INTERVAL '30 days'
      `;
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIp(request: Request): string {
    return (request.headers['x-forwarded-for'] as string) || 
           (request.headers['x-real-ip'] as string) || 
           request.connection.remoteAddress || 
           request.socket.remoteAddress || 
           'unknown';
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;
    
    const sanitized: any = {};
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'credit_card'];
    
    for (const [key, value] of Object.entries(body)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  private buildWhereClause(conditions: any): string {
    const clauses = [];
    
    for (const [key, value] of Object.entries(conditions)) {
      if (typeof value === 'object' && value.gte) {
        clauses.push(`${key} >= '${value.gte.toISOString()}'`);
      } else if (typeof value === 'object' && value.lte) {
        clauses.push(`${key} <= '${value.lte.toISOString()}'`);
      } else {
        clauses.push(`${key} = '${value}'`);
      }
    }
    
    return clauses.join(' AND ');
  }

  private mapDbLogToEntry(dbLog: any): LogEntry {
    return {
      id: dbLog.id,
      timestamp: new Date(dbLog.timestamp),
      level: dbLog.level,
      message: dbLog.message,
      module: dbLog.module,
      action: dbLog.action,
      userId: dbLog.user_id,
      ipAddress: dbLog.ip_address,
      userAgent: dbLog.user_agent,
      method: dbLog.method,
      path: dbLog.path,
      statusCode: dbLog.status_code,
      responseTime: dbLog.response_time,
      metadata: dbLog.metadata,
    };
  }
}