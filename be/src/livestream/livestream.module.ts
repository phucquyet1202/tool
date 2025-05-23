// nest-app/src/livestream/livestream.module.ts
import { Module } from '@nestjs/common';
import { LivestreamController } from './livestream.controller';
import { LivestreamService } from './livestream.service';

@Module({
  controllers: [LivestreamController],
  providers: [LivestreamService],
  exports: [LivestreamService],
})
export class LivestreamModule {}
