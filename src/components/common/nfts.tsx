"use client";

import React, { useState } from "react";
import Image from "next/image";
import cloudflareLoader from "../../../imageLoader";
import noImg from "../../../public/assets/noimg.svg";
import { DAS } from "@/types/helius-sdk/das-types";
import { Skeleton } from "@/components/ui/skeleton";

interface NFTGridItemProps {
  nft: DAS.GetAssetResponse;
}

export function NFTGridItem({ nft }: NFTGridItemProps) {
  const [isLoading, setIsLoading] = useState(true);
  const tokenImage = nft.content?.links?.image || noImg;

  return (
    <div className="border shadow-lg rounded-lg flex flex-col items-center">
      <div className="relative w-full h-50">
        {isLoading && (
          <Skeleton className="w-full h-full rounded-md absolute" />
        )}
        <Image
          loader={cloudflareLoader}
          src={tokenImage}
          alt={nft.content?.metadata.name || "Unknown"}
          width={300}
          height={300}
          className="rounded-lg min-h-48 max-h-48 w-full"
          unoptimized
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </div>
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">{nft.content?.metadata.name || "Unknown"}</p>
      </div>
    </div>
  );
}
