// workers/worker.service.ts
//  tạo subprocess gọi Python
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { StreamPayload } from 'src/livestream/types/stream-payload.interface';

export function startPythonWorker(
  payload: StreamPayload,
): ChildProcessWithoutNullStreams {
  const jsonString = JSON.stringify(payload);

  const child = spawn('py', [
    'D:/tool/be/src/python/stream_playback.py',
    '--json',
    jsonString,
  ]);

  return child;
}
