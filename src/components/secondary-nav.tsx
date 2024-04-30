import Link from "@/components/ui/link";

import { cn } from "@/lib/utils";

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
        href="/about"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        About
      </Link>
    </nav>
  );
}
