import { normalizeTokenAmount } from "@/utils/common";
import { PublicKey } from "@solana/web3.js";

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
  amount: number;
  mint: PublicKey;
  decimals?: number;
  maximumFractionDigits?: number;
}) {
  const tokenList = useGetTokenListStrict();
  const { data: accountInfo } = useGetAccountInfo(mint.toBase58());

  // First check if the token is in the jupiter token strict list
  let token: TokenInfo | undefined = tokenList.data?.find(
    (token) => token.address === mint.toString(),
  );

  // If the token is not in the jupiter token strict list, get the token
  // info from the account info
  if (
    tokenList.data &&
    !token &&
    accountInfo &&
    accountInfo.value &&
    "parsed" in accountInfo.value?.data
  ) {
    token = {
      name: accountInfo.value?.data.parsed.name,
      symbol: accountInfo.value?.data.parsed.symbol,
      logoURI: accountInfo.value?.data.parsed.info.logoURI,
    };
  }

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
