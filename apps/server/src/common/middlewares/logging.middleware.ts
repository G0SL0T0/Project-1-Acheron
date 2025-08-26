import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from '../services/logging.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggingService: LoggingService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const originalSend = res.send;

    // Переопределяем метод send для перехвата ответа
    res.send = function(data) {
      const responseTime = Date.now() - startTime;
      
      // Логируем запрос
      const userId = (req as any).user?.id;
      loggingService.logHttpRequest(req, responseTime, res.statusCode, userId);

      return originalSend.call(this, data);
    };

    next();
  }
}