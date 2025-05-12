import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentTransactionDto } from './create-payment.dto';

export class UpdatePaymentTransactionDto extends PartialType(
  CreatePaymentTransactionDto,
) {}
