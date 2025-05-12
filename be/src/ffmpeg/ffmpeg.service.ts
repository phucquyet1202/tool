// src/ffmpeg/ffmpeg.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Worker } from 'worker_threads';
import { join } from 'path';

@Injectable()
export class FfmpegService implements OnModuleDestroy {
  private workers: Record<string, Worker> = {};
  private readonly ytDlpPath = 'D:/ffmpeg/yt-dlp.exe';
  private readonly ffmpegPath =
    'D:/ffmpeg/ffmpeg-7.1.1-essentials_build/bin/ffmpeg.exe';

  private maxWorkers = 5; // Giới hạn worker tối đa

  startStream(videoUrl: string, outputUrl: string, platform: string) {
    if (Object.keys(this.workers).length >= this.maxWorkers) {
      throw new Error('Đã đạt số lượng worker tối đa');
    }

    if (this.workers[platform]) {
      throw new Error(`Stream "${platform}" đang chạy`);
    }

    const worker = new Worker(join(__dirname, 'ffmpeg.worker.js'), {
      workerData: {
        videoUrl,
        outputUrl,
        platform,
        ytDlpPath: this.ytDlpPath,
        ffmpegPath: this.ffmpegPath,
      },
    });

    worker.on('message', (msg) => {
      console.log(`[${platform}] ${msg.log}`);
    });

    worker.on('exit', (code) => {
      delete this.workers[platform];
      console.log(`[${platform}] Worker exited (${code})`);
    });

    worker.on('error', (err) => {
      delete this.workers[platform];
      console.log(`[${platform}] Worker error: ${err.message}`);
    });

    this.workers[platform] = worker;
  }

  stopStream(platform: string) {
    const worker = this.workers[platform];
    if (!worker) throw new Error(`Không có stream "${platform}"`);
    worker.postMessage('stop');
  }

  listActive() {
    return Object.keys(this.workers);
  }

  async onModuleDestroy() {
    for (const platform of Object.keys(this.workers)) {
      this.stopStream(platform);
    }
  }
}
