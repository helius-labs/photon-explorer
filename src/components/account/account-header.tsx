"use client";

import Avatar from "boring-avatars";
import { MoreVertical, Star } from "lucide-react";

import { lamportsToSolString } from "@/lib/utils";

import { useGetCompressedBalanceByOwner } from "@/hooks/compression";

import Address from "@/components/common/address";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export function AccountHeader({
  address,
  accountInfo,
  compressedAccount,
}: {
  address: string;
  accountInfo: any;
  compressedAccount: any;
}) {
  const { compressedBalance } = useGetCompressedBalanceByOwner(address);

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
        {accountInfo.isLoading || compressedAccount.isLoading ? (
          <Skeleton className="h-7 w-[200px]" />
        ) : (
          <div>
            {accountInfo.data?.value || compressedAccount.data?.value ? (
              <>
                {accountInfo.data?.value &&
                  accountInfo.data?.value.lamports && (
                    <span className="text-lg text-muted-foreground">
                      {`${lamportsToSolString(
                        accountInfo.data?.value.lamports,
                        2,
                      )} SOL`}
                    </span>
                  )}
                {compressedBalance && compressedBalance.value && (
                  <span className="text-lg text-muted-foreground">
                    {` | ${lamportsToSolString(
                      compressedBalance.value,
                      2,
                    )} COMPRESSED SOL`}
                  </span>
                )}
                {compressedAccount.data?.value &&
                  compressedAccount.data?.value.lamports && (
                    <span className="text-lg text-muted-foreground">
                      {`${lamportsToSolString(
                        compressedAccount.data?.value.lamports,
                        2,
                      )} SOL`}
                    </span>
                  )}
              </>
            ) : (
              <span className="text-lg text-muted-foreground">
                Account not found
              </span>
            )}
          </div>
        )}
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
