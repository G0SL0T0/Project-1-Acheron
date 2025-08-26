import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    // Используем IP + user agent для трекинга
    return req.ip + req.headers['user-agent'];
  }
  
  protected errorMessage = 'Слишком много попыток. Пожалуйста, попробуйте позже.';
}