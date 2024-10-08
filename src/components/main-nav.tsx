import Link from "@/components/ui/link";
import { cn } from "@/utils/common";
import { CircleDotDashed } from "lucide-react";

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
        <CircleDotDashed className="h-6 w-6" />
        <span>Photon</span>
      </Link>
    </nav>
  );
}
