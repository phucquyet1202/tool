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
import RegisterModal from "./registerModal";
import { useState } from "react";

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
  onLoginSuccess?: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: LoginForm) => {
    alert(`Đăng nhập thành công với email: ${data.email}`);
    // Thực hiện API call tại đây nếu cần
  };

  const handleRegisterClick = () => {
    onOpenChange(false);
    onOpenChangeRegister(true);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="md"
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex justify-center">Đăng nhập</ModalHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <Input
                {...register("email")}
                label="Email"
                variant="bordered"
                placeholder="example@gmail.com"
                type="email"
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
              />
              <Input
                {...register("password")}
                label="Mật khẩu"
                variant="bordered"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                endContent={
                  <button
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
              <span className="text-sm text-center mt-2">
                Bạn chưa có tài khoản?{" "}
                <Button
                  style={{ background: "none", border: "none" }}
                  onClick={() => handleRegisterClick()}
                  className="text-primary font-medium hover:underline"
                >
                  Đăng ký
                </Button>
              </span>
            </ModalBody>
            <ModalFooter className="flex justify-center">
              <Button color="primary" type="submit">
                Đăng nhập
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      <RegisterModal
        isOpen={isOpenRegister}
        onOpenChange={onOpenChangeRegister}
        isOpenLogin={isOpen}
        onOpenChangeLogin={onOpenChange}
      />
    </>
  );
}
