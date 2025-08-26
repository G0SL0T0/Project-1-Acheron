import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { LockdownService } from '../services/lockdown.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { LoggingService } from '../services/logging.service';

interface InitiateLockdownDto {
  reason: string;
  estimatedDuration?: number;
  affectedServices?: string[];
  allowAdminAccess?: boolean;
  customMessage?: string;
}

@Controller('api/admin/lockdown')
@UseGuards(AdminGuard)
export class LockdownController {
  constructor(
    private readonly lockdownService: LockdownService,
    private readonly loggingService: LoggingService,
  ) {}

  @Post('initiate')
  async initiateLockdown(@Body() body: InitiateLockdownDto, @Req() req: any) {
    try {
      const config = await this.lockdownService.initiateLockdown(
        body.reason,
        req.user.username,
        body
      );

      await this.loggingService.warn(
        `Lockdown initiated by admin: ${body.reason}`,
        'SECURITY',
        {
          userId: req.user.id,
          ipAddress: req.ip,
          metadata: {
            action: 'lockdown_initiated',
            config,
          },
        }
      );

      return {
        success: true,
        message: 'Lockdown initiated successfully',
        config,
      };
    } catch (error) {
      await this.loggingService.error(
        `Failed to initiate lockdown: ${error.message}`,
        'SECURITY',
        {
          userId: req.user.id,
          ipAddress: req.ip,
          metadata: {
            action: 'lockdown_failed',
            error: error.message,
          },
        }
      );

      return {
        success: false,
        message: 'Failed to initiate lockdown',
        error: error.message,
      };
    }
  }

  @Post('lift')
  async liftLockdown(@Req() req: any) {
    try {
      await this.lockdownService.liftLockdown(req.user.username);

      await this.loggingService.info(
        'Lockdown lifted by admin',
        'SECURITY',
        {
          userId: req.user.id,
          ipAddress: req.ip,
          metadata: {
            action: 'lockdown_lifted',
          },
        }
      );

      return {
        success: true,
        message: 'Lockdown lifted successfully',
      };
    } catch (error) {
      await this.loggingService.error(
        `Failed to lift lockdown: ${error.message}`,
        'SECURITY',
        {
          userId: req.user.id,
          ipAddress: req.ip,
          metadata: {
            action: 'lockdown_lift_failed',
            error: error.message,
          },
        }
      );

      return {
        success: false,
        message: 'Failed to lift lockdown',
        error: error.message,
      };
    }
  }

  @Get('status')
  async getStatus() {
    const isActive = this.lockdownService.isLockdownActive();
    const config = this.lockdownService.getCurrentConfig();

    return {
      isActive,
      config,
    };
  }
}