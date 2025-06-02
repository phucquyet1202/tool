"use client";
import React from "react";
import { Button } from "@nextui-org/react";
import { useDisclosure } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";

import LoginModal from "../auth/loginModal";
import RegisterModal from "../auth/registerModal";

import { GetUserByToken, LogoutUser } from "@/api/user";
import { toast } from "react-toastify";

const ButtonLoginAndregister = () => {
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

  // Lấy user nếu đã đăng nhập
  const { data: userData, isLoading } = useQuery({
    queryKey: ["user-token"],
    queryFn: GetUserByToken,
    retry: false,
  });
  const QueryClient = useQueryClient();
  // Mutation để logout
  const logoutMutation = useMutation({
    mutationFn: LogoutUser,
    onSuccess: () => {
      QueryClient.invalidateQueries({ queryKey: ["user-token"] });
      toast.success("Đăng xuất thành công!");
      onChangeLogin();
    },
  });

  if (isLoading) return null;

  // Nếu có user
  if (userData?.data) {
    const user = userData.data;
    return (
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button className="text-sm bg-default-100" variant="flat">
            {user?.data?.name}
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="User Actions" variant="flat">
          <DropdownItem key="profile">Thông tin tài khoản</DropdownItem>
          <DropdownItem
            key="logout"
            className="text-danger"
            color="danger"
            onClick={() => logoutMutation.mutate()}
          >
            Đăng xuất
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }

  // Nếu chưa có user
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
        className="text-sm font-normal text-default-600 bg-default-100"
        variant="flat"
        onClick={onOpenLogin}
      >
        Đăng nhập
      </Button>
      <LoginModal
        isOpen={isOpenLogin}
        isOpenRegister={isOpenRegister}
        onOpenChange={onChangeLogin}
        onOpenChangeRegister={onChangeRegister}
      />
      <RegisterModal
        isOpen={isOpenRegister}
        isOpenLogin={isOpenLogin}
        onOpenChange={onChangeRegister}
        onOpenChangeLogin={onChangeLogin}
      />
    </>
  );
};

export default ButtonLoginAndregister;
