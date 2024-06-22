"use client";

import "@/styles/styles.css";
import Image from "next/image";

import { cn } from "@/lib/utils";

import Link from "@/components/ui/link";

import LogoBlack from "/public/assets/logo-text-black.svg";
import LogoWhite from "/public/assets/logo-text-white.svg";

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
        <Image
          className="hidden dark:block logo-container"
          alt="XRAY logo"
          width={100}
          height={100}
          priority
          unoptimized
          src={LogoWhite}
        />
        <Image
          className="block dark:hidden logo-container"
          alt="XRAY logo"
          width={100}
          height={100}
          priority
          unoptimized
          src={LogoBlack}
        />
      </Link>
    </nav>
  );
}
