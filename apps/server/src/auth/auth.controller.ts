import { Controller, Get, Request, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  // Google OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Стартует процесс OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Request() req, @Res() res: Response) {
    const { accessToken } = await this.authService.login(req.user);
    const frontendUrl = this.configService.get('FRONTEND_URL');
    
    // Редирект на фронтенд с токеном
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  }

  // Yandex OAuth
  @Get('yandex')
  @UseGuards(AuthGuard('yandex'))
  async yandexAuth() {
    // Стартует процесс OAuth
  }

  @Get('yandex/callback')
  @UseGuards(AuthGuard('yandex'))
  async yandexAuthCallback(@Request() req, @Res() res: Response) {
    const { accessToken } = await this.authService.login(req.user);
    const frontendUrl = this.configService.get('FRONTEND_URL');
    
    // Редирект на фронтенд с токеном
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  }
}