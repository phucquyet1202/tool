import {
  Injectable,
  OnModuleDestroy,
  OnApplicationShutdown,
} from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';
import { FfmpegGateway } from './ffmpeg.gateway';

@Injectable()
export class FfmpegService implements OnModuleDestroy, OnApplicationShutdown {
  private processes: Record<string, ffmpeg.FfmpegCommand> = {};
  private readonly ytDlpPath = 'D:/ffmpeg/yt-dlp.exe';

  constructor(private readonly ffmpegGateway: FfmpegGateway) {
    ffmpeg.setFfmpegPath(
      'D:/ffmpeg/ffmpeg-7.1.1-essentials_build/bin/ffmpeg.exe',
    );
  }

  private runYtDlp(
    videoUrl: string,
    args: string[],
    timeoutMs = 30000,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = spawn(this.ytDlpPath, [...args, videoUrl]);
      let output = '';
      let errorOutput = '';

      const timer = setTimeout(() => {
        command.kill('SIGKILL');
        reject('yt-dlp timeout');
      }, timeoutMs);

      command.stdout.on('data', (data) => (output += data.toString()));
      command.stderr.on('data', (data) => (errorOutput += data.toString()));

      command.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(errorOutput.trim());
        }
      });
    });
  }

  private async isLive(videoUrl: string): Promise<boolean> {
    try {
      const json = await this.runYtDlp(videoUrl, ['-j'], 10000);
      const meta = JSON.parse(json);
      return !!meta.is_live;
    } catch {
      return false;
    }
  }

  async loopLivestreamUntilStopped(
    videoUrl: string,
    outputUrl: string,
    platform: string,
  ): Promise<void> {
    if (this.processes[platform]) {
      throw new Error(`Đã có stream đang chạy cho "${platform}"`);
    }

    let stopped = false;

    const stopCheck = () =>
      new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (!this.processes[platform]) {
            stopped = true;
            clearInterval(interval);
            resolve();
          }
        }, 1000);
      });

    const streamOnce = async () => {
      try {
        const directUrl = await this.runYtDlp(
          videoUrl,
          ['-f', 'best', '-g'],
          30000,
        );

        const command = ffmpeg()
          .input(directUrl)
          .inputOptions(['-re'])
          .videoCodec('libx264')
          .audioCodec('aac')
          .addOption('-preset', 'ultrafast')
          .inputOptions(['-stream_loop', '-1'])
          .outputOptions([
            '-f flv',
            '-g 120',
            '-keyint_min 30',
            '-sc_threshold 0',
            '-b:v 2500k',
            '-maxrate 2500k',
            '-bufsize 5000k',
            '-pix_fmt yuv420p',
            '-threads 2',
          ])
          .output(outputUrl)
          .on('start', () => {
            this.ffmpegGateway.sendLog(platform, '🚀 Bắt đầu stream');
            this.ffmpegGateway.sendStatus(platform, 'start');
          })
          .on('stderr', (line) => {
            this.ffmpegGateway.sendLog(platform, `📄 FFmpeg stderr: ${line}`);
          })
          .on('end', () => {
            this.ffmpegGateway.sendLog(platform, '✅ FFmpeg đã kết thúc');
            this.ffmpegGateway.sendStatus(platform, 'end');
          })
          .on('error', (err) => {
            this.ffmpegGateway.sendLog(
              platform,
              `❌ Lỗi FFmpeg: ${err.message}`,
            );
            this.ffmpegGateway.sendStatus(platform, 'error');
          });

        this.processes[platform] = command;
        command.run();

        await stopCheck();
        this.ffmpegGateway.sendLog(platform, '✅ streamOnce kết thúc');
      } catch (err) {
        this.ffmpegGateway.sendLog(platform, `❌ Lỗi trong streamOnce: ${err}`);
        await new Promise((res) => setTimeout(res, 5000));
      }
    };

    const loop = async () => {
      while (!stopped) {
        try {
          const currentIsLive = await this.isLive(videoUrl);
          await streamOnce();

          if (!currentIsLive && !stopped) {
            this.ffmpegGateway.sendLog(platform, '🔁 Lặp lại streamOnce');
            await new Promise((res) => setTimeout(res, 2000));
          } else {
            break; // livestream thì chỉ phát 1 lần
          }
        } catch (err) {
          this.ffmpegGateway.sendLog(platform, `❌ Lỗi trong loop: ${err}`);
          await new Promise((res) => setTimeout(res, 5000));
        }
      }

      this.ffmpegGateway.sendLog(platform, `🛑 Dừng stream "${platform}"`);
      delete this.processes[platform];
    };

    loop();
  }

  stopLivestream(platform: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const process: any = this.processes[platform];
      if (!process) return reject(`Không có stream "${platform}"`);

      const ffmpegProc = process.ffmpegProc;
      let resolved = false;

      if (ffmpegProc?.stdin?.writable) {
        ffmpegProc.stdin.write('q');
      } else {
        ffmpegProc?.kill?.('SIGINT');
      }

      ffmpegProc?.on('close', () => {
        if (!resolved) {
          resolved = true;
          resolve(`Đã dừng stream "${platform}"`);
        }
      });

      setTimeout(() => {
        if (!resolved) {
          ffmpegProc?.kill?.('SIGKILL');
          resolve(`Buộc dừng stream "${platform}" sau timeout`);
        }
      }, 3000);
    });
  }

  onModuleDestroy() {
    console.log('🛑 App đang tắt');
    for (const platform of Object.keys(this.processes)) {
      this.stopLivestream(platform);
    }
  }

  onApplicationShutdown(signal: string) {
    console.log(`🛑 App shutdown (${signal})`);
    for (const platform of Object.keys(this.processes)) {
      this.stopLivestream(platform);
    }
  }

  listActiveLivestreams() {
    return Object.keys(this.processes);
  }

  async stopAllLivestreams(): Promise<string[]> {
    const platforms = Object.keys(this.processes);
    const results = await Promise.allSettled(
      platforms.map((p) => this.stopLivestream(p)),
    );
    return results.map((r) =>
      r.status === 'fulfilled' ? r.value : `Lỗi: ${r.reason}`,
    );
  }
}
