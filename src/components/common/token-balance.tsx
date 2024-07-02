import { normalizeTokenAmount } from "@/utils/common";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";

import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";
import { useGetAccountInfo } from "@/hooks/web3";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TokenInfo {
  name: string;
  symbol: string;
  logoURI?: string;
}

export function TokenBalance({
  amount,
  mint,
  decimals = 9,
  maximumFractionDigits = 9,
}: {
  amount: BigNumber;
  mint: PublicKey;
  decimals?: number;
  maximumFractionDigits?: number;
}) {
  const tokenList = useGetTokenListStrict(true);

  let token: TokenInfo | undefined = tokenList.data?.find(
    (token) => token.address === mint.toString(),
  );

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

  return (
    <div className="inline-flex items-center gap-2">
      {avatar}
      <span>
        {amount.gt(0) && `+`}
        {normalizeTokenAmount(amount.toNumber(), decimals)}{" "}
        {token && token.symbol ? token.symbol : "token(s)"}
      </span>
    </div>
  );
}
