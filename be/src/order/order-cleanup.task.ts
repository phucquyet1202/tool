import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { Status } from '@prisma/client';

@Injectable()
export class OrderCleanupTask {
  private readonly logger = new Logger(OrderCleanupTask.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanupExpiredOrders() {
    const thresholdDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 ngày trước

    const result = await this.prisma.order.deleteMany({
      where: {
        status: { in: [Status.PENDING, Status.FAILED] },
        created_at: { lt: thresholdDate },
      },
    });

    this.logger.log(
      `🧹 Đã xoá ${result.count} đơn hàng PENDING hoặc FAILED quá 10 ngày.`,
    );
  }
}
