import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule],
})
export class AppModule {}
/*
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { StreamingModule } from './streaming/streaming.module';
import { ChatModule } from './chat/chat.module';
import { DonationsModule } from './donations/donations.module';
import { ThemesModule } from './themes/themes.module';
import { ShopModule } from './shop/shop.module';
import { EconomyModule } from './economy/economy.module';
import { GamesModule } from './games/games.module';
import { InventoryModule } from './inventory/inventory.module';
import { PaymentsModule } from './payments/payments.module';
import { PluginsModule } from './plugins/plugins.module';
import { HealthModule } from './common/health/health.module';

// Новые импорты для безопасности и мониторинга
import { TokenService } from './auth/services/token.service';
import { SecretRotationService } from './common/services/secret-rotation.service';
import { DastService } from './common/services/dast.service';
import { SqlFirewallService } from './common/services/sql-firewall.service';
import { SignedSqlService } from './common/services/signed-sql.service';
import { HsmService } from './common/services/hsm-service';
import { LoggingService } from './common/services/logging.service';
import { MonitoringService } from './common/services/monitoring.service';
import { MetricsController } from './common/controllers/metrics.controller';
import { LogsController } from './common/controllers/logs.controller';
import { LogsGateway } from './common/gateways/logs.gateway';

// Middleware импорты
import { HelmetMiddleware } from './common/middlewares/helmet.middleware';
import { MetricsProtectionMiddleware } from './common/middlewares/metrics-protection.middleware';
import { AdvancedWafMiddleware } from './common/middlewares/advanced-waf.middleware';
import { SsrProtectionMiddleware } from './common/middlewares/ssr-protection.middleware';
import { LoggingMiddleware } from './common/middlewares/logging.middleware';

// Guards импорты
import { EnhancedRolesGuard } from './auth/guards/enhanced-roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development'],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get('LOG_LEVEL') || 'info',
          transport: {
            target: 'pino-pretty',
            options: {
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: 60000,
            limit: 100,
          },
        ],
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    StreamingModule,
    ChatModule,
    DonationsModule,
    ThemesModule,
    ShopModule,
    EconomyModule,
    GamesModule,
    InventoryModule,
    PaymentsModule,
    PluginsModule,
    HealthModule,
  ],
  controllers: [MetricsController, LogsController],
  providers: [
    TokenService,
    SecretRotationService,
    DastService,
    SqlFirewallService,
    SignedSqlService,
    HsmService,
    LoggingService,
    MonitoringService,
    LogsGateway,
    EnhancedRolesGuard,
  ],
  exports: [
    TokenService,
    SecretRotationService,
    DastService,
    SqlFirewallService,
    SignedSqlService,
    HsmService,
    LoggingService,
    MonitoringService,
  ],
})
export class AppModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: any) {
    // Применяем middleware в правильном порядке
    consumer
      .apply(HelmetMiddleware)
      .forRoutes('*')
      .apply(AdvancedWafMiddleware)
      .forRoutes('*')
      .apply(MetricsProtectionMiddleware)
      .forRoutes('/metrics', '/grafana')
      .apply(SsrProtectionMiddleware)
      .forRoutes('*')
      .apply(LoggingMiddleware)
      .forRoutes('*');
  }
}
  */
