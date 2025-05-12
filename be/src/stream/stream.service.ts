// src/stream/stream.service.ts
import { Injectable } from '@nestjs/common';
import { FfmpegService } from '../ffmpeg/ffmpeg.service';

@Injectable()
export class StreamService {
  constructor(private readonly ffmpegService: FfmpegService) {}

  startYouTube(videoUrl: string, rtmpUrl: string) {
    return this.ffmpegService.startStream(videoUrl, rtmpUrl, 'youtube');
  }

  stopYouTube() {
    return this.ffmpegService.stopStream('youtube');
  }

  startFacebook(videoUrl: string, rtmpUrl: string) {
    return this.ffmpegService.startStream(videoUrl, rtmpUrl, 'facebook');
  }

  stopFacebook() {
    return this.ffmpegService.stopStream('facebook');
  }

  listStreams() {
    return this.ffmpegService.listActive();
  }
}
