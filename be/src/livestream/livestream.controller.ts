import { Controller, Post, Body } from '@nestjs/common';
import { LivestreamService } from './livestream.service';

@Controller('livestream')
export class LivestreamController {
  constructor(private readonly streamService: LivestreamService) {}

  // YouTube
  @Post('/youtube/start')
  startYouTube(
    @Body()
    body: {
      userId: string; // userId cần được truyền từ client
      videoUrls: string[];
      rtmpUrl: string;
      loopPlaylist: boolean;
      shufflePlaylist: boolean;
    },
  ) {
    return this.streamService.startPlatform(
      body.userId, // userId cần được truyền từ client
      'youtube',
      body.videoUrls,
      body.rtmpUrl,
      body.loopPlaylist,
      body.shufflePlaylist,
    );
  }

  @Post('/youtube/stop')
  stopYouTube(@Body() body: { userId: string }) {
    return this.streamService.stopPlatform(body.userId, 'youtube');
  }

  // Facebook
  @Post('/facebook/start')
  startFacebook(
    @Body()
    body: {
      userId: string; // userId cần được truyền từ client
      videoUrls: string[];
      rtmpUrl: string;
      loopPlaylist: boolean;
      shufflePlaylist: boolean;
    },
  ) {
    return this.streamService.startPlatform(
      body.userId, // userId cần được truyền từ client
      'facebook',
      body.videoUrls,
      body.rtmpUrl,
      body.loopPlaylist,
      body.shufflePlaylist,
    );
  }

  @Post('/facebook/stop')
  stopFacebook(@Body() body: { userId: string }) {
    return this.streamService.stopPlatform(body.userId, 'facebook');
  }

  // TikTok, Twitch... có thể thêm tương tự
}
