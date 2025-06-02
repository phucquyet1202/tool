import { Module } from '@nestjs/common';
import { ToolService } from './tool.service';
import { ToolController } from './tool.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ToolController],
  providers: [ToolService, PrismaService],
})
export class ToolModule {}
