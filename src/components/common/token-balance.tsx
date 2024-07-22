import { normalizeTokenAmount } from "@/utils/common";
import { formatNumericValue } from "@/utils/numbers";
import { PublicKey } from "@solana/web3.js";
import React from "react";

import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";
import { useGetNFTsByMint } from "@/hooks/useGetNFTsByMint";
import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TokenBalance({
  mint,
  amount,
  decimals = 9,
  isReadable = false,
  isNFT = false,
}: {
  mint: PublicKey;
  amount: number;
  decimals?: number;
  isReadable?: boolean;
  isNFT?: boolean;
}) {
  const { data: tokenList } = useGetTokenListStrict();
  const token = tokenList?.find((t) => t.address === mint.toBase58());
  const DASToken = useGetTokensByMint(
    mint.toString(),
    !isNFT && token === undefined,
  );

  // Always call the hook but pass isNFT to control fetching logic
  const nftData = useGetNFTsByMint(mint.toBase58(), isNFT);

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
  } else if (nftData?.data) {
    // Handle displaying NFT data if available
    avatar = (
      <Avatar className="h-6 w-6">
        <AvatarImage src={nftData.data.image} alt={nftData.data.name} />
        <AvatarFallback>
          {nftData?.data?.name?.slice(0, 2) ?? ""}
        </AvatarFallback>
      </Avatar>
    );
  } else if (DASToken.data) {
    avatar = (
      <Avatar className="h-6 w-6">
        <AvatarImage src={DASToken.data.logoURI} alt={DASToken.data.name} />
        <AvatarFallback>
          {DASToken?.data?.name?.slice(0, 2) ?? ""}
        </AvatarFallback>
      </Avatar>
    );
  }

  const displayedAmount = isNFT
    ? null
    : isReadable
      ? amount
      : formatNumericValue(
          normalizeTokenAmount(amount, token?.decimals || decimals),
        );
  const symbol =
    isNFT && nftData?.data?.name
      ? nftData.data.name
      : token?.symbol ||
        DASToken?.data?.symbol ||
        `${mint.toString().substring(0, 3)}...${mint.toString().substring(mint.toString().length - 3)}`;

  return (
    <div className="inline-flex items-center gap-2">
      {avatar}
      <span>
        {displayedAmount} {symbol}
      </span>
    </div>
  );
}
