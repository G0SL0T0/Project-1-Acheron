import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class SqlFirewallService implements OnModuleInit {
  private readonly blockedPatterns = new Set([
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER|CREATE|TRUNCATE)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(['"]).*?(\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b).*?\1/i,
    /\/\*.*?\*\//,
    /;\s*$/,
    /--.*$/,
    /xp_/i,
    /sp_/i,
    /sys./i,
    /information_schema/i,
    /pg_catalog/i,
  ]);

  private readonly allowedTables = new Set([
    'users',
    'profiles',
    'streams',
    'chat_messages',
    'donations',
    'transactions',
    'items',
    'user_items',
    'themes',
    'oauth_accounts',
    'security_audits',
    'refresh_tokens',
  ]);

  private readonly allowedColumns = new Map([
    ['users', ['id', 'email', 'username', 'avatar', 'bio', 'created_at', 'updated_at']],
    ['profiles', ['id', 'user_id', 'language', 'timezone', 'show_socials']],
    // ... другие таблицы
  ]);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // Создаем триггеры для SQL Firewall
    await this.createFirewallTriggers();
  }

  private async createFirewallTriggers() {
    // Триггер для перехвата запросов
    await this.prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION sql_firewall()
      RETURNS event_trigger AS $$
      DECLARE
        query TEXT;
        query_hash TEXT;
      BEGIN
        -- Получаем SQL запрос
        SELECT query INTO query
        FROM pg_stat_activity
        WHERE pid = pg_backend_pid();

        -- Вычисляем хеш запроса
        query_hash = digest(query, 'sha256');

        -- Проверяем на заблокированные паттерны
        IF EXISTS (
          SELECT 1 FROM blocked_queries 
          WHERE query_hash = sql_firewall.query_hash
        ) THEN
          RAISE EXCEPTION 'SQL Firewall: Query blocked by pattern';
        END IF;

        -- Логируем запрос для анализа
        INSERT INTO sql_firewall_logs (query, query_hash, user_id, timestamp)
        VALUES (query, query_hash, current_user, NOW());
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    // Создаем таблицу для логов
    await this.prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS sql_firewall_logs (
        id SERIAL PRIMARY KEY,
        query TEXT NOT NULL,
        query_hash VARCHAR(64) NOT NULL,
        user_id VARCHAR(255),
        timestamp TIMESTAMP DEFAULT NOW(),
        blocked BOOLEAN DEFAULT FALSE
      );
    `;

    // Создаем индекс
    await this.prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_sql_firewall_hash ON sql_firewall_logs(query_hash);
    `;
  }

  // Проверка SQL запроса
  validateQuery(query: string, userId: string): { valid: boolean; reason?: string } {
    // Проверка на заблокированные паттерны
    for (const pattern of this.blockedPatterns) {
      if (pattern.test(query)) {
        return { valid: false, reason: 'Blocked pattern detected' };
      }
    }

    // Проверка на разрешенные таблицы и колонки
    const tableMatch = query.match(/FROM\s+(\w+)/i);
    if (tableMatch) {
      const table = tableMatch[1].toLowerCase();
      if (!this.allowedTables.has(table)) {
        return { valid: false, reason: 'Table not allowed' };
      }

      // Проверка колонок
      const columnMatch = query.match(/SELECT\s+(.+?)\s+FROM/i);
      if (columnMatch) {
        const columns = columnMatch[1].split(',').map(c => c.trim().toLowerCase());
        const allowedColumns = this.allowedColumns.get(table) || [];
        
        for (const column of columns) {
          if (!allowedColumns.includes(column)) {
            return { valid: false, reason: `Column ${column} not allowed in table ${table}` };
          }
        }
      }
    }

    // Проверка на подозрительные операции
    if (query.toLowerCase().includes('delete') || query.toLowerCase().includes('drop')) {
      return { valid: false, reason: 'Dangerous operation detected' };
    }

    return { valid: true };
  }

  // Блокировка запроса
  async blockQuery(query: string, userId: string, reason: string) {
    const queryHash = crypto.createHash('sha256').update(query).digest('hex');
    
    await this.prisma.$executeRaw`
      INSERT INTO sql_firewall_logs (query, query_hash, user_id, timestamp, blocked)
      VALUES (${query}, ${queryHash}, ${userId}, NOW(), true)
    `;

    // Логируем попытку атаки
    console.warn(`SQL Firewall: Query blocked - ${reason}`, {
      query: query.substring(0, 100),
      userId,
      queryHash,
    });
  }

  // Получение статистики
  async getStats() {
    const result = await this.prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_queries,
        COUNT(CASE WHEN blocked = true THEN 1 END) as blocked_queries,
        COUNT(CASE WHEN blocked = false THEN 1 END) as allowed_queries
      FROM sql_firewall_logs
      WHERE timestamp > NOW() - INTERVAL '24 hours'
    ` as any[];

    return result[0];
  }
}