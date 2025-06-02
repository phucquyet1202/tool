import { Module } from '@nestjs/common';
import { UsePlatformService } from './use-platform.service';
import { UsePlatformController } from './use-platform.controller';

@Module({
  controllers: [UsePlatformController],
  providers: [UsePlatformService],
})
export class UsePlatformModule {}
