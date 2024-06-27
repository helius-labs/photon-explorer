"use client";

import React, { useState } from "react";
import "@/styles/styles.css";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGetAssetsByOwner } from "@/hooks/useGetAssetsByOwner";
import { NFTGridTable } from "@/components/data-table/data-table-nft-grid";
import { ColumnDef } from "@tanstack/react-table";

export default function AccountNFTs({ address }: { address: string }) {
  const [showNonVerified, setShowNonVerified] = useState(false);

  const { nonFungibleTokens, isLoading, isError } = useGetAssetsByOwner(address);

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

  if (isError)
    return (
      <Card className="col-span-12 shadow mb-10">
        <CardContent className="flex flex-col items-center pt-6 gap-4 pb-6">
          <div className="text-secondary font-semibold">Unable to fetch NFTs</div>
          <div className="text-gray-500">
            <button onClick={() => window.location.reload()} className="text-blue-500 underline">Refresh</button> the page or navigate <a href="/" className="text-blue-500 underline">home</a>.
          </div>
        </CardContent>
      </Card>
    );

  return (
    <Card className="col-span-12 shadow">
      <CardContent className="flex flex-col pt-6 pb-4 gap-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[...Array(20)].map((_, index) => (
              <Skeleton key={index} className="mt-14 h-60 md:h-40 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:space-x-4 font-medium">
                <span>Total NFTs: {nonFungibleTokens.length}</span>
                <span>Floor Value: {totalVerifiedValue.toFixed(2)} SOL</span>
              </div>
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <Label className="text-xs sm:text-sm">Show Non-Verified Collections</Label>
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
