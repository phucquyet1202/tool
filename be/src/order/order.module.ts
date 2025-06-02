import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { OrderCleanupTask } from './order-cleanup.task';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [OrderService, OrderCleanupTask, PrismaService],
})
export class OrderModule {}
