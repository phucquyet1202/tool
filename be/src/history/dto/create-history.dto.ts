import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateHistoryDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsUUID()
  @IsNotEmpty()
  order_id: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  paid_date: string; // dùng ISO 8601 string, ví dụ "2024-06-01T10:00:00Z"

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsOptional()
  @IsString()
  detail?: string;
}
