import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { sendResponse } from 'src/common/sendRespone/response.helper';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHistoryDto) {
    const history = await this.prisma.history.create({ data: dto });
    if (!history) {
      throw new BadRequestException('Tạo lịch sử không thành công!');
    }
    return sendResponse({
      statusCode: 201,
      message: 'Tạo lịch sử thành công!',
      data: history,
    });
  }

  async findAll(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.prisma.history.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { user: true },
      }),
      this.prisma.history.count(),
    ]);
    return sendResponse({
      statusCode: 200,
      message: 'Lấy danh sách lịch sử thành công!',
      data: { data, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  }

  async findOne(id: string) {
    const history = await this.prisma.history.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!history) {
      throw new BadRequestException('Không tìm thấy lịch sử!');
    }
    return sendResponse({
      statusCode: 200,
      message: 'Lấy thông tin lịch sử thành công!',
      data: history,
    });
  }

  async update(id: string, dto: UpdateHistoryDto) {
    const history = await this.prisma.history.update({
      where: { id },
      data: dto,
    });

    if (!history) {
      throw new BadRequestException('Không tìm thấy lịch sử!');
    }
    return sendResponse({
      statusCode: 200,
      message: 'Cập nhật lịch sử thành công!',
      data: history,
    });
  }

  async remove(id: string) {
    const history = await this.prisma.history.delete({ where: { id } });
    if (!history) {
      throw new BadRequestException('Xóa lịch sử không thành công!');
    }
    return sendResponse({
      statusCode: 200,
      message: 'Xóa lịch sử thành công!',
      data: history,
    });
  }
}
