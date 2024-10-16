"use client";

import Link from "@/components/ui/link";
import { cn } from "@/utils/common";

export function SecondaryNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="https://www.zkcompression.com/"
        target="_blank"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Docs
      </Link>
    </nav>
  );
}
