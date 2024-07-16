import { normalizeTokenAmount } from "@/utils/common";
import { PublicKey } from "@solana/web3.js";

import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TokenBalance({
  mint,
  amount,
  decimals = 9,
  isReadable = false, // Step 1: Add isReadable parameter
}: {
  mint: PublicKey;
  amount: number;
  decimals?: number;
  isReadable?: boolean; // Include the new parameter in the function signature
}) {
  const { data: tokenList } = useGetTokenListStrict();
  const token = tokenList?.find((t) => t.address === mint.toBase58());

  // console.log(
  //   "In token balance:/n",
  //   "mint:",
  //   mint.toBase58(),
  //   "/n amount:",
  //   amount,
  //   "/n decimals:",
  //   decimals,
  // );

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

  // Step 2 & 3: Adjust the displayed amount based on isReadable
  const displayedAmount = isReadable
    ? amount
    : normalizeTokenAmount(amount, token?.decimals || decimals);
  const symbol = token && token.symbol ? token.symbol : "token(s)";

  return (
    <div className="inline-flex items-center gap-2">
      {avatar}
      <span>
        {displayedAmount} {symbol}
      </span>
    </div>
  );
}
