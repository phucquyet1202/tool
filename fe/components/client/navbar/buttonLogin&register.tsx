"use client";
import { Button } from "@heroui/button";
import React from "react";
import { useDisclosure } from "@nextui-org/react";
import LoginModal from "../auth/loginModal";
import RegisterModal from "../auth/registerModal";
type Props = {};

const ButtonLoginAndregister = (props: Props) => {
  const {
    isOpen: isOpenLogin,
    onOpen: onOpenLogin,
    onOpenChange: onChangeLogin,
  } = useDisclosure();
  const {
    isOpen: isOpenRegister,
    onOpen: onOpenRegister,
    onOpenChange: onChangeRegister,
  } = useDisclosure();

  return (
    <>
      <Button
        className="text-sm font-normal text-default-600 bg-default-100 mx-3"
        variant="flat"
        onClick={onOpenRegister}
      >
        Đăng ký
      </Button>
      <Button
        onClick={onOpenLogin}
        className="text-sm font-normal text-default-600 bg-default-100"
        variant="flat"
      >
        Đăng nhập
      </Button>
      <LoginModal
        isOpen={isOpenLogin}
        onOpenChange={onChangeLogin}
        isOpenRegister={isOpenRegister}
        onOpenChangeRegister={onChangeRegister}
      />
      <RegisterModal
        isOpen={isOpenRegister}
        onOpenChange={onChangeRegister}
        isOpenLogin={isOpenLogin}
        onOpenChangeLogin={onChangeLogin}
      />
    </>
  );
};

export default ButtonLoginAndregister;
