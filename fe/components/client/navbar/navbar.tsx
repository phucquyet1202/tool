import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import NextLink from "next/link";

import ButtonLoginAndregister from "./buttonLogin&register";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import NavLink from "@/components/private-route";

export const Navbar = () => {
  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      {/* Logo + NavItems (desktop) */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <p className="font-bold text-inherit">ACME</p>
          </NextLink>
        </NavbarBrand>

        <ul className="hidden md:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NavLink href={item.href} label={item.label} />
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      {/* Right icons + login/register (desktop) */}
      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <Link
            isExternal
            aria-label="Twitter"
            href={siteConfig.links.twitter}
          />
          <Link
            isExternal
            aria-label="Discord"
            href={siteConfig.links.discord}
          />
          <Link isExternal aria-label="Github" href={siteConfig.links.github} />
          <ThemeSwitch />
        </NavbarItem>

        <NavbarItem className="hidden md:flex">
          <ButtonLoginAndregister />
        </NavbarItem>
      </NavbarContent>

      {/* Mobile menu toggle */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal aria-label="Github" href={siteConfig.links.github} />
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      {/* Mobile menu content */}
      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.href}-${index}`}>
              <NavLink href={item.href} label={item.label} />
            </NavbarMenuItem>
          ))}

          {/* Thêm 2 nút đăng nhập / đăng ký ở dưới */}
          <div className="mt-4 flex flex-col gap-2">
            <ButtonLoginAndregister />
          </div>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
