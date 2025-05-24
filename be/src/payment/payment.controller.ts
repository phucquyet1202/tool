// src/payment/payment.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
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
  handleCallback(
    @Body()
    payload: {
      orderCode: string;
      amount: number;
      status: string;
      description?: string;
    },
  ) {
    return this.paymentService.handlePayOSCallback(payload);
  }
}
