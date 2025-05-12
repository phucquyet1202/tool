// src/ffmpeg/ffmpeg.worker.ts
import { parentPort, workerData } from 'worker_threads';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';

ffmpeg.setFfmpegPath(workerData.ffmpegPath);
const ytDlpPath = workerData.ytDlpPath;

const { videoUrl, outputUrl, platform } = workerData;

let command: ffmpeg.FfmpegCommand | null = null;

// Hàm chạy yt-dlp với cơ chế retry
async function runYtDlpWithRetry(
  args: string[],
  retries = 3,
  timeoutMs = 10000,
): Promise<string> {
  let lastError = '';
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await runYtDlp(args, timeoutMs);
    } catch (error) {
      lastError = error as string;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait before retry
      }
    }
  }
  throw new Error(lastError);
}

function runYtDlp(args: string[], timeoutMs = 10000): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ytDlpPath, [...args, videoUrl]);
    let output = '';
    let error = '';

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      reject('yt-dlp timeout');
    }, timeoutMs);

    proc.stdout.on('data', (d) => (output += d.toString()));
    proc.stderr.on('data', (d) => (error += d.toString()));

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(output.trim());
      else reject(error.trim());
    });
  });
}

async function isLive(): Promise<boolean> {
  try {
    const json = await runYtDlpWithRetry(['-j']);
    const meta = JSON.parse(json);
    return !!meta.is_live;
  } catch {
    return false;
  }
}

async function streamLoop() {
  parentPort?.postMessage({ log: `🚀 Bắt đầu stream ${platform}` });

  while (true) {
    try {
      const live = await isLive();
      const directUrl = await runYtDlpWithRetry(['-f', 'best', '-g']);

      command = ffmpeg()
        .input(directUrl)
        .inputOptions(['-re', '-fflags +genpts'])
        .inputOptions([
          '-reconnect',
          '1',
          '-reconnect_streamed',
          '1',
          '-reconnect_delay_max',
          '5',
          '-reconnect_at_eof',
          '1',
        ])
        .addOption('-tune', 'zerolatency')
        .videoCodec('libx264')
        .audioCodec('aac')
        .videoFilters('scale=1920:1080:flags=bicubic')
        .addOption('-preset', 'superfast')
        .addOption('-profile:v', 'high')
        .addOption('-x264opts', 'slice-max-size=1500')
        .outputOptions([
          '-f',
          'flv',
          '-g',
          '60',
          '-keyint_min',
          '30',
          '-sc_threshold',
          '0',
          '-b:v',
          '6000k',
          '-maxrate',
          '6800k',
          '-bufsize',
          '8000k',
          '-pix_fmt',
          'yuv420p',
          '-threads',
          '2',
          '-r',
          '30',
          '-flush_packets',
          '1',
          '-muxdelay',
          '0',
          '-s',
          '1920x1080',
        ])
        .output(outputUrl)
        .on('start', () => {
          parentPort?.postMessage({ log: '▶️ FFmpeg started' });
        })

        .on('end', () => {
          parentPort?.postMessage({ log: '✅ FFmpeg ended' });
        })
        .on('error', (err) => {
          parentPort?.postMessage({ log: `❌ FFmpeg error: ${err.message}` });
        });

      if (!live) {
        command.inputOptions(['-stream_loop', '-1']);
      }

      command.run();

      await new Promise((res) => {
        command?.on('end', res);
        command?.on('error', res);
      });
    } catch (err) {
      parentPort?.postMessage({ log: `❌ streamOnce error: ${err}` });
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}

parentPort?.on('message', (msg) => {
  if (msg === 'stop' && command) {
    command.kill('SIGINT');
    parentPort?.postMessage({ log: '🛑 Worker stopped' });
    process.exit(0);
  }
});

streamLoop();
