import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, // Sử dụng PrismaService
    private userService: UserService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      if (user.password && this.userService.isValidPass(pass, user.password)) {
        user.password = null as unknown as string; // Xóa mật khẩu khỏi kết quả trả về
        return user;
      }
    }

    return null;
  }
}
