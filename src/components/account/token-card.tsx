"use client";

import { lamportsToSolString } from "@/lib/utils";

import { TokenInfoWithAddress } from "@/hooks/useGetAccountTokens";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TokenCard({ token }: { token: TokenInfoWithAddress }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12">
        <AvatarImage src={token?.logoURI} alt={token?.name} />
        <AvatarFallback>
          {token?.name?.slice(0, 1)}
          {token?.name?.slice(-1)}
        </AvatarFallback>
      </Avatar>
      <div className="grid gap-1">
        <div className="text-lg font-semibold leading-none">
          {token?.name || token.info.mint}
        </div>
        <div className="text-sm text-muted-foreground">
          {`${lamportsToSolString(Number(token?.info.tokenAmount?.amount), 5)} ${token?.symbol}`}
        </div>
      </div>
    </div>
  );
}
