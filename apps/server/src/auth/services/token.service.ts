import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class TokenService implements OnModuleDestroy {
  private readonly jwtAccessSecret: string;
  private readonly jwtRefreshSecret: string;
  private refreshTokens = new Map<string, { userId: string; expiresAt: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.jwtAccessSecret = this.configService.get('JWT_ACCESS_SECRET');
    this.jwtRefreshSecret = this.configService.get('JWT_REFRESH_SECRET');
    
    // Запускаем очистку просроченных токенов каждые 5 минут
    this.cleanupInterval = setInterval(() => this.cleanupExpiredTokens(), 5 * 60 * 1000);
  }

  // Генерация пары токенов с дополнительной защитой
  async generateTokenPair(userId: string, deviceId?: string) {
    const jti = crypto.randomBytes(16).toString('hex');
    const now = Date.now();
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          jti,
          type: 'access',
          iat: Math.floor(now / 1000),
        },
        {
          secret: this.jwtAccessSecret,
          expiresIn: '15m',
        }
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          jti,
          type: 'refresh',
          iat: Math.floor(now / 1000),
          deviceId,
        },
        {
          secret: this.jwtRefreshSecret,
          expiresIn: '7d',
        }
      ),
    ]);

    // Сохраняем refresh токен в памяти и БД
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000;
    this.refreshTokens.set(refreshToken, { userId, expiresAt });
    
    // Сохраняем в БД для отслеживания
    await this.prisma.refreshToken.create({
      data: {
        token: this.hashToken(refreshToken),
        userId,
        jti,
        deviceId,
        expiresAt: new Date(expiresAt),
      },
    });

    return { accessToken, refreshToken };
  }

  // Верификация токена с дополнительными проверками
  async verifyToken(token: string, type: 'access' | 'refresh' = 'access') {
    try {
      const secret = type === 'access' ? this.jwtAccessSecret : this.jwtRefreshSecret;
      const payload = await this.jwtService.verifyAsync(token, { secret });
      
      // Проверяем тип токена
      if (payload.type !== type) {
        throw new Error('Invalid token type');
      }
      
      // Для refresh токена проверяем в памяти и БД
      if (type === 'refresh') {
        const storedToken = this.refreshTokens.get(token);
        if (!storedToken || storedToken.expiresAt < Date.now()) {
          throw new Error('Refresh token expired or revoked');
        }
        
        // Дополнительная проверка в БД
        const dbToken = await this.prisma.refreshToken.findFirst({
          where: {
            token: this.hashToken(token),
            jti: payload.jti,
            revoked: false,
            expiresAt: { gt: new Date() },
          },
        });
        
        if (!dbToken) {
          throw new Error('Refresh token not found in database');
        }
      }
      
      return payload;
    } catch (error) {
      throw new Error(`Invalid ${type} token: ${error.message}`);
    }
  }

  // Ротация refresh токена с проверкой старого
  async rotateRefreshToken(oldRefreshToken: string, deviceId?: string) {
    const oldPayload = await this.verifyToken(oldRefreshToken, 'refresh');
    
    // Отзываем старый токен
    await this.revokeToken(oldRefreshToken);
    
    // Генерируем новую пару
    return this.generateTokenPair(oldPayload.sub, deviceId);
  }

  // Отзыв токена
  async revokeToken(token: string) {
    // Удаляем из памяти
    this.refreshTokens.delete(token);
    
    // Помечаем как отозванный в БД
    const hashedToken = this.hashToken(token);
    await this.prisma.refreshToken.updateMany({
      where: { token: hashedToken },
      data: { revoked: true },
    });
  }

  // Отзыв всех токенов пользователя
  async revokeAllUserTokens(userId: string) {
    // Находим все активные токены пользователя
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId, revoked: false },
    });
    
    // Удаляем из памяти
    tokens.forEach(token => {
      this.refreshTokens.delete(token.token);
    });
    
    // Отзываем в БД
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  // Очистка просроченных токенов
  private cleanupExpiredTokens() {
    const now = Date.now();
    for (const [token, data] of this.refreshTokens.entries()) {
      if (data.expiresAt < now) {
        this.refreshTokens.delete(token);
      }
    }
  }

  // Хеширование токена
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
  }
}