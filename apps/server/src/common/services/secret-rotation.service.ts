import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class SecretRotationService implements OnModuleInit {
  private readonly secretsFile = join(process.cwd(), 'secrets.json');
  private readonly rotationInterval = 24 * 60 * 60 * 1000; // 24 часа
  private rotationTimer: NodeJS.Timeout;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeSecrets();
    this.startRotation();
  }

  private async initializeSecrets() {
    if (!require('fs').existsSync(this.secretsFile)) {
      const initialSecrets = {
        jwtAccessSecret: crypto.randomBytes(64).toString('hex'),
        jwtRefreshSecret: crypto.randomBytes(64).toString('hex'),
        metricsApiKey: crypto.randomBytes(32).toString('hex'),
        encryptionKey: crypto.randomBytes(32).toString('hex'),
        lastRotation: Date.now(),
      };

      writeFileSync(this.secretsFile, JSON.stringify(initialSecrets, null, 2));
    }
  }

  private startRotation() {
    // Ротация каждые 24 часа
    this.rotationTimer = setInterval(async () => {
      await this.rotateSecrets();
    }, this.rotationInterval);
  }

  private async rotateSecrets() {
    try {
      const secrets = JSON.parse(readFileSync(this.secretsFile, 'utf8'));
      
      // Генерируем новые секреты
      const newSecrets = {
        ...secrets,
        jwtAccessSecret: crypto.randomBytes(64).toString('hex'),
        jwtRefreshSecret: crypto.randomBytes(64).toString('hex'),
        metricsApiKey: crypto.randomBytes(32).toString('hex'),
        lastRotation: Date.now(),
      };

      // Сохраняем новые секреты
      writeFileSync(this.secretsFile, JSON.stringify(newSecrets, null, 2));
      
      console.log('✅ Secrets rotated successfully');
      
      // Здесь можно добавить логику для перезапуска сервисов
      // или graceful reload с новыми секретами
    } catch (error) {
      console.error('❌ Failed to rotate secrets:', error);
    }
  }

  getSecret(key: string): string {
    const secrets = JSON.parse(readFileSync(this.secretsFile, 'utf8'));
    return secrets[key];
  }

  // Проверка необходимости ротации
  shouldRotate(): boolean {
    const secrets = JSON.parse(readFileSync(this.secretsFile, 'utf8'));
    const timeSinceRotation = Date.now() - secrets.lastRotation;
    return timeSinceRotation > this.rotationInterval;
  }
}