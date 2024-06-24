"use client";

import React from "react";
import Image from "next/image";
import cloudflareLoader from "../../../imageLoader";
import noImg from "../../../public/assets/noimg.svg";
import { NonFungibleToken } from "@/types";

interface NFTGridItemProps {
  nft: NonFungibleToken;
}

const NFTGridItem: React.FC<NFTGridItemProps> = ({ nft }) => {
  const tokenImage = nft.content.links.image || noImg;

  return (
    <div className="border rounded-md p-4 shadow-sm flex flex-col items-center">
      <div className="mb-2">
        <Image
          loader={cloudflareLoader}
          src={tokenImage}
          alt={nft.content.metadata.name || "Unknown"}
          width={150}
          height={150}
          className="rounded-md"
          unoptimized
        />
      </div>
      <div className="text-center">
        {nft.content.metadata.name || "Unknown"}
      </div>
    </div>
  );
};

export default NFTGridItem;
