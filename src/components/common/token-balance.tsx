import noLogoImg from "@/../public/assets/noLogoImg.svg";
import { useCluster } from "@/providers/cluster-provider";
import { getHistoricalSolPrice } from "@/server/getHistoricalSolPrice";
import { normalizeTokenAmount } from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import { formatNumericValue } from "@/utils/numbers";
import { PublicKey } from "@solana/web3.js";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

import { useGetTokenListVerified } from "@/hooks/jupiterTokenList";
import { useGetNFTsByMint } from "@/hooks/useGetNFTsByMint";
import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";

interface TokenBalanceProps {
  mint: PublicKey;
  amount: number;
  decimals?: number;
  isReadable?: boolean;
  isNFT?: boolean;
  showChanges?: boolean;
  isLink?: boolean;
  showPrice?: boolean;
  timestamp?: number;
}

export function TokenBalance({
  mint,
  amount,
  decimals = 9,
  isReadable = false,
  isNFT = false,
  showChanges = false,
  isLink = false,
  showPrice = false,
  timestamp,
}: TokenBalanceProps) {
  const { data: tokenList, isLoading: isTokenListLoading } =
    useGetTokenListVerified();
  const token = useMemo(
    () => tokenList?.find((t) => t.address === mint.toBase58()),
    [tokenList, mint],
  );

  const shouldFetchDASToken = !isNFT && !token;
  const { data: DASToken, isLoading: isDASTokenLoading } = useGetTokensByMint(
    mint.toString(),
    shouldFetchDASToken,
  );

  const [nftData, setNftData] = useState<any>(null);
  const [isNFTLoading, setIsNFTLoading] = useState(false);

  const shouldFetchNFT = isNFT && !token;

  const { data: fetchedNFTData, isLoading: isNFTFetching } = useGetNFTsByMint(
    mint.toBase58(),
    shouldFetchNFT,
  );

  useEffect(() => {
    if (shouldFetchNFT) {
      setIsNFTLoading(true);
      if (fetchedNFTData) {
        setNftData(fetchedNFTData);
        setIsNFTLoading(false);
      }
    }
  }, [shouldFetchNFT, fetchedNFTData]);

  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [isSOLPriceLoading, setIsSOLPriceLoading] = useState(false);

  const isSOL =
    mint.toString() === "So11111111111111111111111111111111111111112";

  useEffect(() => {
    if (showPrice && isSOL && timestamp) {
      setIsSOLPriceLoading(true);
      getHistoricalSolPrice(timestamp)
        .then((price) => setSolPrice(price))
        .catch((error) => console.error("Error fetching SOL price:", error))
        .finally(() => setIsSOLPriceLoading(false));
    }
  }, [showPrice, isSOL, timestamp]);

  const avatarSrc = token?.logoURI || nftData?.image || DASToken?.logoURI || "";
  const avatarAlt = token?.name || nftData?.name || DASToken?.name || "";

  const normalizedAmount = useMemo(
    () =>
      isNFT
        ? amount
        : isReadable
          ? amount
          : normalizeTokenAmount(amount, token?.decimals || decimals),
    [isNFT, isReadable, amount, token?.decimals, decimals],
  );

  const displayedAmount =
    normalizedAmount !== null ? formatNumericValue(normalizedAmount) : null;

  const symbol = useMemo(() => {
    if (nftData?.name) return nftData.name;
    if (token?.symbol) return token.symbol;
    if (DASToken?.symbol) return DASToken.symbol;
    return isNFTLoading
      ? "Loading..."
      : `${mint.toString().substring(0, 3)}...${mint.toString().substring(mint.toString().length - 3)}`;
  }, [nftData, token, DASToken, isNFTLoading, mint]);

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

  const totalValue = useMemo(
    () =>
      solPrice !== null && normalizedAmount !== null
        ? formatNumericValue(solPrice * normalizedAmount)
        : null,
    [solPrice, normalizedAmount],
  );

  if (
    isTokenListLoading ||
    isDASTokenLoading ||
    isNFTLoading ||
    isSOLPriceLoading
  ) {
    return <div>Loading...</div>;
  }

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
          onError={(event: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const target = event.target as HTMLImageElement;
            target.id = "noLogoImg";
            target.srcset = noLogoImg.src;
          }}
          className="h-6 w-6 rounded-full"
        />
      )}
      <span className={getAmountColor()}>
        {getDisplayedAmount()} {symbol}
        {showPrice && isSOL && totalValue !== null && (
          <span className="ml-2 text-gray-500">(${totalValue})</span>
        )}
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
