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
  isOpenLogin,
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

  const onSubmit = (data: RegisterForm) => {
    alert(`Đăng ký thành công cho: ${data.name}`);
    // Thực hiện API call tại đây nếu cần
  };

  const handleLoginClick = () => {
    onOpenChange(false);
    onOpenChangeLogin(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      placement="center"
    >
      <ModalContent>
        <ModalHeader className="flex justify-center">Đăng ký</ModalHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Input
              {...register("name")}
              label="Tên"
              variant="bordered"
              placeholder="Tên của bạn"
              className="mt-2"
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
            />
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
              Bạn đã có tài khoản?{" "}
              <Button
                style={{ background: "none", border: "none" }}
                onClick={() => handleLoginClick()}
                className="text-primary font-medium hover:underline"
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
