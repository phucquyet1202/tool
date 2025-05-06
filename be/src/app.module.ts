import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StreamModule } from './stream/stream.module';
// import { RtmpService } from './rtmp/rtmp.service';
import { FfmpegService } from './ffmpeg/ffmpeg.service';
import { FfmpegGateway } from './ffmpeg/ffmpeg.gateway';

@Module({
  imports: [StreamModule],
  controllers: [AppController],
  providers: [
    AppService,
    FfmpegService,
    FfmpegGateway,
    //  RtmpService
  ],
})
export class AppModule {}
