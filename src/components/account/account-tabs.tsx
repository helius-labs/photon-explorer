"use client";

import React from "react";
import Link from "@/components/ui/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/common";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCluster } from "@/providers/cluster-provider";

interface AccountTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  address: string;
}

export function AccountTabs({
  address,
  className,
  ...props
}: AccountTabsProps) {
  const pathname = usePathname();
  const { cluster } = useCluster();

  const tabs = [
    {
      name: "Tokens",
      href: `/address/${address}`,
    },
    {
      name: "History",
      href: `/address/${address}/history`,
    },
  ];

  // Only include the NFTs tab if the cluster is not localnet or testnet
  if (cluster !== "localnet" && cluster !== "testnet") {
    tabs.splice(1, 0, {
      name: "NFTs",
      href: `/address/${address}/nfts`,
    });
  }

  // Add the "Compressed Accounts" tab if the pathname includes "compressed-accounts"
  if (pathname.includes("compressed-accounts")) {
    tabs.push({
      name: "Compressed Accounts",
      href: `/address/${address}/compressed-accounts`,
    });
  }

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div className={cn("mb-4 flex items-center space-x-2 md:space-x-4 overflow-x-auto", className)} {...props}>
          {tabs.map((tab) => (
            <Link
              href={tab.href}
              key={tab.href}
              className={cn(
                "flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary whitespace-nowrap",
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
