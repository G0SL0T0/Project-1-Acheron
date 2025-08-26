import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AdvancedWafMiddleware implements NestMiddleware {
  // Расширенные паттерны для обнаружения атак
  private readonly patterns = {
    // SQL инъекции с обходом
    sql: [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER|CREATE|TRUNCATE)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(['"]).*?(\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b).*?\1/i,
      /\/\*.*?\*\//, // SQL комментарии
      /;\s*$/, // Завершение запроса
    ],
    
    // XSS с обходом
    xss: [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<\?php/gi,
      /<%[\s\S]*%>/gi,
      /data:\s*text\/html/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
    ],
    
    // NoSQL инъекции
    nosql: [
      /\$where/i,
      /\$ne/i,
      /\$gt/i,
      /\$lt/i,
      /\$regex/i,
      /\$exists/i,
    ],
    
    // Path Traversal
    pathTraversal: [
      /\.\.\//g,
      /\.\.\\/g,
      /~\//g,
    ],
    
    // Command Injection
    commandInjection: [
      /;\s*\w+\s+/i,
      /\|\s*\w+\s+/i,
      /&\s*\w+\s+/i,
      /\$\(/g,
      /`.*?`/g,
    ],
    
    // SSRF
    ssrf: [
      /http:\/\/127\.0\.0\.1/i,
      /http:\/\/localhost/i,
      /http:\/\/192\.168\./i,
      /http:\/\/10\./i,
      /file:\/\//i,
      /gopher:\/\//i,
    ],
  };

  use(req: Request, res: Response, next: NextFunction) {
    // Проверяем разные части запроса
    const checkTargets = [
      req.url,
      JSON.stringify(req.query),
      JSON.stringify(req.body),
      req.headers['user-agent'],
      req.headers['referer'],
    ];

    for (const target of checkTargets) {
      if (!target) continue;

      for (const [attackType, patterns] of Object.entries(this.patterns)) {
        for (const pattern of patterns) {
          if (pattern.test(target)) {
            this.logAttack(req, attackType, target);
            return res.status(403).json({ 
              error: 'Malicious request detected',
              type: attackType 
            });
          }
        }
      }
    }

    next();
  }

  private logAttack(req: Request, attackType: string, payload: string) {
    console.warn(`WAF Alert: ${attackType} attack detected`, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      method: req.method,
      payload: payload.substring(0, 200),
    });
  }
}