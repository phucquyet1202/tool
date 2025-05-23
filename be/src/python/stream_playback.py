import argparse
import json
import subprocess
import sys
import io
import yt_dlp
import shutil
import random

# Đảm bảo encode UTF-8 cho stdout/stderr trên Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def check_gstreamer():
    gst_path = shutil.which("gst-launch-1.0")
    if gst_path is None:
        print("[ERROR] Không tìm thấy gst-launch-1.0. Bạn đã cài GStreamer chưa?")
        sys.exit(1)
    return gst_path

def get_direct_url(youtube_url):
    try:
        ydl_opts = {
            'quiet': True,
            'format': 'best',
            'skip_download': True,
            'noplaylist': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
            return info['url'], info.get('ext', 'mp4')
    except Exception as e:
        print(f"[ERROR] Không lấy được URL từ: {youtube_url} - {e}")
        return None, None

def build_copy_command(gst_path, direct_url, rtmp_url):
    return [
        gst_path,
        'souphttpsrc', f'location={direct_url}', 'is-live=true', '!',
        'decodebin', '!',
        'video/x-h264', '!', 'queue', '!',
        'flvmux', 'streamable=true', 'name=mux', '!',
        'rtmpsink', f'location={rtmp_url}',
        'decodebin', '!', 'audioconvert', '!', 'voaacenc', 'bitrate=128000', '!', 'mux.'
    ]

def build_encode_command(gst_path, direct_url, rtmp_url):
    return [
        gst_path,
        'souphttpsrc', f'location={direct_url}', 'is-live=true', '!',
        'decodebin', 'name=d',

        'd.', '!', 'queue', '!', 'videoconvert', '!', 'videoscale', '!',
        'video/x-raw,width=1920,height=1080', '!',
        'x264enc',
            'bitrate=6000',
            'speed-preset=veryfast',
            'tune=zerolatency',
            'key-int-max=60',
        '!', 'video/x-h264,profile=baseline', '!',
        'flvmux', 'streamable=true', 'name=mux', '!',
        'rtmpsink', f'location={rtmp_url}',

        'd.', '!', 'queue', '!', 'audioconvert', '!',
        'voaacenc', 'bitrate=128000', '!',
        'mux.'
    ]

def run_gst_command(cmd):
    try:
        print(f"[DEBUG] Thử chạy: {' '.join(cmd)}")
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        for line in process.stdout:
            print(line.strip())
        process.wait()
        return process.returncode == 0
    except Exception as e:
        print(f"[ERROR] Khi chạy GStreamer: {e}")
        return False

def stream_video_with_fallback(gst_path, direct_url, rtmp_url):
    print(f"[INFO] Bắt đầu phát: {direct_url}")
    if run_gst_command(build_copy_command(gst_path, direct_url, rtmp_url)):
        print("[INFO] Phát bằng stream copy thành công.")
    else:
        print("[WARNING] Không thể stream copy, chuyển sang encode lại.")
        run_gst_command(build_encode_command(gst_path, direct_url, rtmp_url))

def main():
    gst_path = check_gstreamer()

    parser = argparse.ArgumentParser()
    parser.add_argument('--json', type=str, required=True, help="Chuỗi JSON chứa cấu hình phát video")
    args = parser.parse_args()

    try:
        config = json.loads(args.json)
    except Exception as e:
        print(f"[ERROR] JSON không hợp lệ: {e}")
        sys.exit(1)

    playlist = config.get('videoUrls', [])
    rtmp_url = config.get('rtmpUrl')
    loop = config.get('loopPlaylist', False)
    shuffle = config.get('shufflePlaylist', False)

    if not playlist or not rtmp_url:
        print("[ERROR] Thiếu videoUrls hoặc rtmpUrl")
        sys.exit(1)

    print(f"[INFO] Tổng video: {len(playlist)}, loop={loop}, shuffle={shuffle}")

    while True:
        current_list = playlist.copy()
        if shuffle:
            random.shuffle(current_list)

        for url in current_list:
            direct_url, ext = get_direct_url(url)
            if direct_url:
                stream_video_with_fallback(gst_path, direct_url, rtmp_url)
            else:
                print(f"[WARNING] Bỏ qua video không hợp lệ: {url}")

        if not loop:
            break

    print("[INFO] Phát xong tất cả video.")

if __name__ == "__main__":
    main()
