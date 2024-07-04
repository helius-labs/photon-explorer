"use client";

import { DAS } from "@/types/helius-sdk/das-types";
import Image from "next/image";
import React, { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import noImg from "../../../public/assets/noimg.svg";
import cloudflareLoader from "../../utils/imageLoader";

interface NFTGridItemProps {
  nft: DAS.GetAssetResponse;
}

export function NFTGridItem({ nft }: NFTGridItemProps) {
  const [isLoading, setIsLoading] = useState(true);
  const tokenImage = nft.content?.links?.image || noImg;

  return (
    <div className="flex flex-col items-center rounded-lg border shadow-lg">
      <div className="h-50 relative w-full">
        {isLoading && (
          <Skeleton className="absolute h-full w-full rounded-md" />
        )}
        <Image
          loader={cloudflareLoader}
          src={tokenImage}
          alt={nft.content?.metadata.name || "Unknown"}
          width={300}
          height={300}
          loading="eager"
          className="max-h-48 min-h-48 w-full rounded-lg"
          onLoad={() => setIsLoading(false)}
          onError={(event: any) => {
            event.target.id = "noimg";
            event.target.srcset = noImg.src;
            setIsLoading(false);
          }}
        />
      </div>
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">
          {nft.content?.metadata.name || "Unknown"}
        </p>
      </div>
    </div>
  );
}
