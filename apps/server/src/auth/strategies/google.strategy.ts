import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { oauthUtils } from '@streaming/database';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { email, name, picture } = profile;
      const normalizedProfile = oauthUtils.normalizeProfile(profile, 'google');

      // Ищем пользователя по OAuth аккаунту
      let oauthAccount = await this.prisma.oAuthAccount.findUnique({
        where: {
          provider_providerId: {
            provider: 'google',
            providerId: normalizedProfile.providerId,
          },
        },
        include: { user: true },
      });

      if (oauthAccount) {
        // Пользователь уже существует
        return done(null, oauthAccount.user);
      }

      // Ищем пользователя по email
      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Создаем нового пользователя
        const username = oauthUtils.generateUsername(email);
        user = await this.prisma.user.create({
          data: {
            email,
            username,
            name,
            avatar: picture,
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
          provider: 'google',
          providerId: normalizedProfile.providerId,
          email,
          name,
          avatar: picture,
        },
      });

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
}