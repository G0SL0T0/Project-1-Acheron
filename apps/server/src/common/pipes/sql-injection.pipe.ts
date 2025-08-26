import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class SqlInjectionProtectionPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      // Паттерны для обнаружения SQL инъекций
      const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER|CREATE|TRUNCATE)\b)|(\b(OR|AND)\s+\d+\s*=\s*\d+)/i;
      
      if (sqlPattern.test(value)) {
        throw new BadRequestException('Обнаружена попытка SQL инъекции');
      }
    }
    
    return value;
  }
}