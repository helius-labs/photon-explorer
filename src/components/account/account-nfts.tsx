"use client";

import React, { useState } from "react";
import "@/styles/styles.css";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGetAssetsByOwner } from "@/hooks/useGetAssetsByOwner";
import { NonFungibleToken } from "@/types";
import { NFTGridTable } from "@/components/data-table/data-table-grid";
import { ColumnDef } from "@tanstack/react-table";

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
    },
    {
      header: 'Name',
      accessorKey: 'name',
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
              <NFTGridTable columns={columns} data={displayedNfts} />
            ) : (
              <p>No NFTs found</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
