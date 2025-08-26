import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-yandex';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { oauthUtils } from '@streaming/database';

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      clientID: configService.get('YANDEX_CLIENT_ID'),
      clientSecret: configService.get('YANDEX_CLIENT_SECRET'),
      callbackURL: configService.get('YANDEX_CALLBACK_URL'),
      scope: ['login:email', 'login:info', 'login:avatar'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    try {
      const normalizedProfile = oauthUtils.normalizeProfile(profile, 'yandex');

      // Ищем пользователя по OAuth аккаунту
      let oauthAccount = await this.prisma.oAuthAccount.findUnique({
        where: {
          provider_providerId: {
            provider: 'yandex',
            providerId: normalizedProfile.providerId,
          },
        },
        include: { user: true },
      });

      if (oauthAccount) {
        return done(null, oauthAccount.user);
      }

      // Ищем пользователя по email
      let user = await this.prisma.user.findUnique({
        where: { email: normalizedProfile.email },
      });

      if (!user) {
        // Создаем нового пользователя
        const username = oauthUtils.generateUsername(normalizedProfile.email);
        user = await this.prisma.user.create({
          data: {
            email: normalizedProfile.email,
            username,
            name: normalizedProfile.name,
            avatar: normalizedProfile.avatar,
            roles: {
              create: [{ role: 'USER' }],
            },
            profile: {
              create: {
                language: 'ru',
                timezone: 'Europe/Moscow',
              },
            },
          },
        });
      }

      // Создаем OAuth аккаунт
      oauthAccount = await this.prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: 'yandex',
          providerId: normalizedProfile.providerId,
          email: normalizedProfile.email,
          name: normalizedProfile.name,
          avatar: normalizedProfile.avatar,
        },
      });

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
}