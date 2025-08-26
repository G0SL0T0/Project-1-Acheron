import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { LoggingService } from '../services/logging.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { LogEntry } from '../services/logging.service';

@Controller('api/logs')
@UseGuards(AdminGuard) // Только для администраторов
export class LogsController {
  constructor(private readonly loggingService: LoggingService) {}

  @Get()
  async getLogs(
    @Query('level') level?: string,
    @Query('module') module?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit = 100,
    @Query('offset') offset = 0,
  ) {
    const filters: any = {};
    if (level) filters.level = level;
    if (module) filters.module = module;
    if (userId) filters.userId = userId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.loggingService.getLogs({ ...filters, limit, offset });
  }

  @Get('stats')
  async getStats() {
    return this.loggingService.getLogStats();
  }

  @Post('search')
  async searchLogs(@Body() data: { query: string; filters?: any }) {
    // Реализация полнотекстового поиска по логам
    // В реальном приложении здесь был бы запрос к PostgreSQL с полнотекстовым поиском
    const { query, filters = {} } = data;
    const allLogs = await this.loggingService.getLogs({ ...filters, limit: 1000 });
    
    const searchResults = allLogs.logs.filter(log => 
      log.message.toLowerCase().includes(query.toLowerCase()) ||
      (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(query.toLowerCase()))
    );

    return {
      logs: searchResults,
      total: searchResults.length,
    };
  }

  @Post('export')
  async exportLogs(@Body() data: { format: 'csv' | 'json'; filters?: any }) {
    const { format, filters = {} } = data;
    const { logs } = await this.loggingService.getLogs({ ...filters, limit: 10000 });

    switch (format) {
      case 'csv':
        return this.exportToCsv(logs);
      case 'json':
        return { logs, exportedAt: new Date() };
      default:
        throw new Error('Unsupported export format');
    }
  }

  private exportToCsv(logs: LogEntry[]) {
    const headers = [
      'Timestamp', 'Level', 'Message', 'Module', 'Action', 'User ID',
      'IP Address', 'Method', 'Path', 'Status Code', 'Response Time'
    ];

    const rows = logs.map(log => [
      log.timestamp.toISOString(),
      log.level,
      `"${log.message.replace(/"/g, '""')}"`,
      log.module,
      log.action || '',
      log.userId || '',
      log.ipAddress || '',
      log.method || '',
      log.path || '',
      log.statusCode?.toString() || '',
      log.responseTime?.toString() || '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return {
      filename: `logs_${new Date().toISOString().split('T')[0]}.csv`,
      content: csvContent,
      mimeType: 'text/csv',
    };
  }
}