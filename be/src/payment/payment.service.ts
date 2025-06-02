/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { payos } from './payos.helper';
import { v4 as uuidv4 } from 'uuid';
import { PlatformType, Status } from '@prisma/client';
import { sendResponse } from 'src/common/sendRespone/response.helper';
import { addDays } from 'date-fns';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo QR thanh toán
   */
  async createPaymentQR(userId: string, orderId: string, amount: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new BadRequestException('Không tìm thấy đơn hàng!');
    if (order.status !== Status.PENDING) {
      throw new BadRequestException('Đơn hàng đã thanh toán hoặc bị hủy!');
    }

    // ✅ Validate logic chỉ có 1 trong 2 (tool_id hoặc platform_type)
    if (
      (order.tool_id && order.platform_type) ||
      (!order.tool_id && !order.platform_type)
    ) {
      throw new BadRequestException(
        'Đơn hàng phải có đúng 1 trong 2: tool hoặc platform!',
      );
    }

    // Huỷ các giao dịch PENDING > 10 phút
    await this.prisma.paymentTransaction.updateMany({
      where: {
        order_id: orderId,
        status: Status.PENDING,
        created_at: { lt: new Date(Date.now() - 10 * 60 * 1000) },
      },
      data: { status: Status.FAILED },
    });

    // Gọi PayOS để tạo link
    const paymentLink = await payos.createPaymentLink({
      orderCode: Number(Date.now().toString().slice(-6)),
      amount,
      description: `Thanh toán đơn hàng #${orderId}`,
      returnUrl: `${process.env.CLIENT_URL}/payment-success`,
      cancelUrl: `${process.env.CLIENT_URL}/payment-cancel`,
    });

    // Tạo giao dịch thanh toán
    await this.prisma.paymentTransaction.create({
      data: {
        id: uuidv4(),
        order_id: orderId,
        amount,
        status: Status.PENDING,
        transaction_id: paymentLink.orderCode.toString(),
      },
    });

    return sendResponse({
      statusCode: 200,
      message: 'Tạo QR thanh toán thành công!',
      data: paymentLink,
    });
  }

  /**
   * Hàm cộng thêm ngày an toàn
   */
  private safeAddDays(date: Date, days: number): Date {
    return addDays(date, days);
  }

  /**
   * Xử lý callback từ PayOS
   */
  async handlePayOSCallback(payload: {
    orderCode: string;
    amount: number;
    status: string;
    description?: string;
  }) {
    const { orderCode, amount, status } = payload;

    // 1. Lấy thông tin order theo orderCode (orderId)
    const order = await this.prisma.order.findUnique({
      where: { id: orderCode },
      include: { user: true, tool: true },
    });

    if (!order || !order.user) {
      console.error(`Order ${orderCode} không tồn tại hoặc không có user.`);
      return {
        success: false,
        message: 'Order không tồn tại hoặc không có user',
      };
    }

    // 2. Kiểm tra trạng thái thanh toán
    if (status !== 'SUCCESS') {
      console.error(
        `Order ${orderCode} thanh toán không thành công: status=${status}`,
      );
      return { success: false, message: 'Thanh toán không thành công' };
    }

    // 3. So sánh amount trả về với số tiền trong order để tránh gian lận
    if (order.amount !== amount) {
      console.error(
        `Order ${orderCode} amount không khớp: order.amount=${order.amount}, callback.amount=${amount}`,
      );
      return { success: false, message: 'Số tiền thanh toán không khớp' };
    }

    const user = order.user;
    const daysToAdd = order.subscription_days ?? 0;
    const now = new Date();

    // 4. Validate logic: chỉ có 1 trong 2 (tool_id hoặc platform_type)
    if (
      (order.tool_id && order.platform_type) ||
      (!order.tool_id && !order.platform_type)
    ) {
      console.error(
        `Order ${orderCode} không hợp lệ: phải có đúng 1 trong 2: tool hoặc platform.`,
      );
      return { success: false, message: 'Order không hợp lệ' };
    }

    // 5. Cập nhật trạng thái order và transaction
    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderCode },
        data: { status: Status.PAID },
      }),
      this.prisma.paymentTransaction.updateMany({
        where: {
          order_id: orderCode,
          status: Status.PENDING,
        },
        data: { status: Status.PAID },
      }),
    ]);

    // 6. Lưu thông tin thanh toán vào bảng History
    await this.prisma.history.create({
      data: {
        id: uuidv4(),
        user_id: user.id,
        order_id: orderCode,
        amount: amount,
        paid_date: now,
        action: 'PAYMENT_SUCCESS',
        detail: `Thanh toán thành công với số tiền ${amount}`,
      },
    });

    // 7. Xác định các nền tảng cần cập nhật
    let platformsToUpdate: string[] = [];

    if (order.tool) {
      // Thuê combo: lấy các platform từ mô tả tool
      platformsToUpdate = order.tool.description
        ? order.tool.description.split(',').map((p) => p.trim().toUpperCase())
        : [];
    } else if (order.platform_type) {
      // Thuê lẻ
      platformsToUpdate =
        typeof order.platform_type === 'string' && order.platform_type
          ? [(order.platform_type as string).toUpperCase()]
          : [];
    }

    if (platformsToUpdate.length === 0) {
      console.error(
        `Không tìm thấy nền tảng để cập nhật cho order ${orderCode}`,
      );
      return { success: false, message: 'Không có nền tảng để cập nhật' };
    }

    // 8. Cập nhật subscription cho từng nền tảng
    await this.prisma.$transaction(async (prisma) => {
      const results = await Promise.all(
        platformsToUpdate.map(async (platformType) => {
          const platformEnum = platformType as PlatformType;

          const userPlatform = await prisma.userPlatform.findFirst({
            where: {
              user_id: user.id,
              platform_type: platformEnum,
            },
          });

          const isExpired =
            !userPlatform?.subscription_end ||
            userPlatform.subscription_end < now;
          const newStartDate = isExpired
            ? now
            : (userPlatform?.subscription_start ?? now);
          const newEndDate = isExpired
            ? this.safeAddDays(now, daysToAdd)
            : this.safeAddDays(userPlatform.subscription_end!, daysToAdd);

          if (userPlatform) {
            return prisma.userPlatform.update({
              where: { id: userPlatform.id },
              data: {
                subscription_start: newStartDate,
                subscription_end: newEndDate,
                subscription_days: isExpired
                  ? daysToAdd
                  : (userPlatform.subscription_days ?? 0) + daysToAdd,
                is_paid: true,
              },
            });
          } else {
            return prisma.userPlatform.create({
              data: {
                id: uuidv4(),
                user_id: user.id,
                platform_type: platformEnum,
                subscription_start: newStartDate,
                subscription_end: newEndDate,
                subscription_days: daysToAdd,
                is_paid: true,
              },
            });
          }
        }),
      );

      return results;
    });

    console.log(
      `Đã cập nhật subscription và lưu history cho order ${orderCode}.`,
    );
    return {
      success: true,
      message: 'Cập nhật subscription và history thành công',
    };
  }
}
