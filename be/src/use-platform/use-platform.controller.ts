import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsePlatformService } from './use-platform.service';
import { CreateUsePlatformDto } from './dto/create-use-platform.dto';
import { UpdateUsePlatformDto } from './dto/update-use-platform.dto';

@Controller('use-platform')
export class UsePlatformController {
  constructor(private readonly usePlatformService: UsePlatformService) {}

  @Post()
  create(@Body() createUsePlatformDto: CreateUsePlatformDto) {
    return this.usePlatformService.create(createUsePlatformDto);
  }

  @Get()
  findAll() {
    return this.usePlatformService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usePlatformService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsePlatformDto: UpdateUsePlatformDto) {
    return this.usePlatformService.update(+id, updateUsePlatformDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usePlatformService.remove(+id);
  }
}
