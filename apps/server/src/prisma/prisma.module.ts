/*
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { EnhancedPrismaService } from './enhanced-prisma.service';
import { SecretRotationService } from '../common/services/secret-rotation.service';
*/
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
/*
@Global()
@Module({
  providers: [
    PrismaService,
    EnhancedPrismaService,
    {
      provide: 'PRISMA_SERVICE',
      useFactory: (enhancedService: EnhancedPrismaService) => enhancedService,
      inject: [EnhancedPrismaService],
    },
  ],
  exports: [PrismaService, EnhancedPrismaService, 'PRISMA_SERVICE'],
})
export class PrismaModule {}*/