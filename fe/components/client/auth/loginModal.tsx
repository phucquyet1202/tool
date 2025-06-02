// components/LoginModal.tsx
"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@nextui-org/shared-icons";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify"; // bạn cần cài toastify và cấu hình nó ở _app.tsx

import RegisterModal from "./registerModal";

import { LoginUser } from "@/api/user";

interface LoginForm {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Bắt buộc nhập email"),
  password: yup
    .string()
    .min(6, "Mật khẩu tối thiểu 6 ký tự")
    .required("Bắt buộc nhập mật khẩu"),
});

export default function LoginModal({
  isOpen,
  onOpenChange,
  isOpenRegister,
  onOpenChangeRegister,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isOpenRegister: boolean;
  onOpenChangeRegister: (open: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: LoginUser,
    onSuccess: async () => {
      toast.success("Đăng nhập thành công!");
      await queryClient.invalidateQueries({ queryKey: ["user-token"] });
      onOpenChange(false); // đóng modal
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại!");
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const handleRegisterClick = () => {
    onOpenChange(false);
    onOpenChangeRegister(true);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        placement="center"
        size="md"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <ModalHeader className="flex justify-center">Đăng nhập</ModalHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <Input
                {...register("email")}
                errorMessage={errors.email?.message}
                isInvalid={!!errors.email}
                label="Email"
                placeholder="example@gmail.com"
                type="email"
                variant="bordered"
              />
              <Input
                {...register("password")}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                errorMessage={errors.password?.message}
                isInvalid={!!errors.password}
                label="Mật khẩu"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                variant="bordered"
              />
              <span className="text-sm text-center mt-2">
                Bạn chưa có tài khoản?{" "}
                <Button
                  className="text-primary font-medium hover:underline"
                  style={{ background: "none", border: "none" }}
                  onClick={handleRegisterClick}
                >
                  Đăng ký
                </Button>
              </span>
            </ModalBody>
            <ModalFooter className="flex justify-center">
              <Button
                color="primary"
                isLoading={loginMutation.isPending}
                type="submit"
              >
                Đăng nhập
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <RegisterModal
        isOpen={isOpenRegister}
        isOpenLogin={isOpen}
        onOpenChange={onOpenChangeRegister}
        onOpenChangeLogin={onOpenChange}
      />
    </>
  );
}
