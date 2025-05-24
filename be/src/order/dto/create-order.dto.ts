import { IsUUID, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  user_id: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  days: number;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
