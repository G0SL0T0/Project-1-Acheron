import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { YandexStrategy } from './strategies/yandex.strategy';
import { TokenService } from './services/token.service';
import { AdvancedJwtService } from './services/advanced-jwt.service';
import { OAuthService } from './services/oauth.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    AdvancedJwtService,
    OAuthService,
    JwtStrategy,
    GoogleStrategy,
    YandexStrategy,
    WsJwtGuard,
  ],
  exports: [AuthService, TokenService, AdvancedJwtService, OAuthService],
})
export class AuthModule {}