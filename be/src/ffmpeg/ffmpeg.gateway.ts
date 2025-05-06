// src/ffmpeg/ffmpeg.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class FfmpegGateway {
  @WebSocketServer()
  server: Server;

  sendLog(platform: string, message: string) {
    this.server.emit('ffmpeg-log', { platform, message });
  }

  sendStatus(
    platform: string,
    status: 'start' | 'end' | 'error',
    round?: number,
  ) {
    this.server.emit('ffmpeg-status', { platform, status, round });
  }
}
