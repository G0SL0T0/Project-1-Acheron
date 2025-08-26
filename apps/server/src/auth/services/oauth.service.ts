import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OAuthService {
  constructor(private readonly configService: ConfigService) {}

  // Генерация state параметра для защиты от CSRF
  generateState(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  // Валидация redirect URI
  validateRedirectUri(provider: string, redirectUri: string): boolean {
    const allowedUris = {
      google: this.configService.get('GOOGLE_CALLBACK_URL'),
      yandex: this.configService.get('YANDEX_CALLBACK_URL'),
    };

    return allowedUris[provider] === redirectUri;
  }

  // Проверка state параметра
  validateState(state: string, storedState: string): boolean {
    return state === storedState;
  }
}