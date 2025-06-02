import { Injectable } from '@nestjs/common';
import { CreateUsePlatformDto } from './dto/create-use-platform.dto';
import { UpdateUsePlatformDto } from './dto/update-use-platform.dto';

@Injectable()
export class UsePlatformService {
  create(createUsePlatformDto: CreateUsePlatformDto) {
    return 'This action adds a new usePlatform';
  }

  findAll() {
    return `This action returns all usePlatform`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usePlatform`;
  }

  update(id: number, updateUsePlatformDto: UpdateUsePlatformDto) {
    return `This action updates a #${id} usePlatform`;
  }

  remove(id: number) {
    return `This action removes a #${id} usePlatform`;
  }
}
