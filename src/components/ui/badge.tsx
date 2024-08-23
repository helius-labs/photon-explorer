import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/common";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80 cursor-default",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-default",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80 cursor-default",
        outline: "text-foreground shadow hover:bg-secondary/80 cursor-default",
        success:
          "border-transparent bg-[#25E8A3] text-green-800 shadow hover:bg-green-200 cursor-default",
        pending:
          "border-transparent bg-yellow-100 text-yellow-800 shadow hover:bg-yellow-200 cursor-default",
        verified:
          "border-transparent bg-[#D4B0FF] text-purple-900 shadow hover:bg-purple-200 cursor-default",
        
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
