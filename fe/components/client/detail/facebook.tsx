"use client";

import {
  Input,
  Button,
  Switch,
  Card,
  CardBody,
  Spinner,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  StartFacebookLivestream,
  StopFacebookLivestream,
} from "@/api/livestream";
import { GetUserByToken } from "@/api/user";

// 👇 Hàm kiểm tra URL hợp lệ
const isValidUrl = (url: string) => {
  try {
    new URL(url);

    return true;
  } catch {
    return false;
  }
};

// 👇 Hàm kiểm tra URL video (YouTube/Facebook)
const isVideoUrl = (url: string) => {
  if (!isValidUrl(url)) return false;
  const hostname = new URL(url).hostname.toLowerCase();

  if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
    return "youtube";
  }
  if (hostname.includes("facebook.com")) {
    return "facebook";
  }

  return false;
};

export default function LiveDetailFacebookPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State quản lý user
  const [statusFb, setStatusFb] = useState(false);

  // Fetch user info để lấy statusFb
  type UserResponse = {
    data?: {
      status_fb?: boolean;
      // add other user fields if needed
    };
    // add other response fields if needed
  };

  const {
    data: userData,
    refetch: refetchUser,
    isError,
  } = useQuery<UserResponse>({
    queryKey: ["user"],
    queryFn: GetUserByToken,
  });

  useEffect(() => {
    if (userData?.data) {
      setStatusFb(userData?.data?.status_fb ?? false);
    }
    if (isError) {
      setStatusFb(false);
    }
  }, [userData, isError]);

  const [videoUrls, setVideoUrls] = useState<string[]>([""]);
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [errors, setErrors] = useState<{
    videoUrls: string[];
    rtmpUrl: string;
  }>({
    videoUrls: [""],
    rtmpUrl: "",
  });
  const [loopPlaylist, setLoopPlaylist] = useState(true);
  const [shufflePlaylist, setShufflePlaylist] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mutation bắt đầu livestream
  const startLivestreamMutation = useMutation({
    mutationFn: StartFacebookLivestream,
    onSuccess: async () => {
      toast.success("Bắt đầu livestream thành công!");
      setStatusFb(true);
      await refetchUser(); // Gọi lại getUserByToken
      queryClient.invalidateQueries({ queryKey: ["livestreams"] });
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi bắt đầu livestream!");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  // Mutation dừng livestream
  const stopLivestreamMutation = useMutation({
    mutationFn: StopFacebookLivestream,
    onSuccess: async () => {
      toast.success("Đã dừng livestream!");
      setStatusFb(false);
      await refetchUser();
      queryClient.invalidateQueries({ queryKey: ["livestreams"] });
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi dừng livestream!");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleAddVideoUrl = () => {
    setVideoUrls([...videoUrls, ""]);
    setErrors((prev) => ({
      ...prev,
      videoUrls: [...prev.videoUrls, ""],
    }));
  };

  const handleChangeVideoUrl = (index: number, value: string) => {
    const updated = [...videoUrls];

    updated[index] = value;
    setVideoUrls(updated);
  };

  const handleRemoveVideoUrl = (index: number) => {
    if (videoUrls.length === 1) return;
    const updated = [...videoUrls];

    updated.splice(index, 1);
    setVideoUrls(updated);

    const updatedErrors = [...errors.videoUrls];

    updatedErrors.splice(index, 1);
    setErrors((prev) => ({ ...prev, videoUrls: updatedErrors }));
  };

  const handleStartLivestream = async () => {
    let valid = true;
    const newErrors = {
      videoUrls: videoUrls.map((url) => {
        if (!isValidUrl(url)) return "Link video không hợp lệ";
        const source = isVideoUrl(url);

        if (!source) return "Chỉ hỗ trợ video từ YouTube hoặc Facebook";
        if (source === "facebook" && !url.includes("public"))
          return "Link video Facebook phải ở chế độ công khai!";

        return "";
      }),
      rtmpUrl: isValidUrl(rtmpUrl) ? "" : "Link RTMP không hợp lệ",
    };

    if (newErrors.videoUrls.some((err) => err !== "")) valid = false;
    if (newErrors.rtmpUrl !== "") valid = false;

    setErrors(newErrors);

    if (valid) {
      setLoading(true);
      const payload = {
        videoUrls,
        rtmpUrl,
        loopPlaylist,
        shufflePlaylist,
      };

      startLivestreamMutation.mutate(payload);
    } else {
      toast.error("Vui lòng kiểm tra lại các trường dữ liệu!");
    }
  };

  const handleStopLivestream = async () => {
    setLoading(true);
    stopLivestreamMutation.mutate();
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <Card>
        <CardBody className="space-y-4">
          <h1 className="text-xl font-semibold text-center">
            Cấu hình Livestream Facebook
          </h1>

          {/* Video URLs */}
          {videoUrls.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                className="flex-1"
                errorMessage={errors.videoUrls[index]}
                isDisabled={statusFb}
                isInvalid={!!errors.videoUrls[index]}
                label={`Video URL #${index + 1}`}
                placeholder="Nhập link video Facebook hoặc YouTube"
                value={url}
                onChange={(e) => handleChangeVideoUrl(index, e.target.value)}
              />
              {videoUrls.length > 1 && !statusFb && (
                <Button
                  isIconOnly
                  color="danger"
                  size="sm"
                  onClick={() => handleRemoveVideoUrl(index)}
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
          {!statusFb && (
            <Button
              color="primary"
              startContent={<PlusIcon className="w-4 h-4" />}
              variant="flat"
              onClick={handleAddVideoUrl}
            >
              Thêm Video URL
            </Button>
          )}

          {/* RTMP URL */}
          <Input
            errorMessage={errors.rtmpUrl}
            isDisabled={statusFb}
            isInvalid={!!errors.rtmpUrl}
            label="RTMP Output"
            placeholder="Nhập link RTMP output"
            value={rtmpUrl}
            onChange={(e) => setRtmpUrl(e.target.value)}
          />

          {/* Switches */}
          <div className="flex justify-between">
            <Switch
              color="primary"
              isDisabled={statusFb}
              isSelected={loopPlaylist}
              onValueChange={setLoopPlaylist}
            >
              Lặp lại playlist
            </Switch>
            <Switch
              color="primary"
              isDisabled={statusFb}
              isSelected={shufflePlaylist}
              onValueChange={setShufflePlaylist}
            >
              Phát ngẫu nhiên
            </Switch>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-center mt-2">
            {!statusFb ? (
              <Button
                color="primary"
                isDisabled={loading}
                onClick={handleStartLivestream}
              >
                {loading ? <Spinner size="sm" /> : "Phát Live"}
              </Button>
            ) : (
              <Button
                color="danger"
                isDisabled={loading}
                onClick={handleStopLivestream}
              >
                {loading ? <Spinner size="sm" /> : "Dừng Live"}
              </Button>
            )}
            <Button color="secondary" onClick={() => router.back()}>
              Quay lại
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
