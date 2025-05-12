// src/payment/payment.controller.ts
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-qr')
  createQR(@Body() body: { userId: string; orderId: string; amount: number }) {
    return this.paymentService.createPaymentQR(
      body.userId,
      body.orderId,
      body.amount,
    );
  }

  @Post('callback') // Đây là URL callback PayOS gọi về
  handleCallback(@Body() payload: any) {
    return this.paymentService.handlePayOSCallback(payload);
  }
}
