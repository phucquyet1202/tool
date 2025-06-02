import { Status } from '@prisma/client';
import {
  IsUUID,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePaymentTransactionDto {
  @IsUUID()
  order_id: string;

  @IsNumber({}, { message: 'Số tiền không hợp lệ' })
  amount: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsString()
  transaction_id?: string;
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
