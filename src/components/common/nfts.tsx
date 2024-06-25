"use client";

import React from "react";
import Image from "next/image";
import cloudflareLoader from "../../../imageLoader";
import noImg from "../../../public/assets/noimg.svg";
import { DAS } from "@/types/helius-sdk/das-types";

interface NFTGridItemProps {
  nft: DAS.GetAssetResponse;
}
export function NFTGridItem({ nft }: NFTGridItemProps) {
  const tokenImage = nft.content?.links?.image || noImg;

  return (
    <div className="border-none shadow-sm flex flex-col items-center">
      <Image
        loader={cloudflareLoader}
        src={tokenImage}
        alt={nft.content?.metadata.name || "Unknown"}
        width={300}
        height={300}
        className="rounded-md w-full"
        unoptimized
      />
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">{nft.content?.metadata.name || "Unknown"}</p>
      </div>
    </div>
  );
}
