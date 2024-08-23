"use client";

import React, { useState } from "react";
import { NFT } from "@/types/nft";
import { NFTMedia } from "./nft-media";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";

interface NFTGridItemProps {
  nft: NFT;
  onQuickView: (nftData: NFT) => void;
}

export function NFTGridItem({ nft, onQuickView }: NFTGridItemProps) {
  const [isLoading, setIsLoading] = useState(true);
  const maxLength = 16;

  const truncateName = (name: string) => {
    if (name.length > maxLength) {
      return name.slice(0, maxLength) + '...';
    }
    return name;
  };

  return (
    <div className="group relative flex flex-col items-center rounded-lg border shadow-lg">
      <div className="h-50 relative w-full">
        {isLoading && (
          <Skeleton className="absolute h-full w-full rounded-md" />
        )}
        <NFTMedia
          nft={nft}
          className="max-h-48 min-h-48 w-full rounded-lg"
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
          <Button onClick={() => onQuickView(nft)} className="text-white">
            Quick View
          </Button>
        </div>
      </div>
      <div className="mt-4 px-4 text-center">
        <p className="text-lg font-semibold mb-4 truncate" title={nft.name}>
          {truncateName(nft.name || "Unknown")}
        </p>
      </div>
    </div>
  );
}
