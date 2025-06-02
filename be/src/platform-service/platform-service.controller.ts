import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlatformServiceService } from './platform-service.service';
import { CreatePlatformServiceDto } from './dto/create-platform-service.dto';
import { UpdatePlatformServiceDto } from './dto/update-platform-service.dto';

@Controller('platform-service')
export class PlatformServiceController {
  constructor(private readonly platformServiceService: PlatformServiceService) {}

  @Post()
  create(@Body() createPlatformServiceDto: CreatePlatformServiceDto) {
    return this.platformServiceService.create(createPlatformServiceDto);
  }

  @Get()
  findAll() {
    return this.platformServiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.platformServiceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlatformServiceDto: UpdatePlatformServiceDto) {
    return this.platformServiceService.update(+id, updatePlatformServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.platformServiceService.remove(+id);
  }
}
