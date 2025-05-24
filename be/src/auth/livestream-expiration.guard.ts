// src/common/guards/livestream-expiration.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class LivestreamExpirationGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    // private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { id: string };

    if (!user?.id) {
      throw new UnauthorizedException('Không xác định được người dùng');
    }

    const latestOrder = await this.prisma.order.findFirst({
      where: {
        user_id: user.id,
        paid: true,
      },
      orderBy: {
        end_date: 'desc',
      },
    });

    const now = new Date();
    if (!latestOrder || new Date(latestOrder.end_date) < now) {
      throw new UnauthorizedException(
        'Tài khoản của bạn đã hết hạn. Vui lòng gia hạn để sử dụng livestream.',
      );
    }

    return true;
  }
}
