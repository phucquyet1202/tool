import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { sendResponse } from 'src/common/sendRespone/response.helper';

@Injectable()
export class ToolService {
  constructor(private prisma: PrismaService) {}
  async create(createToolDto: CreateToolDto) {
    const tool = await this.prisma.tool.create({
      data: createToolDto,
    });
    if (!tool) {
      throw new BadRequestException('Tạo công cụ thất bại');
    }
    return sendResponse({
      statusCode: 201,
      message: 'Tạo công cụ thành công',
      data: tool,
    });
  }

  async findAll() {
    const tools = await this.prisma.tool.findMany({
      orderBy: { created_at: 'desc' },
    });
    if (!tools || tools.length === 0) {
      throw new BadRequestException('Không có công cụ nào');
    }
    return sendResponse({
      statusCode: 200,
      message: 'Lấy danh sách công cụ thành công',
      data: tools,
    });
  }

  async findOne(id: string) {
    const tool = await this.prisma.tool.findUnique({
      where: { id },
    });
    if (!tool) {
      throw new BadRequestException('Công cụ không tồn tại');
    }
    return sendResponse({
      statusCode: 200,
      message: 'Lấy công cụ thành công',
      data: tool,
    });
  }

  async update(id: string, updateToolDto: UpdateToolDto) {
    const tool = await this.prisma.tool.update({
      where: { id },
      data: updateToolDto,
    });
    if (!tool) {
      throw new BadRequestException('Cập nhật công cụ thất bại');
    }
    return sendResponse({
      statusCode: 200,
      message: 'Cập nhật công cụ thành công',
      data: tool,
    });
  }

  async remove(id: string) {
    const tool = await this.prisma.tool.delete({
      where: { id },
    });
    if (!tool) {
      throw new BadRequestException('Xoá công cụ thất bại');
    }
    return sendResponse({
      statusCode: 200,
      message: 'Xoá công cụ thành công',
      data: tool,
    });
  }
}
