import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { sendResponse } from 'src/common/sendRespone/response.helper';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    // Tìm tất cả các đơn hàng của user
    const oldOrders = await this.prisma.order.findMany({
      where: { user_id: dto.user_id },
      include: { transactions: true },
    });

    if (oldOrders.length > 0) {
      // Gom tất cả transactionId cần xoá
      const allTransactionDeletions = oldOrders.flatMap((order) =>
        this.prisma.paymentTransaction.delete({ where: { id: order.id } }),
      );

      const allOrderDeletions = oldOrders.map((order) =>
        this.prisma.order.delete({ where: { id: order.id } }),
      );

      // Xoá toàn bộ đơn hàng và giao dịch liên quan
      await this.prisma.$transaction([
        ...allTransactionDeletions,
        ...allOrderDeletions,
      ]);
    }

    // Tạo đơn hàng mới
    const newOrder = await this.prisma.order.create({
      data: {
        user_id: dto.user_id,
        amount: dto.amount,
        status: 'PENDING',
      },
    });

    return sendResponse({
      statusCode: 201,
      message: 'Tạo đơn hàng thành công, chờ thanh toán!',
      data: newOrder,
    });
  }

  async findAll(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { user: true, transactions: true },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.order.count(),
    ]);

    return sendResponse({
      statusCode: 200,
      message: 'Lấy danh sách đơn hàng thành công!',
      data: { data, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { user: true, transactions: true },
    });

    if (!order) {
      throw new BadRequestException('Không tìm thấy đơn hàng!');
    }

    return sendResponse({
      statusCode: 200,
      message: 'Lấy thông tin đơn hàng thành công!',
      data: order,
    });
  }
  async update(id: string, dto: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new BadRequestException('Không tìm thấy đơn hàng!');
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });
    return sendResponse({
      statusCode: 200,
      message: 'Cập nhật đơn hàng thành công!',
      data: updatedOrder,
    });
  }

  async remove(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new BadRequestException('Không tìm thấy đơn hàng!');

    if (order.status === 'PAID') {
      throw new BadRequestException('Không thể xóa đơn đã thanh toán!');
    }

    const deletedOrder = await this.prisma.order.delete({ where: { id } });

    return sendResponse({
      statusCode: 200,
      message: 'Xóa đơn hàng thành công!',
      data: deletedOrder,
    });
  }
}
