import { Module } from '@nestjs/common';
import { NmsManagerService } from './nms.service';
import { NmsGateway } from './nms.gateway';

@Module({
  providers: [NmsManagerService, NmsGateway],
  exports: [NmsManagerService, NmsGateway],
})
export class NmsModule {}
