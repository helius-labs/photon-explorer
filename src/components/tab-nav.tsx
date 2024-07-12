"use client";

import { cn } from "@/utils/common";
import { usePathname } from "next/navigation";
import React from "react";

import Link from "@/components/ui/link";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export type Tab = {
  name: string;
  href: string;
};

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  tabs: Tab[];
}

export function TabNav({ tabs, className, ...props }: Props) {
  const pathname = usePathname();

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div
          className={cn(
            "mb-4 flex items-center space-x-2 overflow-x-auto md:space-x-4",
            className,
          )}
          {...props}
        >
          {tabs.map((tab) => (
            <Link
              href={tab.href}
              key={tab.href}
              className={cn(
                "flex h-7 items-center justify-center whitespace-nowrap rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
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
