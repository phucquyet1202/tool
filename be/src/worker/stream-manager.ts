// workers/stream-manager.ts
import { ChildProcessWithoutNullStreams } from 'child_process';
import { startPythonWorker } from './worker.service';
import { StreamPayload } from 'src/livestream/types/stream-payload.interface';
import treeKill from 'tree-kill';
import { ConflictException } from '@nestjs/common';

const runningProcesses = new Map<string, ChildProcessWithoutNullStreams>();

function getKey(userId: string, platform: string) {
  return `${userId}-${platform}`;
}

export function startStream(payload: StreamPayload): string {
  const key = getKey(payload.userId, payload.platform);

  if (runningProcesses.has(key)) {
    throw new ConflictException(
      `Đã có luồng chạy cho ${payload.platform} của ${payload.userId}, bạn không được phép thêm luồng live khác.`,
    );
  }

  const process = startPythonWorker(payload);

  process.stdout.on('data', (data) => console.log(`[${key}] stdout: ${data}`));
  process.stderr.on('data', (data) =>
    console.error(`[${key}] stderr: ${data}`),
  );
  process.on('exit', () => runningProcesses.delete(key));

  runningProcesses.set(key, process);

  return `✅ Bắt đầu phát cho ${payload.platform}`;
}

export function stopStream(userId: string, platform: string): string {
  const key = getKey(userId, platform);
  const proc = runningProcesses.get(key);

  if (!proc) return `⚠️ Không có luồng nào đang chạy`;

  const pid = proc.pid;

  if (!pid) {
    return `⚠️ Không thể xác định PID của tiến trình`;
  }

  treeKill(pid, 'SIGKILL', (err) => {
    if (err) {
      console.error(`[ERROR] Không thể dừng tiến trình ${pid}: ${err.message}`);
    } else {
      console.log(`[INFO] Đã dừng tiến trình ${pid} (${key})`);
    }
  });

  runningProcesses.delete(key);
  return `🛑 Đã gửi tín hiệu dừng phát cho ${platform}`;
}
