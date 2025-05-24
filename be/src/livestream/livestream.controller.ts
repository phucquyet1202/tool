import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { LivestreamService } from './livestream.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LivestreamExpirationGuard } from 'src/auth/livestream-expiration.guard';

@Controller('livestream')
export class LivestreamController {
  constructor(private readonly streamService: LivestreamService) {}

  // YouTube
  // @UseGuards(JwtAuthGuard, LivestreamExpirationGuard)
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
  @UseGuards(JwtAuthGuard, LivestreamExpirationGuard)
  @Post('/youtube/stop')
  stopYouTube(@Body() body: { userId: string }) {
    return this.streamService.stopPlatform(body.userId, 'youtube');
  }

  // Facebook
  @UseGuards(JwtAuthGuard, LivestreamExpirationGuard)
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

  @UseGuards(JwtAuthGuard, LivestreamExpirationGuard)
  @Post('/facebook/stop')
  stopFacebook(@Body() body: { userId: string }) {
    return this.streamService.stopPlatform(body.userId, 'facebook');
  }

  // TikTok, Twitch... có thể thêm tương tự
}
