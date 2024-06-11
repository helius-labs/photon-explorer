"use client";

import Avatar from "boring-avatars";
import { MoreVertical, Star } from "lucide-react";

import { lamportsToSolString } from "@/lib/utils";

import { useGetBalance } from "@/hooks/web3";

import Address from "@/components/address";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export function WalletAccountHeader({
  address,
  accountInfo,
}: {
  address: string;
  accountInfo: any;
}) {
  if (accountInfo.isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-6 w-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 mb-8">
      <Avatar
        size={80}
        name={address}
        variant="marble"
        colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
      />
      <div className="grid gap-2">
        <div className="text-3xl font-medium leading-none">
          <Address>{address}</Address>
        </div>
        <p className="text-lg text-muted-foreground">
          {`${lamportsToSolString(accountInfo.data?.value.lamports, 2)} SOL`}
        </p>
      </div>
      <div className="ml-auto font-medium self-start">
        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <Star className="h-3.5 w-3.5" />
            <span className="sr-only">Star</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  accountInfo.refetch();
                }}
              >
                Refresh
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
