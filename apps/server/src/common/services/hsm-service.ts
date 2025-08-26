import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class HsmService {
  private readonly hsmKey: Buffer;
  private readonly keyId: string;

  constructor() {
    // В реальном приложении здесь было бы подключение к физическому HSM
    // Для демонстрации используем программную эмуляцию
    this.keyId = process.env.HSM_KEY_ID || 'hsm-key-1';
    this.hsmKey = Buffer.from(process.env.HSM_KEY || crypto.randomBytes(32).toString('hex'), 'hex');
  }

  // Подпись данных с использованием HSM
  async sign(data: string): Promise<string> {
    // В реальном HSM: отправляем запрос на подпись устройству
    const signature = crypto.sign(
      'RSA-SHA256',
      Buffer.from(data),
      {
        key: this.hsmKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
      }
    );

    return signature.toString('base64');
  }

  // Верификация подписи
  async verify(data: string, signature: string): Promise<boolean> {
    try {
      return crypto.verify(
        'RSA-SHA256',
        Buffer.from(data),
        {
          key: this.hsmKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
        },
        Buffer.from(signature, 'base64')
      );
    } catch (error) {
      return false;
    }
  }

  // Генерация JWT с HSM подписью
  async generateHsmJwt(payload: any): Promise<string> {
    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: this.keyId,
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const signature = await this.sign(dataToSign);
    const encodedSignature = Buffer.from(signature).toString('base64url');

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  }

  // Верификация HSM JWT
  async verifyHsmJwt(token: string): Promise<any> {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    // Верифицируем подпись
    const isValid = await this.verify(dataToSign, Buffer.from(encodedSignature, 'base64url').toString());
    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Декодируем payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    
    // Проверяем время жизни
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }

    return payload;
  }

  // Шифрование данных с использованием HSM
  async encrypt(data: string): Promise<string> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      this.hsmKey.slice(0, 32),
      iv
    );

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex'),
    });
  }

  // Расшифровка данных
  async decrypt(encryptedData: string): Promise<string> {
    const { iv, encryptedData, authTag } = JSON.parse(encryptedData);
    
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.hsmKey.slice(0, 32),
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}