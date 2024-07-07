import { normalizeTokenAmount } from "@/utils/common";
import { PublicKey } from "@solana/web3.js";

import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TokenBalance({
  mint,
  amount,
  decimals = 9,
}: {
  mint: PublicKey;
  amount: number;
  decimals?: number;
}) {
  const { data: tokenList } = useGetTokenListStrict();
  const token = tokenList?.find((t) => t.address === mint.toBase58());

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
        {normalizeTokenAmount(amount, token?.decimals || decimals)}{" "}
        {token && token.symbol ? token.symbol : "token(s)"}
      </span>
    </div>
  );
}
