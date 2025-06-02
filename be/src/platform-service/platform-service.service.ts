import { Injectable } from '@nestjs/common';
import { CreatePlatformServiceDto } from './dto/create-platform-service.dto';
import { UpdatePlatformServiceDto } from './dto/update-platform-service.dto';

@Injectable()
export class PlatformServiceService {
  create(createPlatformServiceDto: CreatePlatformServiceDto) {
    return 'This action adds a new platformService';
  }

  findAll() {
    return `This action returns all platformService`;
  }

  findOne(id: number) {
    return `This action returns a #${id} platformService`;
  }

  update(id: number, updatePlatformServiceDto: UpdatePlatformServiceDto) {
    return `This action updates a #${id} platformService`;
  }

  remove(id: number) {
    return `This action removes a #${id} platformService`;
  }
}
