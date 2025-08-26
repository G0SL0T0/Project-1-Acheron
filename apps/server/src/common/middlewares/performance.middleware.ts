import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PerformanceModeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Проверяем cookie с режимом производительности
    const performanceMode = req.cookies?.performanceMode;
    
    // Добавляем режим в контекст запроса
    req['performanceMode'] = performanceMode || 'optimized';
    
    // Для API ответов можно добавлять заголовки
    res.setHeader('X-Performance-Mode', req['performanceMode']);
    
    next();
  }
}