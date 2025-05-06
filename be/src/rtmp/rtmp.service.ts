// src/rtmp/rtmp.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import NodeMediaServer from 'node-media-server';

@Injectable()
export class RtmpService implements OnModuleInit {
  private nms: NodeMediaServer;

  onModuleInit() {
    const config = {
      logType: 2,
      rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 60,
        ping_timeout: 30,
      },
      http: {
        mediaroot: './media',
        port: 8000,
        allow_origin: '*',
      },
      trans: {
        ffmpeg: '/usr/bin/ffmpeg', // hoặc path ffmpeg Windows nếu dùng Windows
        tasks: [],
      },
    };

    this.nms = new NodeMediaServer(config);
    this.nms.run();

    console.log('✅ RTMP server đã chạy tại: rtmp://localhost/live/stream');
  }
}
