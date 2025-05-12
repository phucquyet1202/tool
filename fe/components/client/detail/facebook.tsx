"use client";
import { Input, Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Hàm kiểm tra URL hợp lệ
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function LiveDetaiFaceBooklPage() {
  const router = useRouter();

  const [videoUrl, setVideoUrl] = useState("");
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [errors, setErrors] = useState({ videoUrl: "", rtmpUrl: "" });

  const handleSubmit = () => {
    let newErrors = { videoUrl: "", rtmpUrl: "" };
    let isValid = true;

    if (!isValidUrl(videoUrl)) {
      newErrors.videoUrl = "Link video không hợp lệ";
      isValid = false;
    }

    if (!isValidUrl(rtmpUrl)) {
      newErrors.rtmpUrl = "Link RTMP không hợp lệ";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      console.log("Phát live Facebook với:", { videoUrl, rtmpUrl });
      // Thực hiện hành động phát live tại đây
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <Input
        label="URL Video Facebook"
        placeholder="Nhập link video Facebook muốn livestream"
        fullWidth
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        isInvalid={!!errors.videoUrl}
        errorMessage={errors.videoUrl}
      />
      <Input
        label="RTMP Output"
        placeholder="Nhập link RTMP output"
        fullWidth
        value={rtmpUrl}
        onChange={(e) => setRtmpUrl(e.target.value)}
        isInvalid={!!errors.rtmpUrl}
        errorMessage={errors.rtmpUrl}
      />
      <div className="flex gap-4">
        <Button color="primary" onClick={handleSubmit}>
          Phát Live
        </Button>
        <Button color="secondary" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    </div>
  );
}
