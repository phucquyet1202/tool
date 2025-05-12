"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useDisclosure, Link } from "@nextui-org/react";
import LoginModal from "@/components/client/auth/loginModal";
import NextLink from "next/link";
import clsx from "clsx";
import { link as linkStyles } from "@heroui/theme";

interface NavLinkProps {
  label: string;
  href: string;
}

export default function NavLink({ label, href }: NavLinkProps) {
  const { user, refetchUser } = useAuth();
  const router = useRouter();

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

  const isPublic = href === "/";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isPublic && !user) {
      onOpenLogin();
    } else {
      router.push(href);
    }
  };

  return (
    <>
      <NextLink
        className={clsx(
          linkStyles({ color: "foreground" }),
          "data-[active=true]:text-primary data-[active=true]:font-medium"
        )}
        color="foreground"
        href={href}
        onClick={handleClick}
      >
        {label}
      </NextLink>

      <LoginModal
        isOpen={isOpenLogin}
        onOpenChange={onChangeLogin}
        isOpenRegister={isOpenRegister}
        onOpenChangeRegister={onChangeRegister}
        onLoginSuccess={() => {
          refetchUser();
          onChangeLogin();
          router.push(href);
        }}
      />
    </>
  );
}
