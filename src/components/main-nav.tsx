import { SquareX } from "lucide-react";

import { cn } from "@/lib/utils";

import Link from "@/components/ui/link";

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
        <SquareX className="h-6 w-6" />
        <span>XRAY</span>
      </Link>
    </nav>
  );
}
