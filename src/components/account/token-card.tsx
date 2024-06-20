"use client";

import { CircleArrowDown } from "lucide-react";

import { lamportsToSolString } from "@/lib/utils";

import { TokenInfoWithPubkey } from "@/hooks/useGetAccountTokens";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TokenCard({ token }: { token: TokenInfoWithPubkey }) {
  return (
    <div className="grid grid-flow-col-3 items-center gap-8 border-b pb-3">
      <div className="flex items-center gap-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src={token?.logoURI} alt={token?.name} />
          <AvatarFallback>
            {token?.name?.slice(0, 1)}
            {token?.name?.slice(-1)}
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <div className="text-md font-medium leading-none">
            {token?.name || token.info.mint}
          </div>
          <div className="text-sm font-base text-muted-foreground">
            {`${lamportsToSolString(Number(token?.info.tokenAmount?.amount), 5)} ${token?.symbol}`}
          </div>
        </div>
      </div>
    </div>
  );
}
