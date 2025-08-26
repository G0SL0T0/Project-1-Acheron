import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Response } from 'express';

@Injectable()
export class AdvancedJwtService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Генерация пары короткоживущих токенов
  async generateTokenPair(userId: string, response: Response) {
    const jti = crypto.randomBytes(16).toString('hex');
    const now = Date.now();
    
    // Access token - очень короткий (5 минут)
    const accessToken = this.jwtService.sign(
      {
        sub: userId,
        jti,
        type: 'access',
        iat: Math.floor(now / 1000),
      },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '5m',
      }
    );

    // Refresh token - короткий (1 час)
    const refreshToken = this.jwtService.sign(
      {
        sub: userId,
        jti,
        type: 'refresh',
        iat: Math.floor(now / 1000),
      },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '1h',
      }
    );

    // Устанавливаем cookies с дополнительной защитой
    this.setSecureCookies(response, accessToken, refreshToken);

    return { accessToken, refreshToken };
  }

  // Установка защищенных cookies
  private setSecureCookies(response: Response, accessToken: string, refreshToken: string) {
    // Access token cookie (HttpOnly, Secure, SameSite=Strict)
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 5 * 60 * 1000, // 5 минут
      path: '/',
    });

    // Refresh token cookie (HttpOnly, Secure, SameSite=Strict)
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 час
      path: '/auth/refresh',
    });

    // CSRF токен для дополнительной защиты
    const csrfToken = crypto.randomBytes(32).toString('hex');
    response.cookie('csrf_token', csrfToken, {
      secure: true,
      sameSite: 'strict',
      maxAge: 5 * 60 * 1000,
      path: '/',
    });
  }

  // Очистка cookies
  clearCookies(response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    response.clearCookie('csrf_token');
  }

  // Валидация access token из cookie
  validateAccessTokenFromCookie(request: any) {
    const accessToken = request.cookies?.access_token;
    if (!accessToken) {
      throw new Error('Access token not found');
    }

    try {
      return this.jwtService.verify(accessToken, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  // Валидация refresh token из cookie
  validateRefreshTokenFromCookie(request: any) {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    try {
      return this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}