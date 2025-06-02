import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderService } from 'src/order/order.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService, OrderService],
})
export class PaymentModule {}
