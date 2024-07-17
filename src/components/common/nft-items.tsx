"use client";

import noLogoImg from "@/../public/assets/noLogoImg.svg";
import { NFT } from "@/types/nft";
import cloudflareLoader from "@/utils/imageLoader";
import Image from "next/image";
import React, { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { Button } from "../ui/button";

interface NFTGridItemProps {
  nft: NFT;
  onQuickView: (nftData: NFT) => void;
}

export function NFTGridItem({ nft, onQuickView }: NFTGridItemProps) {
  const [isLoading, setIsLoading] = useState(true);
  const tokenImage = nft.image || noLogoImg;

  return (
    <div className="group relative flex flex-col items-center rounded-lg border shadow-lg">
      <div className="h-50 relative w-full">
        {isLoading && (
          <Skeleton className="absolute h-full w-full rounded-md" />
        )}
        <Image
          loader={cloudflareLoader}
          src={tokenImage}
          alt={nft.name || "Unknown"}
          width={300}
          height={300}
          loading="eager"
          className="max-h-48 min-h-48 w-full rounded-lg"
          onLoad={() => setIsLoading(false)}
          onError={(event: any) => {
            event.target.id = "noLogoImg";
            event.target.srcset = noLogoImg.src;
            setIsLoading(false);
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
          <Button onClick={() => onQuickView(nft)} className="text-white">
            Quick View
          </Button>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">{nft.name || "Unknown"}</p>
      </div>
    </div>
  );
}
