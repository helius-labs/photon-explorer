"use client";

import { cn } from "@/lib/utils";
import Link from "@/components/ui/link";
import Image from "next/image";
import LogoBlack from "../../public/assets/logo-text-black.svg";
import LogoWhite from "../../public/assets/logo-text-white.svg";
import { useThemeWithMounted } from "@/hooks/useThemeWithMounted";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const { theme, mounted } = useThemeWithMounted();

  if (!mounted) return null;

  const Logo = theme === 'dark' ? LogoWhite : LogoBlack;

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
        <Image alt="Solana Explorer" height={38} src={Logo} width={150} />
      </Link>
    </nav>
  );
}
