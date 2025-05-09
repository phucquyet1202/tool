// src/stream/stream.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { StreamService } from './stream.service';

@Controller('/stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get('/check-video')
  async checkVideo(
    @Query('videoUrl') videoUrl: string,
    @Query('platform') platform: string,
  ) {
    if (!videoUrl || !platform) {
      return { success: false, message: 'Thiếu videoUrl hoặc platform' };
    }

    return 1;
  }
  // YouTube
  @Post('/youtube/start')
  startYouTube(@Body() body: { videoUrl: string; rtmpUrl: string }) {
    return this.streamService.startYouTubeStream(body.videoUrl, body.rtmpUrl);
  }

  @Post('/youtube/stop')
  stopYouTube() {
    return this.streamService.stopYouTubeStream();
  }

  // Facebook
  @Post('/facebook/start')
  startFacebook(@Body() body: { videoUrl: string; rtmpUrl: string }) {
    return this.streamService.startFacebookStream(body.videoUrl, body.rtmpUrl);
  }

  @Post('/facebook/stop')
  stopFacebook() {
    return this.streamService.stopFacebookStream();
  }

  // TikTok (OBS)
  @Post('/tiktok/start')
  startTikTok(@Body() body: { videoUrl: string }) {
    return this.streamService.startTikTokStream(body.videoUrl);
  }

  @Post('/tiktok/stop')
  stopTikTok() {
    return this.streamService.stopTikTokStream();
  }
}
