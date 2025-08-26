import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LoggingService, LogEntry } from '../services/logging.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})
export class LogsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly loggingService: LoggingService) {
    // Подписываемся на новые логи
    this.loggingService.subscribe((log) => {
      this.server.emit('new_log', log);
    });
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    
    // Отправляем последние 100 логов при подключении
    this.sendRecentLogs(client);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe_logs')
  @UseGuards(WsJwtGuard)
  handleSubscribe(client: Socket, data: { filters?: any }) {
    console.log(`Client ${client.id} subscribed to logs with filters:`, data.filters);
    
    // Подписываем клиента на отфильтрованные логи
    client.join('logs_subscribers');
    
    // Отправляем подтверждение
    client.emit('subscribed', { success: true });
  }

  @SubscribeMessage('get_logs')
  @UseGuards(WsJwtGuard)
  async handleGetLogs(client: Socket, data: { filters?: any; limit?: number; offset?: number }) {
    try {
      const { logs, total } = await this.loggingService.getLogs({
        ...data.filters,
        limit: data.limit || 100,
        offset: data.offset || 0,
      });
      
      client.emit('logs_response', { logs, total });
    } catch (error) {
      client.emit('error', { message: 'Failed to fetch logs' });
    }
  }

  @SubscribeMessage('get_log_stats')
  @UseGuards(WsJwtGuard)
  async handleGetLogStats(client: Socket) {
    try {
      const stats = await this.loggingService.getLogStats();
      client.emit('log_stats', stats);
    } catch (error) {
      client.emit('error', { message: 'Failed to fetch log stats' });
    }
  }

  private async sendRecentLogs(client: Socket) {
    try {
      const { logs } = await this.loggingService.getLogs({ limit: 100 });
      client.emit('recent_logs', logs);
    } catch (error) {
      console.error('Failed to send recent logs:', error);
    }
  }
}