"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface AccountTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  address: string;
}

export function AccountTabs({
  address,
  className,
  ...props
}: AccountTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Tokens",
      href: `/address/${address}`,
    },
    {
      name: "NFTs",
      href: `/address/${address}/nfts`,
    },
    {
      name: "History",
      href: `/address/${address}/history`,
    },
  ];

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div className={cn("mb-4 flex items-center", className)} {...props}>
          {tabs.map((tab, index) => (
            <Link
              href={tab.href}
              key={tab.href}
              className={cn(
                "flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
                pathname === tab.href
                  ? "bg-muted font-medium text-primary"
                  : "text-muted-foreground",
              )}
            >
              {tab.name}
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
