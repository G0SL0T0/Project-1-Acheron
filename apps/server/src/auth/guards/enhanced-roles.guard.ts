import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EnhancedRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;
    
    if (!user) {
      return false;
    }

    // Проверяем роли в БД (не доверяем данным из токена!)
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true },
    });

    const roleNames = userRoles.map(ur => ur.role.name);
    
    // Проверяем наличие требуемой роли
    const hasRole = requiredRoles.some(role => roleNames.includes(role));
    
    if (!hasRole) {
      // Логируем попытку несанкционированного доступа
      await this.logUnauthorizedAttempt(user.id, requiredRoles, request);
      return false;
    }

    return true;
  }

  private async logUnauthorizedAttempt(
    userId: string, 
    requiredRoles: string[], 
    request: any
  ) {
    await this.prisma.securityAudit.create({
      data: {
        userId,
        action: 'PRIVILEGE_ESCALATION_ATTEMPT',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        successful: false,
        metadata: {
          requiredRoles,
          path: request.path,
          method: request.method,
        },
      },
    });
  }
}