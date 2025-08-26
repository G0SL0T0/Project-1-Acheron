import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { LoggingService } from './common/services/logging.service';
import { SecretRotationService } from './common/services/secret-rotation.service';
import { DastService } from './common/services/dast.service';
import * as fs from 'fs';
import * as https from 'https';
import { httpsOptions } from './common/configs/https.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { 
    bufferLogs: true,
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Получаем сервисы для инициализации
  const loggingService = app.get(LoggingService);
  const secretRotationService = app.get(SecretRotationService);
  const dastService = app.get(DastService);

  // Логируем запуск приложения
  await loggingService.info('Application starting', 'BOOTSTRAP');

  // Проверяем необходимость ротации секретов
  if (secretRotationService.shouldRotate()) {
    await secretRotationService.rotateSecrets();
    await loggingService.info('Secrets rotated', 'SECURITY');
  }

  // Запускаем фоновое сканирование безопасности
  dastService.runDependencyCheck().then(result => {
    if (result.success) {
      loggingService.info('Dependency check completed', 'SECURITY', { reportPath: result.reportPath });
    }
  });

  // Глобальные настройки
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });
  
  // Логирование
  app.useLogger(app.get(Logger));

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('Стриминговая платформа API')
    .setDescription('Документация API для стриминговой платформы')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Запуск сервера
  const port = process.env.PORT || 3000;
  
  if (process.env.NODE_ENV === 'production' && fs.existsSync('./ssl/server.crt')) {
    // Запуск с HTTPS
    const server = https.createServer(httpsOptions, app.getHttpAdapter().getInstance());
    server.listen(port, () => {
      console.log(`🚀 Сервер запущен на порту ${port} (HTTPS)`);
      console.log(`📖 Документация API: https://localhost:${port}/api`);
    });
  } else {
    // Запуск с HTTP
    await app.listen(port);
    console.log(`🚀 Сервер запущен на порту ${port}`);
    console.log(`📖 Документация API: http://localhost:${port}/api`);
  }

  // Логируем успешный запуск
  await loggingService.info('Application started successfully', 'BOOTSTRAP', { port });
}

bootstrap();