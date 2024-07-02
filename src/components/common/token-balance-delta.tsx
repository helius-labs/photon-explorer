import { PublicKey } from "@solana/web3.js";
import { BigNumber } from "bignumber.js";
import React from "react";

import { useGetFullTokenInfo } from "@/hooks/tokenInfo";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TokenBalanceDelta({
  mint,
  delta,
}: {
  mint: PublicKey;
  delta: BigNumber;
}) {
  const { data: token } = useGetFullTokenInfo(mint.toBase58());

  let avatar = <></>;
  if (token) {
    avatar = (
      <Avatar className="h-6 w-6">
        <AvatarImage src={token.logoURI} alt={token.name} />
        <AvatarFallback>
          {token.name.length > 1 ? token.name.slice(0, 1) : ""}
          {token.name.length > 2 ? token.name.slice(-1) : ""}
        </AvatarFallback>
      </Avatar>
    );
  }

  if (delta.gt(0)) {
    return (
      <div className="inline-flex items-center gap-2 text-green-400">
        {avatar}
        <span>
          +{delta.toString()}{" "}
          {token && token.symbol ? token.symbol : "token(s)"}
        </span>
      </div>
    );
  } else if (delta.lt(0)) {
    return (
      <div className="inline-flex items-center gap-2 text-red-400">
        {avatar}
        <span>
          {delta.toString()} {token && token.symbol ? token.symbol : "token(s)"}
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      {avatar}
      <span>
        {0} {token && token.symbol ? token.symbol : "token(s)"}
      </span>
    </div>
  );
}
