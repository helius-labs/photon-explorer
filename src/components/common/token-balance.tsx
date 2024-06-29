import { PublicKey } from "@solana/web3.js";
import { UseQueryResult } from "@tanstack/react-query";
import { CircleHelp } from "lucide-react";
import React from "react";

import { normalizeTokenAmount } from "@/utils/common";

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

  let avatar = <></>;
  if (token) {
    avatar = (
      <Avatar className="h-6 w-6">
        <AvatarImage src={token.logoURI} alt={token.name} />
        <AvatarFallback>
          {token.name.slice(0, 1)}
          {token.name.slice(-1)}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      {avatar}
      <span>
        {normalizeTokenAmount(amount, decimals)}{" "}
        {token && token.symbol ? token.symbol : "token(s)"}
      </span>
    </div>
  );
}
