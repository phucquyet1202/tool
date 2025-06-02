import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateToolDto {
  @IsNotEmpty({ message: 'Tên tool không được để trống' })
  name: string;
  @IsNotEmpty({ message: 'Giá không được để trống' })
  @IsNumber({}, { message: 'Giá phải là một số' })
  @Min(0, { message: 'Giá phải lớn hơn hoặc bằng 0' })
  base_price: number;
  description?: string;
}
