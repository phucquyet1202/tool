// src/payment/payment.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from 'prisma';
import { sendResponse } from 'src/common/sendRespone/response.helper';
import { payos } from './payos.helper';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  // Tạo QR PayOS
  async createPaymentQR(userId: string, orderId: string, amount: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new BadRequestException('Không tìm thấy đơn hàng!');
    }

    // Tạo QR
    const paymentLink = await payos.createPaymentLink({
      orderCode: Number(Date.now().toString().slice(-6)), // random code
      amount,
      description: `Thanh toán đơn hàng #${orderId}`,
      returnUrl: `${process.env.CLIENT_URL}/payment-success`,
      cancelUrl: `${process.env.CLIENT_URL}/payment-cancel`,
    });

    // Lưu transaction (trạng thái PENDING)
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

  // Xử lý callback PayOS khi thanh toán thành công
  async handlePayOSCallback(payload: {
    orderCode: string;
    amount: number;
    status: string;
    description?: string;
  }) {
    const { orderCode, amount, status } = payload;

    // Tìm giao dịch bằng transaction_id (orderCode)
    const payment = await this.prisma.paymentTransaction.findFirst({
      where: { transaction_id: orderCode.toString() },
      include: { order: true },
    });

    if (!payment) {
      throw new BadRequestException('Không tìm thấy giao dịch!');
    }

    // Nếu status = "PAID"
    if (status === 'PAID') {
      const daysToAdd = Math.floor(amount / 10000) * 1; // Ví dụ: 10k = 1 ngày

      const now = new Date();
      const newEndDate =
        payment.order.end_date > now
          ? new Date(
              payment.order.end_date.getTime() +
                daysToAdd * 24 * 60 * 60 * 1000,
            )
          : new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

      // Cập nhật đơn hàng
      await this.prisma.order.update({
        where: { id: payment.order.id },
        data: {
          amount: { increment: amount },
          days: { increment: daysToAdd },
          start_date: now,
          end_date: newEndDate,
          paid: true,
        },
      });

      // Cập nhật trạng thái transaction
      await this.prisma.paymentTransaction.update({
        where: { id: payment.id },
        data: {
          status: Status.PAID,
        },
      });

      return sendResponse({
        statusCode: 200,
        message: 'Thanh toán thành công, đã cập nhật đơn hàng!',
      });
    } else {
      // Nếu thất bại
      await this.prisma.paymentTransaction.update({
        where: { id: payment.id },
        data: {
          status: Status.FAILED,
        },
      });

      throw new BadRequestException('Thanh toán thất bại!');
    }
  }
}
