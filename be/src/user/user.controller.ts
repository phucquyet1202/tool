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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { cookieAccessToken } from 'src/common/cookie/cookie';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }
  @Post('/login')
  @UseGuards(AuthGuard('local'))
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const token = await this.userService.login(req.user);
    cookieAccessToken(res, token);
    return {
      statusCode: HttpStatus.OK,
      message: 'Đăng nhập thành công!',
      data: token,
    };
  }
  @UseGuards(JwtAuthGuard)
  @Get('/get-user-by-token')
  async getUserByToken(@Request() req) {
    const token = req.cookies.token;
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
