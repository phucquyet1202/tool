import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Res,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { cookieAccessToken } from 'src/common/cookie/cookie';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }
  @Post('/login')
  @UseGuards(AuthGuard('local'))
  login(
    @Request() req: { user: any },
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = this.userService.login(req.user as { id: string });
    cookieAccessToken(res, token);
    return {
      statusCode: HttpStatus.OK,
      message: 'Đăng nhập thành công!',
      data: token,
    };
  }
  @UseGuards(JwtAuthGuard)
  @Get('/get-user-by-token')
  async getUserByToken(@Request() req: { cookies: { token?: string } }) {
    const token = req.cookies.token;
    if (!token) {
      throw new UnauthorizedException('Bạn chưa đăng nhập');
    }
    return await this.userService.findOneByToken(token);
  }
  @Get()
  findAll(@Body() filter: UpdateUserDto) {
    return this.userService.findAll(filter);
  }

  @Get('/get-one/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
