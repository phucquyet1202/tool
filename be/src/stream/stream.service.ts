// src/stream/stream.service.ts
import { Injectable } from '@nestjs/common';
import { FfmpegService } from '../ffmpeg/ffmpeg.service';
import OBSWebSocket from 'obs-websocket-js';

@Injectable()
export class StreamService {
  private obsWebSocket = new OBSWebSocket();

  constructor(private readonly ffmpegService: FfmpegService) {}

  // YouTube
  startYouTubeStream(videoUrl: string, rtmpUrl: string) {
    return this.ffmpegService.startLivestream(videoUrl, rtmpUrl, 'youtube');
  }

  stopYouTubeStream() {
    return this.ffmpegService.stopLivestream('youtube');
  }

  // Facebook
  startFacebookStream(videoUrl: string, rtmpUrl: string) {
    return this.ffmpegService.startLivestream(videoUrl, rtmpUrl, 'facebook');
  }

  stopFacebookStream() {
    return this.ffmpegService.stopLivestream('facebook');
  }

  // TikTok (via OBS VirtualCam)
  async startTikTokStream(videoUrl: string) {
    try {
      await this.obsWebSocket.connect('ws://127.0.0.1:4455');

      await this.obsWebSocket.call('SetInputSettings', {
        inputName: 'VideoSource', // tên chính xác của Media Source trong OBS
        inputSettings: { local_file: videoUrl },
      });

      await this.obsWebSocket.call('StartVirtualCam');

      return { message: 'Đã bật TikTok stream (OBS VirtualCam)' };
    } catch (error) {
      return { message: `Lỗi OBS: ${error.message}` };
    }
  }

  async stopTikTokStream() {
    try {
      await this.obsWebSocket.call('StopVirtualCam');
      await this.obsWebSocket.disconnect();
      return { message: 'Đã dừng TikTok stream (OBS VirtualCam)' };
    } catch (error) {
      return { message: `Lỗi OBS: ${error.message}` };
    }
  }

  // // Tổng hợp
  // listAllActiveStreams() {
  //   return this.ffmpegService.listActiveLivestreams();
  // }

  // stopAllStreams() {
  //   return this.ffmpegService.stopAllLivestreams();
  // }
}
