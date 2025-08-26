import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SignedSqlService {
  private readonly signingKey: string;

  constructor(private readonly prisma: PrismaService) {
    this.signingKey = process.env.SQL_SIGNING_KEY || crypto.randomBytes(32).toString('hex');
  }

  // Подпись SQL запроса
  signQuery(query: string, params: any[]): string {
    const queryData = {
      query: query.trim(),
      params: this.normalizeParams(params),
      timestamp: Date.now(),
    };

    const signature = crypto
      .createHmac('sha256', this.signingKey)
      .update(JSON.stringify(queryData))
      .digest('hex');

    return JSON.stringify({
      ...queryData,
      signature,
    });
  }

  // Валидация подписи запроса
  validateQuery(signedQuery: string): { valid: boolean; query?: string; params?: any[] } {
    try {
      const parsed = JSON.parse(signedQuery);
      
      // Проверяем подпись
      const { signature, ...queryData } = parsed;
      const expectedSignature = crypto
        .createHmac('sha256', this.signingKey)
        .update(JSON.stringify(queryData))
        .digest('hex');

      if (signature !== expectedSignature) {
        return { valid: false };
      }

      // Проверяем время жизни подписи (максимум 5 минут)
      if (Date.now() - queryData.timestamp > 5 * 60 * 1000) {
        return { valid: false };
      }

      return {
        valid: true,
        query: queryData.query,
        params: queryData.params,
      };
    } catch (error) {
      return { valid: false };
    }
  }

  // Выполнение подписанного запроса
  async executeSignedQuery(signedQuery: string) {
    const validation = this.validateQuery(signedQuery);
    
    if (!validation.valid) {
      throw new Error('Invalid or expired SQL signature');
    }

    // Используем только prepared statements
    return this.prisma.$queryRawUnsafe(
      validation.query,
      ...(validation.params || [])
    );
  }

  // Нормализация параметров
  private normalizeParams(params: any[]): any[] {
    return params.map(param => {
      if (param === null || param === undefined) {
        return null;
      }
      if (typeof param === 'object') {
        return JSON.stringify(param);
      }
      return param;
    });
  }

  // Генерация безопасных prepared statements
  generatePreparedStatement(table: string, operation: 'select' | 'insert' | 'update' | 'delete', fields: string[], conditions?: string[]): string {
    const allowedOperations = ['select', 'insert', 'update', 'delete'];
    const allowedTables = ['users', 'profiles', 'streams', 'chat_messages'];
    
    if (!allowedOperations.includes(operation)) {
      throw new Error(`Operation ${operation} not allowed`);
    }

    if (!allowedTables.includes(table)) {
      throw new Error(`Table ${table} not allowed`);
    }

    switch (operation) {
      case 'select':
        const whereClause = conditions && conditions.length > 0 
          ? `WHERE ${conditions.map(c => `${c} = ?`).join(' AND ')}` 
          : '';
        return `SELECT ${fields.join(', ')} FROM ${table} ${whereClause}`;
      
      case 'insert':
        return `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;
      
      case 'update':
        return `UPDATE ${table} SET ${fields.map(f => `${f} = ?`).join(', ')} ${conditions && conditions.length > 0 ? `WHERE ${conditions.map(c => `${c} = ?`).join(' AND ')}` : ''}`;
      
      case 'delete':
        if (!conditions || conditions.length === 0) {
          throw new Error('DELETE operation requires conditions');
        }
        return `DELETE FROM ${table} WHERE ${conditions.map(c => `${c} = ?`).join(' AND ')}`;
      
      default:
        throw new Error('Unsupported operation');
    }
  }
}