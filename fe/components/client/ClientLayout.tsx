"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDisclosure } from "@nextui-org/react";
import { usePathname, useRouter } from "next/navigation";

import LoginModal from "./auth/loginModal";

import { GetUserByToken } from "@/api/user";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname(); // 🚨 Lấy pathname
  const { data: user, isLoading } = useQuery({
    queryKey: ["user-token"],
    queryFn: GetUserByToken,
    retry: false,
  });

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

  useEffect(() => {
    if (!isLoading && !user?.data?.data) {
      if (pathname !== "/") {
        // 🚨 Chỉ redirect và mở modal nếu KHÔNG ở trang chủ
        router.push("/");
        onOpenLogin();
      }
    }
  }, [user, isLoading, pathname, router, onOpenLogin]);

  return (
    <>
      {children}
      <LoginModal
        isOpen={isOpenLogin}
        isOpenRegister={isOpenRegister}
        onOpenChange={onChangeLogin}
        onOpenChangeRegister={onChangeRegister}
      />
    </>
  );
}
