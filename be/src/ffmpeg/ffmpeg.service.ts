// src/ffmpeg/ffmpeg.service.ts
import { Injectable } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import { exec } from 'child_process';
import * as path from 'path';

@Injectable()
export class FfmpegService {
  private processes: Record<string, ffmpeg.FfmpegCommand> = {};

  constructor() {
    ffmpeg.setFfmpegPath(
      'D:/ffmpeg/ffmpeg-7.1.1-essentials_build/bin/ffmpeg.exe',
    );
  }

  private getDirectStreamUrls(videoUrl: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const ytDlpPath = path.resolve('D:/ffmpeg/yt-dlp.exe');
      const command = `"${ytDlpPath}" -f bestvideo+bestaudio -g "${videoUrl}"`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('yt-dlp error:', stderr || error.message);
          return reject('Không lấy được link trực tiếp từ YouTube.');
        }

        const lines = stdout.trim().split('\n');
        if (lines.length < 2) {
          return reject('Không tìm thấy đủ link video/audio từ yt-dlp.');
        }

        resolve(lines);
      });
    });
  }

  async startLivestream(
    videoUrl: string,
    outputUrl: string,
    platform: string,
  ): Promise<any> {
    if (this.processes[platform]) {
      throw new Error(
        `Đã có một livestream đang chạy cho nền tảng "${platform}".`,
      );
    }

    try {
      const [videoStreamUrl, audioStreamUrl] =
        await this.getDirectStreamUrls(videoUrl);

      return new Promise((resolve, reject) => {
        const process = ffmpeg()
          .addInput(videoStreamUrl)
          .addInputOption('-re') // Điều chỉnh tốc độ đọc video theo thời gian thực
          .addInput(audioStreamUrl)
          .addInputOption('-re') // Điều chỉnh tốc độ đọc âm thanh theo thời gian thực
          .inputOptions('-stream_loop', '-1') // Lặp lại video/audio vô hạn
          .videoCodec('libx264') // Mã hóa video
          .audioCodec('aac') // Mã hóa âm thanh
          .addOption('-preset', 'ultrafast') // Cấu hình tốc độ mã hóa
          .addOption('-tune', 'zerolatency') // Tối ưu cho độ trễ thấp
          .format('flv') // Định dạng video đầu ra
          .output(outputUrl) // URL RTMP của nền tảng
          .on('start', (commandLine) => {
            console.log(
              `FFmpeg process started for "${platform}":`,
              // commandLine,
            );
          })
          .on('end', () => {
            console.log(`FFmpeg process ended for "${platform}"`);
            delete this.processes[platform];
            resolve(`Livestream kết thúc cho nền tảng "${platform}"`);
          })
          .on('error', (err) => {
            console.error(`FFmpeg error for "${platform}":`, err);
            delete this.processes[platform];
            reject(`Lỗi livestream cho nền tảng "${platform}"`);
          });
        // .on('stderr', (stderrLine) => {
        //   console.log(`FFmpeg stderr: ${stderrLine}`);
        // });

        this.processes[platform] = process;
        process.run();
      });
    } catch (err) {
      throw new Error(
        typeof err === 'string' ? err : 'Lỗi khi lấy link YouTube',
      );
    }
  }

  stopLivestream(platform: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const process: any = this.processes[platform];
      if (!process) {
        return reject(
          `Không có livestream nào đang chạy cho nền tảng "${platform}".`,
        );
      }

      const ffmpegProc = process.ffmpegProc; // 🟢 Sửa chỗ này
      if (ffmpegProc) {
        let resolved = false;

        ffmpegProc.on('close', (code: number) => {
          console.log(
            `FFmpeg process for "${platform}" closed with code:`,
            code,
          );
          if (!resolved) {
            resolved = true;
            delete this.processes[platform];
            resolve(`Đã dừng livestream cho nền tảng "${platform}"`);
          }
        });

        if (ffmpegProc.stdin?.writable) {
          ffmpegProc.stdin.write('q'); // Gửi lệnh "quit" cho ffmpeg
        } else {
          ffmpegProc.kill('SIGINT'); // fallback nếu stdin không khả dụng
        }

        // Timeout: Nếu sau 5s chưa close -> force kill
        setTimeout(() => {
          if (!resolved) {
            console.warn(`FFmpeg for "${platform}" không phản hồi, buộc dừng.`);
            ffmpegProc.kill('SIGKILL');
            delete this.processes[platform];
            resolve(`Buộc dừng livestream "${platform}" sau timeout`);
          }
        }, 2000);
      } else {
        delete this.processes[platform];
        resolve(`FFmpeg process không tồn tại cho nền tảng "${platform}"`);
      }
    });
  }
}
