import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import { PlatformType } from '@prisma/client';

@Injectable()
export class LivestreamExpirationGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { id: string };

    // 1️⃣ Kiểm tra user đăng nhập hay chưa
    if (!user?.id) {
      throw new UnauthorizedException('Không xác định được người dùng.');
    }

    // 2️⃣ Lấy platform từ metadata (do @SetMetadata('platform', 'YOUTUBE') gán)
    const platform = this.reflector.get<string>(
      'platform',
      context.getHandler(),
    );
    if (!platform) {
      throw new BadRequestException('Thiếu thông tin nền tảng.');
    }

    // 3️⃣ Tìm thông tin thuê platform
    const userPlatform = await this.prisma.userPlatform.findFirst({
      where: {
        user_id: user.id,
        platform_type: platform as PlatformType, // Cast to the correct enum type if PlatformType is an enum
      },
    });

    const now = new Date();

    // 4️⃣ Kiểm tra có thuê nền tảng này hay không
    if (!userPlatform) {
      throw new BadRequestException(
        `Bạn chưa đăng ký dịch vụ livestream cho nền tảng ${platform}.`,
      );
    }

    // 5️⃣ Kiểm tra subscription hết hạn hay chưa
    if (
      !userPlatform.subscription_end ||
      new Date(userPlatform.subscription_end) < now
    ) {
      throw new BadRequestException(
        `Tài khoản livestream nền tảng ${platform} của bạn đã hết hạn. Vui lòng gia hạn.`,
      );
    }

    // 6️⃣ Cho phép tiếp tục
    return true;
  }
}
