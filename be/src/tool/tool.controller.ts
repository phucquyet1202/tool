import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ToolService } from './tool.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('tool')
export class ToolController {
  constructor(private readonly toolService: ToolService) {}
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Post()
  create(@Body() createToolDto: CreateToolDto) {
    return this.toolService.create(createToolDto);
  }

  @Get()
  findAll() {
    return this.toolService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.toolService.findOne(id);
  }
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateToolDto: UpdateToolDto) {
    return this.toolService.update(id, updateToolDto);
  }
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.toolService.remove(id);
  }
}
