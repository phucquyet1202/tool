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
import { toast } from "react-toastify";

import { RegisterUser } from "@/api/user";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

const schema = yup.object().shape({
  name: yup
    .string()
    .min(2, "Tên tối thiểu 2 ký tự")
    .required("Bắt buộc nhập tên"),
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Bắt buộc nhập email"),
  password: yup
    .string()
    .min(6, "Mật khẩu tối thiểu 6 ký tự")
    .required("Bắt buộc nhập mật khẩu"),
});

export default function RegisterModal({
  isOpen,
  onOpenChange,
  // isOpenLogin,
  onOpenChangeLogin,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isOpenLogin: boolean;
  onOpenChangeLogin: (open: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: yupResolver(schema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();
  const registerMutation = useMutation({
    mutationFn: RegisterUser,
    onSuccess: async (success) => {
      toast.success(success.data?.data?.message || "Đăng ký thành công!");
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      onOpenChange(false);
      onOpenChangeLogin(true); // mở modal đăng nhập sau khi đăng ký thành công
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
    },
  });
  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
    onOpenChange(false);
  };

  const handleLoginClick = () => {
    onOpenChange(false);
    onOpenChangeLogin(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      size="md"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalHeader className="flex justify-center">Đăng ký</ModalHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Input
              {...register("name")}
              className="mt-2"
              errorMessage={errors.name?.message}
              isInvalid={!!errors.name}
              label="Tên"
              placeholder="Tên của bạn"
              variant="bordered"
            />
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
              Bạn đã có tài khoản?{" "}
              <Button
                className="text-primary font-medium hover:underline"
                style={{ background: "none", border: "none" }}
                onClick={() => handleLoginClick()}
              >
                Đăng nhập
              </Button>
            </span>
          </ModalBody>
          <ModalFooter className="flex justify-center">
            <Button color="primary" type="submit">
              Đăng ký
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
