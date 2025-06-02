import { PartialType } from '@nestjs/mapped-types';
import { CreatePlatformServiceDto } from './create-platform-service.dto';

export class UpdatePlatformServiceDto extends PartialType(CreatePlatformServiceDto) {}
