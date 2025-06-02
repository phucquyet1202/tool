// nest-app/src/livestream/livestream.service.ts
import { Injectable } from '@nestjs/common';
import { StreamPayload } from './types/stream-payload.interface';
import { startStream, stopStream } from 'src/worker/stream-manager';

@Injectable()
export class LivestreamService {
  startPlatform(
    userId: string,
    platform: string,
    videoUrls: string[],
    rtmpUrl: string,
    loopPlaylist: boolean,
    shufflePlaylist: boolean,
  ) {
    const payload: StreamPayload = {
      userId,
      platform,
      videoUrls,
      rtmpUrl,
      loopPlaylist,
      shufflePlaylist,
    };
    return startStream(payload);
  }

  stopPlatform(userId: string, platform: string) {
    return stopStream(userId, platform);
  }
}
