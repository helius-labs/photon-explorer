"use client";

import noImg from "@/../public/assets/noimg.svg";
import { DAS } from "@/types/helius-sdk/das-types";
import cloudflareLoader from "@/utils/imageLoader";
import Image from "next/image";
import React, { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";

interface NFTGridItemProps {
  nft: DAS.GetAssetResponse;
  onQuickView: (nftData: DAS.GetAssetResponse) => void;
}

export function NFTGridItem({ nft, onQuickView }: NFTGridItemProps) {
  const [isLoading, setIsLoading] = useState(true);
  const tokenImage = nft.content?.links?.image || noImg;

  return (
    <div className="group flex flex-col items-center rounded-lg border shadow-lg relative">
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
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50">
          <Button onClick={() => onQuickView(nft)} className="text-white">
            Quick View
          </Button>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">
          {nft.content?.metadata.name || "Unknown"}
        </p>
      </div>
    </div>
  );
}
