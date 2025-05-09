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
  private processes: Record<string, { ffmpeg: ffmpeg.FfmpegCommand }> = {};
  private readonly ytDlpPath = 'D:/ffmpeg/yt-dlp.exe';

  constructor(private readonly ffmpegGateway: FfmpegGateway) {
    ffmpeg.setFfmpegPath(
      'D:/ffmpeg/ffmpeg-7.1.1-essentials_build/bin/ffmpeg.exe',
    );
  }

  private async runYtDlp(
    videoUrl: string,
    args: string[] = [],
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
      console.log(meta.is_live);
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
    this.isLive(videoUrl);
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
        const isLiveStream = await this.isLive(videoUrl); // Define isLiveStream
        const directUrl = await this.runYtDlp(videoUrl, ['-f', 'best', '-g']);

        const command = ffmpeg()
          .input(directUrl)
          .inputOptions(['-re', '-fflags +genpts']); // Phát video với tốc độ thực

        // 👉 Chỗ thêm / bỏ stream_loop tùy theo isLiveStream
        if (isLiveStream == false) {
          command.inputOptions(['-stream_loop', '-1']); // Lặp lại video khi không phải livestream
        }

        command
          .inputOptions(['-reconnect', '1', '-reconnect_streamed', '1'])
          .inputOptions(['-reconnect_delay_max', '5']) // Thời gian tối đa để kết nối lại
          .inputOptions(['-reconnect_at_eof', '1']) // Kết nối lại khi video kết thúc
          .addOption('-tune', 'zerolatency') // Tối ưu hóa cho độ trễ thấp
          .videoCodec('libx264')
          .audioCodec('aac')
          .addOption('-preset', 'ultrafast')
          .outputOptions([
            '-f flv',
            '-g 60',
            '-keyint_min 30',
            '-sc_threshold 0',
            '-b:v 2500k',
            '-maxrate 2500k',
            '-bufsize 5000k',
            '-pix_fmt yuv420p',
            '-threads 2',
            '-r 30',
            '-flush_packets',
            '1', // Đẩy gói dữ liệu nhanh hơn
            '-muxdelay',
            '0',
            '-s 1280x720', // Thay đổi kích thước video
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
            this.ffmpegGateway.sendLog(
              platform,
              '🧪 Xóa process để chuẩn bị lặp lại',
            );
            delete this.processes[platform]; // 🔧 Cho phép loop chạy tiếp
            this.ffmpegGateway.sendStatus(platform, 'end');
          })
          .on('error', (err) => {
            this.ffmpegGateway.sendLog(
              platform,
              `❌ Lỗi FFmpeg: ${err.message}`,
            );
            this.ffmpegGateway.sendLog(
              platform,
              '🧪 Xóa process do lỗi để lặp lại',
            );
            delete this.processes[platform]; // 🔧 Quan trọng
            this.ffmpegGateway.sendStatus(platform, 'error');
          });

        this.processes[platform] = { ffmpeg: command };

        command.run();

        await stopCheck(); // Sẽ resolve sau khi process bị xoá
      } catch (err) {
        this.ffmpegGateway.sendLog(platform, `❌ Lỗi trong streamOnce: ${err}`);
        await new Promise((res) => setTimeout(res, 5000));
      }
    };

    const loop = async () => {
      while (!stopped) {
        await streamOnce();

        if (!stopped) {
          this.ffmpegGateway.sendLog(platform, '🔁 Lặp lại stream sau 2 giây');
          await new Promise((res) => setTimeout(res, 2000));
        }
      }

      this.ffmpegGateway.sendLog(platform, `🛑 Dừng stream "${platform}"`);
      delete this.processes[platform];
    };

    loop();
  }

  async stopLivestream(platform: string): Promise<string> {
    const processEntry = this.processes[platform];
    if (!processEntry) {
      return Promise.reject(`Không có stream "${platform}"`);
    }

    const { ffmpeg } = processEntry;

    return new Promise((resolve) => {
      let resolved = false;

      try {
        ffmpeg.kill('SIGINT');
      } catch (error) {
        this.ffmpegGateway.sendLog(
          platform,
          `❌ Error stopping FFmpeg: ${error.message}`,
        );
      }

      ffmpeg?.on('end', () => {
        if (!resolved) {
          resolved = true;
          delete this.processes[platform];
          resolve(`✅ Đã dừng stream "${platform}"`);
        }
      });

      // Fallback kill
      setTimeout(() => {
        if (!resolved) {
          ffmpeg?.kill?.('SIGKILL');
          delete this.processes[platform];
          resolve(`⚠️ Buộc dừng stream "${platform}"`);
        }
      }, 3000);
    });
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

  listActiveLivestreams() {
    return Object.keys(this.processes);
  }

  onModuleDestroy() {
    for (const platform of Object.keys(this.processes)) {
      this.stopLivestream(platform);
    }
  }

  onApplicationShutdown(signal: string) {
    for (const platform of Object.keys(this.processes)) {
      this.stopLivestream(platform);
    }
  }
}
