import {
  IsUUID,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Status } from 'prisma';

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
