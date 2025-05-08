import { Injectable } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';
import { FfmpegGateway } from './ffmpeg.gateway';

@Injectable()
export class FfmpegService {
  private processes: Record<string, ffmpeg.FfmpegCommand> = {};

  constructor(private readonly ffmpegGateway: FfmpegGateway) {
    ffmpeg.setFfmpegPath(
      'D:/ffmpeg/ffmpeg-7.1.1-essentials_build/bin/ffmpeg.exe',
    );
  }

  private readonly ytDlpPath = 'D:/ffmpeg/yt-dlp.exe';

  private readonly platformAspectRatios: Record<string, string[]> = {
    youtube: ['16:9', '9:16', '1:1'],
    facebook: ['16:9', '9:16', '1:1'],
    tiktok: ['9:16'],
  };

  // Lấy direct stream URL bằng yt-dlp (không tải về)
  private getDirectStreamUrl(videoUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = spawn(this.ytDlpPath, ['-f', 'best', '-g', videoUrl]);

      let output = '';
      let errorOutput = '';

      // Lắng nghe output từ yt-dlp
      command.stdout.on('data', (data) => {
        output += data.toString();
      });

      command.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      // Nếu quá 10 giây chưa xong thì hủy
      const timer = setTimeout(() => {
        command.kill('SIGKILL'); // Hủy tiến trình
        reject('⏱️ yt-dlp timeout sau 10s.');
      }, 10000);

      // Khi tiến trình kết thúc
      command.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(`❌ yt-dlp error: ${errorOutput.trim()}`);
        }
      });
    });
  }

  // Start livestream không tải về (phát trực tiếp từ URL)
  async startLivestream(
    videoUrl: string,
    outputUrl: string,
    platform: string,
  ): Promise<void> {
    if (this.processes[platform]) {
      throw new Error(`Đã có livestream đang chạy cho nền tảng "${platform}".`);
    }

    const directUrl = await this.getDirectStreamUrl(videoUrl);

    const process = ffmpeg()
      .input(directUrl)
      .inputOptions('-re') // Đọc realtime từ network
      .inputOptions('-stream_loop', '-1') // Lặp vô hạn (chỉ có tác dụng nếu là file, nhưng để yên cũng ko sao)
      .videoCodec('libx264')
      .audioCodec('aac')
      .addOption('-preset', 'ultrafast')
      .addOption('-tune', 'zerolatency')
      .outputOptions('-f', 'flv')
      .output(outputUrl)
      .on('start', () => {
        console.log(`FFmpeg started for ${platform}`);
        this.ffmpegGateway.sendLog(platform, '🚀 Bắt đầu livestream');
        this.ffmpegGateway.sendStatus(platform, 'start');
      })
      .on('end', () => {
        delete this.processes[platform];
        this.ffmpegGateway.sendLog(platform, '✅ Livestream kết thúc');
        this.ffmpegGateway.sendStatus(platform, 'end');
      })
      .on('error', (err) => {
        console.error(`FFmpeg error for "${platform}": ${err.message}`);
        delete this.processes[platform];
        this.ffmpegGateway.sendLog(platform, `❌ Lỗi: ${err.message}`);
        this.ffmpegGateway.sendStatus(platform, 'error');
      });

    this.processes[platform] = process;
    process.run();
  }

  // Stop livestream
  stopLivestream(platform: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const process: any = this.processes[platform];
      if (!process) {
        return reject(
          `Không có livestream nào đang chạy cho nền tảng "${platform}".`,
        );
      }

      const ffmpegProc = process.ffmpegProc;
      if (ffmpegProc) {
        let resolved = false;

        ffmpegProc.on('close', () => {
          if (!resolved) {
            resolved = true;
            delete this.processes[platform];
            resolve(`Đã dừng livestream cho nền tảng "${platform}".`);
          }
        });

        if (ffmpegProc.stdin?.writable) {
          ffmpegProc.stdin.write('q');
        } else {
          ffmpegProc.kill('SIGINT');
        }

        setTimeout(() => {
          if (!resolved) {
            ffmpegProc.kill('SIGKILL');
            delete this.processes[platform];
            resolve(`Buộc dừng livestream "${platform}" sau timeout.`);
          }
        }, 3000);
      } else {
        delete this.processes[platform];
        resolve(`FFmpeg không tồn tại cho nền tảng "${platform}".`);
      }
    });
  }

  // Kiểm tra aspect ratio (không tải về, dùng ffprobe trên direct stream URL)
  async checkVideoAspectRatio(
    videoUrl: string,
    platform: string,
  ): Promise<{
    width: number;
    height: number;
    aspectRatio: string;
    valid: boolean;
    expectedAspectRatios: string[];
  }> {
    const expectedRatios = this.platformAspectRatios[platform.toLowerCase()];
    if (!expectedRatios)
      throw new Error(`Không hỗ trợ kiểm tra platform "${platform}".`);

    const directUrl = await this.getDirectStreamUrl(videoUrl);

    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(directUrl, (err, metadata) => {
        if (err) {
          console.error('FFprobe error:', err);
          return reject('Không lấy được thông tin video.');
        }

        const stream = metadata.streams.find((s) => s.codec_type === 'video');
        if (!stream) return reject('Không tìm thấy stream video.');

        const width = stream.width ?? 0;
        const height = stream.height ?? 0;
        const aspect = this.calculateAspectRatio(width, height);

        const valid = expectedRatios.some((r) => this.isApproxEqual(aspect, r));

        resolve({
          width,
          height,
          aspectRatio: aspect,
          valid,
          expectedAspectRatios: expectedRatios,
        });
      });
    });
  }

  private calculateAspectRatio(width: number, height: number): string {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const d = gcd(width, height);
    return `${width / d}:${height / d}`;
  }

  private isApproxEqual(actual: string, expected: string): boolean {
    const [aW, aH] = actual.split(':').map(Number);
    const [eW, eH] = expected.split(':').map(Number);
    const diff = Math.abs(aW / aH - eW / eH);
    return diff < (eW / eH) * 0.02;
  }
}
