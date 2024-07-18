"use client";

import { cn } from "@/utils/common";
import Image from "next/image";

import Link from "@/components/ui/link";

import LogoBlack from "/public/assets/logo-text-black.svg";
import LogoWhite from "/public/assets/logo-text-white.svg";
import LogoIconBlack from "/public/assets/logoBlack.svg";
import LogoIconWhite from "/public/assets/logoWhite.svg";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-semibold md:text-base"
      >
        {/* Desktop logos */}
        <Image
          className="hidden h-6 w-full dark:hidden md:block"
          alt="XRAY logo"
          width={0}
          height={0}
          priority
          src={LogoBlack}
        />
        <Image
          className="hidden h-6 w-full md:dark:block"
          alt="XRAY logo"
          width={0}
          height={0}
          priority
          src={LogoWhite}
        />
        {/* Mobile logos */}
        <Image
          className="block h-10 w-full dark:hidden md:hidden"
          alt="XRAY logo"
          width={0}
          height={0}
          priority
          src={LogoIconWhite}
        />
        <Image
          className="hidden h-10 w-full dark:block md:hidden md:dark:hidden"
          alt="XRAY logo"
          width={0}
          height={0}
          priority
          src={LogoIconBlack}
        />
      </Link>
    </nav>
  );
}
