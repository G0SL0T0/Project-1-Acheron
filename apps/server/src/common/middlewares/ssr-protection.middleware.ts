import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SsrProtectionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Защита от утечек данных в SSR
    const originalSend = res.send;
    res.send = function(data) {
      if (typeof data === 'string') {
        // Обнаружение утечек чувствительных данных
        const sensitivePatterns = [
          /"password":\s*"[^"]+"/gi,
          /"token":\s*"[^"]+"/gi,
          /"secret":\s*"[^"]+"/gi,
          /"apiKey":\s*"[^"]+"/gi,
          /"privateKey":\s*"[^"]+"/gi,
        ];

        for (const pattern of sensitivePatterns) {
          if (pattern.test(data)) {
            console.error('SSR Data Leak Detected:', {
              path: req.path,
              pattern: pattern.toString(),
            });
            
            // Заменяем утечки на [REDACTED]
            data = data.replace(pattern, '"$1": "[REDACTED]"');
          }
        }
      }
      
      return originalSend.call(this, data);
    };

    next();
  }
}