import { PartialType } from '@nestjs/mapped-types';
import { CreateUsePlatformDto } from './create-use-platform.dto';

export class UpdateUsePlatformDto extends PartialType(CreateUsePlatformDto) {}
