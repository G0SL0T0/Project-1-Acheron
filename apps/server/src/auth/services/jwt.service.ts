import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // Генерация access токена (короткий срок жизни)
  generateAccessToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    );
  }

  // Генерация refresh токена (длинный срок жизни)
  async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    // Сохраняем хеш refresh токена в БД
    const hashedToken = this.hashToken(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });

    return refreshToken;
  }

  // Верификация токена
  verifyToken(token: string, isRefresh = false): any {
    try {
      const secret = isRefresh
        ? this.configService.get('JWT_REFRESH_SECRET')
        : this.configService.get('JWT_ACCESS_SECRET');
      
      return this.jwtService.verify(token, { secret });
    } catch (error) {
      throw new Error('Неверный токен');
    }
  }

  // Хеширование токена для безопасного хранения
  private hashToken(token: string): string {
    return require('crypto').createHash('sha256').update(token).digest('hex');
  }
}