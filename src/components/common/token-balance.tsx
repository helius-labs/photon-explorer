import noLogoImg from "@/../public/assets/noLogoImg.svg";
import { useCluster } from "@/providers/cluster-provider";
import { normalizeTokenAmount } from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import { formatNumericValue } from "@/utils/numbers";
import { PublicKey } from "@solana/web3.js";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";
import { useGetNFTsByMint } from "@/hooks/useGetNFTsByMint";
import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";

export function TokenBalance({
  mint,
  amount,
  decimals = 9,
  isReadable = false,
  isNFT = false,
  showChanges = false,
  isLink = false,
}: {
  mint: PublicKey;
  amount: number;
  decimals?: number;
  isReadable?: boolean;
  isNFT?: boolean;
  showChanges?: boolean;
  isLink?: boolean;
}) {
  const { data: tokenList } = useGetTokenListStrict();
  const token = tokenList?.find((t) => t.address === mint.toBase58());

  const shouldFetchDASToken = !isNFT && token === undefined;
  const DASToken = useGetTokensByMint(mint.toString(), shouldFetchDASToken);

  const shouldFetchNFT = isNFT && !token;
  const nftData = useGetNFTsByMint(mint.toBase58(), shouldFetchNFT);

  let avatarSrc = "";
  let avatarAlt = "";
  if (token) {
    avatarSrc = token.logoURI || "";
    avatarAlt = token.name || "";
  } else if (nftData?.data) {
    avatarSrc = nftData.data.image || "";
    avatarAlt = nftData.data.name || "";
  } else if (DASToken.data) {
    avatarSrc = DASToken.data.logoURI || "";
    avatarAlt = DASToken.data.name || "";
  }

  const normalizedAmount = isNFT
    ? amount
    : isReadable
      ? amount
      : normalizeTokenAmount(amount, token?.decimals || decimals);

  const displayedAmount =
    normalizedAmount !== null ? formatNumericValue(normalizedAmount) : null;

  const symbol = nftData?.data?.name
    ? nftData.data.name
    : token?.symbol ||
      DASToken?.data?.symbol ||
      `${mint.toString().substring(0, 3)}...${mint.toString().substring(mint.toString().length - 3)}`;

  const getAmountColor = () => {
    if (!showChanges || normalizedAmount === null) return "";
    return normalizedAmount > 0
      ? "text-[#06D6A0] cursor-default"
      : normalizedAmount < 0
        ? "text-[#EF476F] cursor-default"
        : "";
  };

  const getDisplayedAmount = () => {
    if (displayedAmount === null) return "";
    if (!showChanges) return displayedAmount;
    return normalizedAmount! > 0 ? `+${displayedAmount}` : displayedAmount;
  };

  const { cluster } = useCluster();
  const url = `/address/${mint}?cluster=${cluster}`;

  const content = (
    <div className="inline-flex items-center gap-2">
      {avatarSrc && (
        <Image
          loader={cloudflareLoader}
          src={avatarSrc}
          alt={avatarAlt}
          width={24}
          height={24}
          loading="eager"
          onError={(event: any) => {
            event.target.id = "noLogoImg";
            event.target.srcset = noLogoImg.src;
          }}
          className="h-6 w-6 rounded-full"
        />
      )}
      <span className={getAmountColor()}>
        {getDisplayedAmount()} {symbol}
      </span>
    </div>
  );

  if (isLink) {
    return (
      <Link href={url} className="hover:underline">
        {content}
      </Link>
    );
  }

  return content;
}
