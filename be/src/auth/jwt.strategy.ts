// Lấy token từ cookie và xác thực token nếu true thì gán thông tin cho req.user
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.token || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        (() => {
          throw new Error('JWT_SECRET is not defined');
        })(), // Ensure JWT_SECRET is defined
    });
  }

  async validate(payload: any) {
    const user: any = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Bạn chưa đăng nhập');
    }
    user.password = undefined;
    return user;
  }
}
