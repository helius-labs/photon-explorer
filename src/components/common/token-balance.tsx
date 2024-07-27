import { normalizeTokenAmount } from "@/utils/common";
import { formatNumericValue } from "@/utils/numbers";
import { PublicKey } from "@solana/web3.js";
import React, { useMemo } from "react";
import Image from "next/image";

import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";
import { useGetNFTsByMint } from "@/hooks/useGetNFTsByMint";
import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";

import cloudflareLoader from "@/utils/imageLoader";
import noLogoImg from "@/../public/assets/noLogoImg.svg";

const TokenBalance = React.memo(({
  mint,
  amount,
  decimals = 9,
  isReadable = false,
  isNFT = false,
  showChanges = false,
}: {
  mint: PublicKey;
  amount: number;
  decimals?: number;
  isReadable?: boolean;
  isNFT?: boolean;
  showChanges?: boolean;
}) => {
  const { data: tokenList } = useGetTokenListStrict();
  const token = useMemo(() => tokenList?.find((t) => t.address === mint.toBase58()), [tokenList, mint]);
  const DASToken = useGetTokensByMint(
    mint.toString(),
    !isNFT && token === undefined,
  );

  const nftData = useGetNFTsByMint(mint.toBase58(), isNFT);

  const avatarData = useMemo(() => {
    let src = "";
    let alt = "";
    if (token) {
      src = token.logoURI || "";
      alt = token.name || "";
    } else if (nftData?.data) {
      src = nftData.data.image || "";
      alt = nftData.data.name || "";
    } else if (DASToken.data) {
      src = DASToken.data.logoURI || "";
      alt = DASToken.data.name || "";
    }
    return { src, alt };
  }, [token, nftData, DASToken]);

  const normalizedAmount = useMemo(() => {
    return isNFT
      ? amount
      : isReadable
        ? amount
        : normalizeTokenAmount(amount, token?.decimals || decimals);
  }, [isNFT, isReadable, amount, token, decimals]);

  const displayedAmount = useMemo(() => {
    return normalizedAmount !== null ? formatNumericValue(normalizedAmount) : null;
  }, [normalizedAmount]);

  const symbol = useMemo(() => {
    return isNFT && nftData?.data?.name
      ? nftData.data.name
      : token?.symbol ||
        DASToken?.data?.symbol ||
        `${mint.toString().substring(0, 3)}...${mint.toString().substring(mint.toString().length - 3)}`;
  }, [isNFT, nftData, token, DASToken, mint]);

  const amountColor = useMemo(() => {
    if (!showChanges || normalizedAmount === null) return "";
    return normalizedAmount > 0
      ? "text-[#06D6A0] cursor-default"
      : normalizedAmount < 0
        ? "text-[#EF476F] cursor-default"
        : "";
  }, [showChanges, normalizedAmount]);

  const displayedAmountText = useMemo(() => {
    if (displayedAmount === null) return "";
    if (!showChanges) return displayedAmount;
    return normalizedAmount! > 0 ? `+${displayedAmount}` : displayedAmount;
  }, [showChanges, displayedAmount, normalizedAmount]);

  return (
    <div className="inline-flex items-center gap-2 truncate max-w-[250px]">
      {avatarData.src && (
        <Image
          loader={cloudflareLoader}
          src={avatarData.src}
          alt={avatarData.alt}
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
      <span className={amountColor}>
        {displayedAmountText} {symbol}
      </span>
    </div>
  );
});

// Add display name for better debugging and ESLint compliance
TokenBalance.displayName = "TokenBalance";

export default TokenBalance;
