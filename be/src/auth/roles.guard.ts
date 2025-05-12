import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // Không yêu cầu role, cho qua
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Bạn chưa đăng nhập');
    }
    const hasRole = requiredRoles.some((role) =>
      user?.data?.role?.includes(role),
    );
    if (!hasRole) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }
    return true;
  }
}
