import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from 'prisma';
import { sendResponse } from 'src/common/sendRespone/response.helper';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // Kiểm tra email đã tồn tại
    const emailExists = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (emailExists) {
      throw new BadRequestException('Email đã tồn tại!');
    }

    const saltRounds = parseInt(
      this.configService.get('BCRYPT_SALT_ROUNDS') || '10',
      10,
    );
    const salt = await bcrypt.genSalt(saltRounds);
    createUserDto.password = await bcrypt.hash(createUserDto.password, salt);

    // Tạo người dùng mới
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        role: createUserDto.role as Role, // Explicitly cast role to the expected type
      },
    });

    if (!user) {
      throw new BadRequestException('Đăng ký không thành công!');
    }

    user.password = null as unknown as string; // Không trả về mật khẩu
    user.role = null as unknown as Role; // Không trả về role
    return sendResponse({
      statusCode: HttpStatus.OK,
      message: 'Đăng ký thành công!',
      data: user,
    });
  }
  async login(user: any) {
    const payload = { sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  async findOneByToken(token: string) {
    const { sub } = await this.jwtService.verify(token);
    const user = await this.prisma.user.findUnique({
      where: { id: sub },
    });

    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng!');
    }

    user.password = null as unknown as string; // Không trả về mật khẩu
    return sendResponse({
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin người dùng thành công!',
      data: user,
    });
  }
  async findAll(filter: UpdateUserDto) {
    const { name, email, page = 1, limit = 10 } = filter;
    const where: any = {};

    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (email) where.email = { contains: email, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          orders: true,
          histories: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return sendResponse({
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách người dùng thành công!',
      data: { data, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        orders: true,
        histories: true,
      },
    });
    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng!');
    }
    user.password = null as unknown as string; // Không trả về mật khẩu
    return sendResponse({
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin người dùng thành công!',
      data: user,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({ where: { id }, data: dto });
    if (!user) {
      throw new BadRequestException('Cập nhật người dùng không thành công!');
    }
    user.password = null as unknown as string; // Không trả về mật khẩu
    return sendResponse({
      statusCode: HttpStatus.OK,
      message: 'Cập nhật người dùng thành công!',
      data: user,
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.delete({ where: { id } });
    if (!user) {
      throw new BadRequestException('Xóa người dùng không thành công!');
    }
    user.password = null as unknown as string; // Không trả về mật khẩu
    return sendResponse({
      statusCode: HttpStatus.OK,
      message: 'Xóa người dùng thành công!',
      data: user,
    });
  }
  isValidPass(pass: string, hashedPass: string): boolean {
    return bcrypt.compareSync(pass, hashedPass);
  }
}
