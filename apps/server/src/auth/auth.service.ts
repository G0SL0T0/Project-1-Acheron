// apps/server/src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        nickname: dto.nickname,
      },
    });
    return { access_token: this.jwt.sign({ sub: user.id, email: user.email }) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password!))) {
      throw new UnauthorizedException();
    }
    return { access_token: this.jwt.sign({ sub: user.id, email: user.email }) };
  }
}
/*
import { Injectable, UnauthorizedException, Logger, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EncryptionService } from '../security/encryption.service';
import { SecurityService } from '../security/security.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private encryptionService: EncryptionService,
    private securityService: SecurityService,
  ) {}

  // Обновляем метод регистрации
  async register(registerDto: RegisterDto) {
    try {
      // Проверяем существование пользователя
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: registerDto.email },
            { nickname: registerDto.nickname }
          ]
        }
      });

      if (existingUser) {
        throw new ConflictException('User with this email or nickname already exists');
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      
      // Шифрование email
      const encryptedEmail = this.encryptionService.encrypt(registerDto.email);
      
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          encryptedEmail,
          password: hashedPassword,
          nickname: registerDto.nickname,
        },
      });
      
      // Создаем профиль, кошелек и настройки
      await this.prisma.profile.create({
        data: { userId: user.id },
      });
      
      await this.prisma.wallet.create({
        data: { userId: user.id },
      });
      
      await this.prisma.userSettings.create({
        data: { userId: user.id },
      });

      const payload = { sub: user.id, email: user.email, role: user.role };
      
      // Логируем событие регистрации
      await this.securityService.logSecurityEvent('registration_success', user.id, {
        email: user.email,
        nickname: user.nickname,
      });
      
      return {
        access_token: this.jwtService.sign(payload),
        refresh_token: this.jwtService.sign(payload, {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        }),
      };
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`);
      throw error;
    }
  }

  // Обновляем метод входа
  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      
      // Проверяем блокировку аккаунта
      if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
        throw new UnauthorizedException('Account is temporarily locked');
      }

      const payload = { sub: user.id, email: user.email, role: user.role };
      
      // Обновляем время последнего входа
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
      
      // Логируем успешный вход
      await this.securityService.logSecurityEvent('login_success', user.id, {
        email: user.email,
        ipAddress,
        userAgent,
      });
      
      return {
        access_token: this.jwtService.sign(payload),
        refresh_token: this.jwtService.sign(payload, {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        }),
      };
    } catch (error) {
      // Логируем неудачную попытку входа
      if (error instanceof UnauthorizedException) {
        await this.securityService.logSecurityEvent('login_failed', null, {
          email: loginDto.email,
          ipAddress,
          userAgent,
          reason: error.message,
        });
      }
      
      this.logger.error(`Login error: ${error.message}`);
      throw error;
    }
  }

  // Добавляем метод для OAuth
  async validateOAuthUser(profile: any, provider: string, ipAddress?: string, userAgent?: string) {
    try {
      let user = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });
      
      if (!user) {
        // Шифрование email
        const encryptedEmail = this.encryptionService.encrypt(profile.email);
        
        user = await this.prisma.user.create({
          data: {
            email: profile.email,
            encryptedEmail,
            nickname: profile.name || profile.email.split('@')[0],
          },
        });
        
        // Создаем профиль, кошелек и настройки
        await this.prisma.profile.create({
          data: { userId: user.id },
        });
        
        await this.prisma.wallet.create({
          data: { userId: user.id },
        });
        
        await this.prisma.userSettings.create({
          data: { userId: user.id },
        });
      }

      // Проверяем, есть ли аккаунт OAuth
      const oauthAccount = await this.prisma.oAuthAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId: profile.id,
          },
        },
      });

      if (!oauthAccount) {
        await this.prisma.oAuthAccount.create({
          data: {
            provider,
            providerAccountId: profile.id,
            userId: user.id,
          },
        });
      }

      // Логируем OAuth вход
      await this.securityService.logSecurityEvent('oauth_login_success', user.id, {
        provider,
        email: profile.email,
        ipAddress,
        userAgent,
      });
      
      return user;
    } catch (error) {
      this.logger.error(`OAuth validation error: ${error.message}`);
      throw error;
    }
  }

  // Добавляем метод для обновления токена
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      
      const newPayload = { sub: user.id, email: user.email, role: user.role };
      
      return {
        access_token: this.jwtService.sign(newPayload),
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Добавляем метод для блокировки пользователя
  async lockUser(userId: string, durationMinutes: number = 30) {
    const lockedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
    
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isLocked: true,
        lockedUntil,
      },
    });
    
    await this.securityService.logSecurityEvent('account_locked', userId, {
      durationMinutes,
    });
  }

  // Добавляем метод для разблокировки пользователя
  async unlockUser(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isLocked: false,
        lockedUntil: null,
      },
    });
    
    await this.securityService.logSecurityEvent('account_unlocked', userId, {});
  }
}
  */