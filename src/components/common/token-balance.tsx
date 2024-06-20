import { PublicKey } from "@solana/web3.js";
import { UseQueryResult } from "@tanstack/react-query";
import React from "react";

import { normalizeTokenAmount } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TokenBalance({
  amount,
  mint,
  decimals = 9,
  maximumFractionDigits = 9,
  tokenList,
}: {
  amount: number;
  mint: PublicKey;
  decimals?: number;
  maximumFractionDigits?: number;
  tokenList: UseQueryResult<
    {
      symbol: string;
      address: string;
      chainId: number;
      decimals: number;
      name: string;
      tags: string[];
      logoURI?: string | undefined;
      extensions?:
        | {
            coingeckoId?: string | undefined;
          }
        | undefined;
    }[],
    Error
  >;
}) {
  const token = tokenList.data?.find(
    (token) => token.address === mint.toString(),
  );

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={token?.logoURI} alt={token?.name} />
        <AvatarFallback>
          {token?.name?.slice(0, 1)}
          {token?.name?.slice(-1)}
        </AvatarFallback>
      </Avatar>
      <span>
        {normalizeTokenAmount(amount, decimals)} {token && token.symbol}
      </span>
    </div>
  );
}
