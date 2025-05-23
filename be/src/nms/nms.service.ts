import { Injectable, Logger } from '@nestjs/common';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

interface NmsInstance {
  process: ChildProcessWithoutNullStreams;
  rtmpPort: number;
  httpPort: number;
}

@Injectable()
export class NmsManagerService {
  private readonly logger = new Logger('NmsManager');
  private readonly instances = new Map<string, NmsInstance>();
  private readonly usedPorts = new Set<number>();
  private readonly baseRtmpPort = 1935;
  private readonly portStep = 10;

  private getFreePort(start: number): number {
    let port = start;
    while (this.usedPorts.has(port)) port += this.portStep;
    this.usedPorts.add(port);
    return port;
  }

  start(userId: string): string {
    if (this.instances.has(userId)) {
      this.logger.warn(`NMS for user ${userId} is already running.`);
      return this.getRtmpUrl(userId)!;
    }

    const rtmpPort = this.getFreePort(this.baseRtmpPort);
    const httpPort = this.getFreePort(rtmpPort + 1);

    const config = {
      logType: 3,
      rtmp: {
        port: rtmpPort,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
      },
      http: {
        port: httpPort,
        mediaroot: './media',
        allow_origin: '*',
      },
      trans: {
        ffmpeg: process.env.FFMPEG_PATH || 'D:/ffmpeg/ffmpeg.exe',
        tasks: [
          {
            app: 'live',
            hls: true,
            hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
            dash: false,
          },
        ],
      },
    };

    const configPath = path.resolve(
      __dirname,
      `../../nms-configs/nms-${userId}.json`,
    );
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    const cliPath = path.resolve(
      __dirname,
      '../../node_modules/node-media-server/bin/app.js',
    );
    const proc = spawn('node', [cliPath, '-c', configPath]);

    proc.stdout.on('data', (data) =>
      this.logger.log(`[${userId}] ${data.toString().trim()}`),
    );
    proc.stderr.on('data', (data) =>
      this.logger.error(`[${userId}] ${data.toString().trim()}`),
    );
    proc.on('close', (code) => {
      this.logger.warn(`[${userId}] NMS exited with code ${code}`);
      this.instances.delete(userId);
    });
    proc.on('error', (err) =>
      this.logger.error(`[${userId}] NMS error: ${err.message}`),
    );

    this.instances.set(userId, { process: proc, rtmpPort, httpPort });
    return `rtmp://localhost:${rtmpPort}/live`;
  }

  stop(userId: string) {
    const instance = this.instances.get(userId);
    if (instance) {
      instance.process.kill();
      this.logger.log(`Stopped NMS for user ${userId}`);
      this.usedPorts.delete(instance.rtmpPort);
      this.usedPorts.delete(instance.httpPort);
      this.instances.delete(userId);
    }
  }

  isRunning(userId: string): boolean {
    return this.instances.has(userId);
  }

  getRtmpUrl(userId: string): string | null {
    const instance = this.instances.get(userId);
    return instance ? `rtmp://localhost:${instance.rtmpPort}/live` : null;
  }

  getHttpPort(userId: string): number | null {
    const instance = this.instances.get(userId);
    return instance ? instance.httpPort : null;
  }
}
