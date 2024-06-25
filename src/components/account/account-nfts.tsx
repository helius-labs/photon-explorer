"use client";

import React, { useState } from "react";
import "@/styles/styles.css";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGetAssetsByOwner } from "@/hooks/useGetAssetsByOwner";
import { DAS } from "@/types/helius-sdk/das-types";
import { NFTGridTable } from "@/components/data-table/data-table-grid";
import { ColumnDef } from "@tanstack/react-table";

export default function AccountNFTs({ address }: { address: string }) {
  const [showNonVerified, setShowNonVerified] = useState(false);

  const {
    nonFungibleTokens,
    isLoading,
    isError,
  } = useGetAssetsByOwner(address);

  const verifiedNfts = nonFungibleTokens.filter((nft) => {
    return nft.creators?.some((creator) => creator.verified);
  });

  const nonVerifiedNfts = nonFungibleTokens.filter((nft) => {
    return !nft.creators?.some((creator) => creator.verified);
  });

  const displayedNfts = showNonVerified ? nonVerifiedNfts : verifiedNfts;

  const totalVerifiedValue = verifiedNfts.reduce((acc, nft) => {
    if (nft.content?.metadata?.attributes) {
      const valueAttribute = nft.content.metadata.attributes.find(attr => attr.trait_type.toLowerCase() === "floor price");
      const value = valueAttribute ? parseFloat(valueAttribute.value) : 0;
      return acc + value;
    }
    return acc;
  }, 0);

  const columns: ColumnDef<typeof nonFungibleTokens[0]>[] = [
    {
      header: 'Image',
      accessorKey: 'content.links.image',
    },
    {
      header: 'Name',
      accessorKey: 'content.metadata.name',
    },
  ];

  return (
    <Card className="col-span-12 border shadow">
      <CardContent className="flex flex-col pt-6 pb-4 gap-4">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(20)].map((_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-md" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-red-500">Failed to load</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-4 text-lg font-medium">
                <span>Total NFTs: {nonFungibleTokens.length}</span>
                <span>Total Value: {totalVerifiedValue.toFixed(2)} SOL</span>
              </div>
              <div className="flex items-center space-x-2">
                <Label>Show Non-Verified Collections</Label>
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
