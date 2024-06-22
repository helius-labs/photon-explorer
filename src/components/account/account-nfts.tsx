"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGetAssetsByOwner } from "@/hooks/useGetAssetsByOwner";
import { NonFungibleToken } from "@/types";
import { DataTable } from "@/components/data-table/data-table";
import cloudflareLoader from "../../../imageLoader";
import { ColumnDef } from "@tanstack/react-table";

const placeholderImage = "/assets/noimg.svg"; // Add a placeholder image path

export default function AccountNFTs({ address }: { address: string }) {
  const [showNonVerified, setShowNonVerified] = useState(false);

  const { nonFungibleTokens = [], isLoading, isError } = useGetAssetsByOwner(address);

  const verifiedNfts = nonFungibleTokens.filter((nft: NonFungibleToken) => {
    return nft.creators.some((creator) => creator.verified);
  });

  const nonVerifiedNfts = nonFungibleTokens.filter((nft: NonFungibleToken) => {
    return !nft.creators.some((creator) => creator.verified);
  });

  const displayedNfts = showNonVerified ? nonVerifiedNfts : verifiedNfts;

  const columns: ColumnDef<typeof nonFungibleTokens[0]>[] = [
    {
      header: 'Image',
      accessorKey: 'image',
      cell: ({ row }) => {
        const nft = row.original;
        const tokenImage = nft.content.links.image || placeholderImage;
        return (
          <div className="flex justify-center">
            <Image
              loader={cloudflareLoader}
              src={tokenImage}
              alt={nft.content.metadata.name || "Unknown"}
              width={100}
              height={100}
              quality={90}
              priority
              unoptimized 
              className="image-responsive"
            />
          </div>
        );
      },
    },
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.content.metadata.name || "Unknown"}
        </div>
      ),
    },
  ];

  return (
    <Card className="col-span-12 border shadow">
      <CardContent className="flex flex-col pt-6 pb-4 gap-4">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(12)].map((_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-md" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-red-500">Failed to load</div>
        ) : (
          <>
            <div className="flex items-center mb-4 space-x-4">
              <div className="flex items-center">
                <Label className="mr-2">Show Non-Verified Collections</Label>
                <Switch
                  checked={showNonVerified}
                  onCheckedChange={() => setShowNonVerified((prev) => !prev)}
                />
              </div>
            </div>
            {displayedNfts.length > 0 ? (
              <DataTable columns={columns} data={displayedNfts} />
            ) : (
              <p>No NFTs found</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
