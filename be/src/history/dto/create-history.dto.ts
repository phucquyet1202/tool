import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class CreateHistoryDto {
  @IsUUID()
  user_id: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  detail?: string;
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
