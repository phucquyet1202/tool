import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  SetMetadata,
} from '@nestjs/common';
import { LivestreamService } from './livestream.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LivestreamExpirationGuard } from 'src/auth/livestream-expiration.guard';

@Controller('livestream')
export class LivestreamController {
  constructor(private readonly streamService: LivestreamService) {}

  // YouTube
  @SetMetadata('platform', 'YOUTUBE')
  @UseGuards(
    JwtAuthGuard,
    // LivestreamExpirationGuard
  )
  @Post('/youtube/start')
  startYouTube(
    @Body()
    body: {
      videoUrls: string[];
      rtmpUrl: string;
      loopPlaylist: boolean;
      shufflePlaylist: boolean;
    },
    @Request() req: Request & { user?: { id: string } }, // Lấy userId từ request với kiểu an toàn
  ) {
    return this.streamService.startPlatform(
      req.user?.id ?? '', // Lấy userId từ token đã được xác thực, đảm bảo truyền string
      'youtube',
      body.videoUrls,
      body.rtmpUrl,
      body.loopPlaylist,
      body.shufflePlaylist,
    );
  }
  @SetMetadata('platform', 'YOUTUBE')
  @UseGuards(
    JwtAuthGuard,
    // LivestreamExpirationGuard
  )
  @Post('/youtube/stop')
  stopYouTube(@Request() req: Request & { user?: { id: string } }) {
    return this.streamService.stopPlatform(req.user?.id ?? '', 'youtube');
  }

  // Facebook
  @SetMetadata('platform', 'FACEBOOK')
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
    @Request() req: Request & { user?: { id: string } }, // Lấy userId từ request với kiểu an toàn
  ) {
    return this.streamService.startPlatform(
      req.user?.id ?? '', // đảm bảo truyền string
      'facebook',
      body.videoUrls,
      body.rtmpUrl,
      body.loopPlaylist,
      body.shufflePlaylist,
    );
  }

  @SetMetadata('platform', 'FACEBOOK')
  @UseGuards(JwtAuthGuard, LivestreamExpirationGuard)
  @Post('/facebook/stop')
  stopFacebook(@Request() req: Request & { user?: { id: string } }) {
    return this.streamService.stopPlatform(req.user?.id ?? '', 'facebook');
  }

  // TikTok, Twitch... có thể thêm tương tự
}
