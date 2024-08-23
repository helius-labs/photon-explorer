"use client";

import { cn } from "@/utils/common";
import Image from "next/image";
import { usePathname } from "next/navigation";

import Link from "@/components/ui/link";

import xrayIcon from "/public/assets/xrayIcon.svg";
import xrayLogo2 from "/public/assets/xrayLogo2.svg";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-semibold md:text-base"
      >
        {!isHomePage && (
          <>
            {/* Desktop logos */}
            <Image
              className="hidden h-6 w-full dark:hidden md:block"
              alt="XRAY logo"
              width={0}
              height={0}
              priority
              src={xrayLogo2}
            />
            <Image
              className="hidden h-6 w-full md:dark:block"
              alt="XRAY logo"
              width={0}
              height={0}
              priority
              src={xrayLogo2}
            />
            {/* Mobile logos */}
            <Image
              className="block h-8 w-full dark:hidden md:hidden"
              alt="XRAY logo"
              width={0}
              height={0}
              priority
              src={xrayIcon}
            />
            <Image
              className="hidden h-8 w-full dark:block md:hidden md:dark:hidden"
              alt="XRAY logo"
              width={0}
              height={0}
              priority
              src={xrayIcon}
            />
          </>
        )}
      </Link>
    </nav>
  );
}
