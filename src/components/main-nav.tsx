"use client";

import "@/styles/styles.css";
import Image from "next/image";

import { cn } from "@/lib/utils";

import Link from "@/components/ui/link";

import LogoBlack from "/public/assets/logo-text-black.svg";
import LogoWhite from "/public/assets/logo-text-white.svg";
import LogoIconBlack from "/public/assets/logoWhite.svg";
import LogoIconWhite from "/public/assets/logoBlack.svg";

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
          className="hidden md:block dark:hidden logo-container"
          alt="XRAY logo"
          width={100}
          height={100}
          priority
          unoptimized
          src={LogoBlack}
        />
        <Image
          className="hidden md:dark:block logo-container"
          alt="XRAY logo"
          width={100}
          height={100}
          priority
          unoptimized
          src={LogoWhite}
        />
        {/* Mobile logos */}
        <Image
          className="block md:hidden dark:hidden"
          alt="XRAY logo"
          width={40}
          height={40}
          priority
          unoptimized
          src={LogoIconWhite}
        />
        <Image
          className="hidden dark:block md:hidden md:dark:hidden"
          alt="XRAY logo"
          width={40}
          height={40}
          priority
          unoptimized
          src={LogoIconBlack}
        />
      </Link>
    </nav>
  );
}
