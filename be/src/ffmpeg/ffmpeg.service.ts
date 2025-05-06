import { Injectable } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { randomUUID } from 'crypto';
import { FfmpegGateway } from './ffmpeg.gateway';

type AspectRatioResult = {
  width: number;
  height: number;
  aspectRatio: string;
  valid: boolean;
  expectedAspectRatios: string[];
};

@Injectable()
export class FfmpegService {
  private processes: Record<string, ffmpeg.FfmpegCommand> = {};
  private loopCounts: Record<string, number> = {};

  constructor(private readonly ffmpegGateway: FfmpegGateway) {
    ffmpeg.setFfmpegPath(
      'D:/ffmpeg/ffmpeg-7.1.1-essentials_build/bin/ffmpeg.exe',
    );
  }

  private downloadVideo(videoUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const ytDlpPath = path.resolve('D:/ffmpeg/yt-dlp.exe');
      const outputPath = path.join(os.tmpdir(), `${randomUUID()}.mp4`);
      const command = `"${ytDlpPath}" -f bestvideo+bestaudio --merge-output-format mp4 -o "${outputPath}" "${videoUrl}"`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('yt-dlp error:', stderr || error.message);
          return reject('Không tải được video.');
        }
        resolve(outputPath);
      });
    });
  }

  async startLivestream(
    videoUrl: string,
    outputUrl: string,
    platform: string,
  ): Promise<void> {
    if (this.processes[platform]) {
      throw new Error(
        `Đã có một livestream đang chạy cho nền tảng "${platform}".`,
      );
    }
    //   try {
    //     const round = (this.loopCounts[platform] =
    //       (this.loopCounts[platform] || 0) + 1);
    //     this.ffmpegGateway.sendLog(platform, `🔁 Bắt đầu vòng phát ${round}`);
    //     this.ffmpegGateway.sendStatus(platform, 'start', round);

    //     const videoPath = await this.downloadVideo(videoUrl);

    //     const process = ffmpeg()
    //       .input(videoPath)
    //       .inputOptions('-re')
    //       .inputOptions('-stream_loop', '-1') // Vòng lặp video
    //       .videoCodec('libx264')
    //       .audioCodec('aac')
    //       .addOption('-preset', 'ultrafast')
    //       .addOption('-tune', 'zerolatency')
    //       .outputOptions('-f', 'flv')
    //       .output(outputUrl)
    //       .on('start', () => {
    //         console.log(`FFmpeg started for ${platform} | vòng ${round}`);
    //       })
    //       .on('end', async () => {
    //         this.ffmpegGateway.sendLog(
    //           platform,
    //           `✅ Kết thúc vòng ${round}, chuẩn bị phát lại`,
    //         );
    //         this.ffmpegGateway.sendStatus(platform, 'end', round);

    //         delete this.processes[platform];
    //         fs.rmSync(videoPath, { force: true });
    //         await loopStream(); // 🔁 Phát lại
    //       })
    //       .on('error', (err) => {
    //         this.ffmpegGateway.sendLog(
    //           platform,
    //           `❌ Lỗi vòng ${round}: ${err.message}`,
    //         );
    //         this.ffmpegGateway.sendStatus(platform, 'error', round);

    //         console.error(`FFmpeg error for "${platform}":`, err.message);
    //         delete this.processes[platform];
    //         fs.rmSync(videoPath, { force: true });
    //       });

    //     this.processes[platform] = process;
    //     process.run();
    //   } catch (err) {
    //     const msg =
    //       typeof err === 'string'
    //         ? err
    //         : 'Lỗi không xác định khi tải hoặc phát video';
    //     this.ffmpegGateway.sendLog(platform, `❌ ${msg}`);
    //     this.ffmpegGateway.sendStatus(platform, 'error');
    //     throw new Error(msg);
    //   }
    // };

    // await loopStream();
  }

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

  private readonly platformAspectRatios: Record<string, string[]> = {
    youtube: ['16:9', '9:16', '1:1'],
    facebook: ['16:9', '9:16', '1:1'],
    tiktok: ['9:16'],
  };

  async checkVideoAspectRatio(
    videoUrl: string,
    platform: string,
  ): Promise<AspectRatioResult> {
    const expectedRatios = this.platformAspectRatios[platform.toLowerCase()];
    if (!expectedRatios)
      throw new Error(`Không hỗ trợ kiểm tra platform "${platform}".`);

    const videoPath = await this.downloadVideo(videoUrl);

    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        fs.rmSync(videoPath, { force: true });

        if (err) {
          console.error('FFprobe error:', err);
          return reject('Không lấy được thông tin video.');
        }

        const videoStream = metadata.streams.find(
          (s) => s.codec_type === 'video',
        );
        if (!videoStream) return reject('Không tìm thấy stream video.');

        const width = videoStream.width ?? 0;
        const height = videoStream.height ?? 0;

        const gcd = (a: number, b: number): number =>
          b === 0 ? a : gcd(b, a % b);
        const d = gcd(width, height);
        const aspect = `${width / d}:${height / d}`;

        const valid = expectedRatios.some((expected) =>
          this.isApproxEqual(aspect, expected),
        );

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

  private isApproxEqual(actual: string, expected: string): boolean {
    const [aW, aH] = actual.split(':').map(Number);
    const [eW, eH] = expected.split(':').map(Number);
    const actualRatio = aW / aH;
    const expectedRatio = eW / eH;
    const diff = Math.abs(actualRatio - expectedRatio);
    return diff < expectedRatio * 0.02;
  }
}
