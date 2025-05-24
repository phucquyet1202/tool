import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { sendResponse } from 'src/common/sendRespone/response.helper';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const order = await this.prisma.order.create({ data: dto });
    if (!order) {
      throw new BadRequestException('Tạo đơn hàng không thành công!');
    }
    return sendResponse({
      statusCode: 201,
      message: 'Tạo đơn hàng thành công!',
      data: order,
    });
  }

  async findAll(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: true,
          paymentTransactions: true,
        },
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
      include: {
        user: true,
        paymentTransactions: true,
      },
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
    const Order = await this.prisma.order.update({ where: { id }, data: dto });
    if (!Order) {
      throw new BadRequestException('Không tìm thấy đơn hàng!');
    }
    return sendResponse({
      statusCode: 200,
      message: 'Cập nhật đơn hàng thành công!',
      data: Order,
    });
  }

  async remove(id: string) {
    const Order = await this.prisma.order.delete({ where: { id } });
    if (!Order) {
      throw new BadRequestException('Xóa đơn hàng không thành công!');
    }
    return sendResponse({
      statusCode: 200,
      message: 'Xóa đơn hàng thành công!',
      data: Order,
    });
  }
}
