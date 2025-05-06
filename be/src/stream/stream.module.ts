import { Module } from '@nestjs/common';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { FfmpegService } from 'src/ffmpeg/ffmpeg.service';

@Module({
  imports: [],
  controllers: [StreamController],
  providers: [StreamService, FfmpegService],
  exports: [StreamService],
})
export class StreamModule {}
