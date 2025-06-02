import { Module } from '@nestjs/common';
import { PlatformServiceService } from './platform-service.service';
import { PlatformServiceController } from './platform-service.controller';

@Module({
  controllers: [PlatformServiceController],
  providers: [PlatformServiceService],
})
export class PlatformServiceModule {}
