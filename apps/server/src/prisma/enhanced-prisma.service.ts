import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class EnhancedPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private connectionPool = {
    total: 0,
    active: 0,
    idle: 0,
  };

  async onModuleInit() {
    await this.$connect({
      // Безопасные настройки пула
      connectionLimit: 10,
      pool: {
        min: 2,
        max: 10,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 10000,
      },
    });

    // Мониторинг пула соединений
    this.$on('query', (e) => {
      this.connectionPool.active++;
      this.connectionPool.idle--;
    });

    this.$on('queryError', (e) => {
      console.error('Prisma Query Error:', e);
    });

    console.log('✅ Enhanced Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Безопасное выполнение запросов с дополнительными проверками
  async safeQuery<T>(query: string, params?: any[]): Promise<T> {
    // Проверка на SQL инъекции
    const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER|CREATE|TRUNCATE)\b)/i;
    if (sqlInjectionPattern.test(query)) {
      throw new Error('Potential SQL injection detected');
    }

    // Логирование медленных запросов
    const start = Date.now();
    try {
      const result = await this.$queryRawUnsafe(query, ...(params || []));
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        console.warn('Slow query detected:', { query, duration, params });
      }
      
      return result as T;
    } catch (error) {
      console.error('Query failed:', { query, params, error });
      throw error;
    }
  }

  // Получение статистики пула
  getPoolStats() {
    return { ...this.connectionPool };
  }
}