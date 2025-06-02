// workers/stream-manager.ts
import { ChildProcessWithoutNullStreams } from 'child_process';
import { startPythonWorker } from './worker.service';
import { StreamPayload } from 'src/livestream/types/stream-payload.interface';
import treeKill from 'tree-kill';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const VALID_PLATFORMS = ['youtube', 'facebook', 'tiktok'] as const;
type Platform = (typeof VALID_PLATFORMS)[number];

const runningProcesses = new Map<string, ChildProcessWithoutNullStreams>();
const prisma = new PrismaService(); // Nếu bạn inject qua constructor thì bỏ dòng này đi.

function getKey(userId: string, platform: string) {
  return `${userId}-${platform}`;
}

// ✅ Hàm cập nhật status
async function updatePlatformStatus(
  userId: string,
  platform: string,
  status: boolean,
) {
  if (!VALID_PLATFORMS.includes(platform as Platform)) {
    console.warn(`[WARN] Platform không hợp lệ: ${platform}`);
    return;
  }

  const field =
    platform === 'youtube'
      ? 'status_yt'
      : platform === 'facebook'
        ? 'status_fb'
        : 'status_tt';
  await prisma.user.update({
    where: { id: userId },
    data: { [field]: status },
  });
}

// ✅ Bắt đầu stream
export async function startStream(payload: StreamPayload): Promise<string> {
  const { userId, platform } = payload;
  const key = getKey(userId, platform);

  if (!VALID_PLATFORMS.includes(platform as Platform)) {
    throw new BadRequestException('Platform không hợp lệ');
  }

  if (runningProcesses.has(key)) {
    throw new ConflictException(
      `Đã có luồng chạy cho ${platform} của ${userId}, bạn không được phép thêm luồng khác.`,
    );
  }

  const process = startPythonWorker(payload);

  process.stdout.on('data', (data) => console.log(`[${key}] stdout: ${data}`));
  process.stderr.on('data', (data) =>
    console.error(`[${key}] stderr: ${data}`),
  );
  process.on('exit', () => runningProcesses.delete(key));

  runningProcesses.set(key, process);

  // ✅ Cập nhật trạng thái
  await updatePlatformStatus(userId, platform, true);

  return `✅ Bắt đầu phát cho ${platform}`;
}

// ✅ Dừng stream
export async function stopStream(
  userId: string,
  platform: string,
): Promise<string> {
  const key = getKey(userId, platform);

  if (!VALID_PLATFORMS.includes(platform as Platform)) {
    return `⚠️ Platform không hợp lệ`;
  }

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

  // ✅ Cập nhật trạng thái
  await updatePlatformStatus(userId, platform, false);

  return `🛑 Đã gửi tín hiệu dừng phát cho ${platform}`;
}
