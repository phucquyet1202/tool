// nest-app/src/livestream/types/stream-payload.interface.ts
export interface StreamPayload {
  userId: string;
  platform: string;
  videoUrls: string[];
  rtmpUrl: string;
  loopPlaylist: boolean;
  shufflePlaylist: boolean;
}
