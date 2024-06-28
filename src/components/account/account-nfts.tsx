"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGetAssetsByOwner } from "@/hooks/useGetAssetsByOwner";
import { NFTGridTable } from "@/components/data-table/data-table-nft-grid";
import { ColumnDef } from "@tanstack/react-table";
import { useCluster } from "@/providers/cluster-provider";
import { Cluster } from "@/utils/cluster";

export default function AccountNFTs({ address }: { address: string }) {
  const [showNonVerified, setShowNonVerified] = useState(false);
  const { cluster } = useCluster();
  const router = useRouter();

  const {
    verifiedNfts,
    nonVerifiedNfts,
    totalNftValue,
    isLoading,
    isError,
    refetch,
  } = useGetAssetsByOwner(address, 1, cluster !== Cluster.Localnet && cluster !== Cluster.Testnet);

  // Redirect to tokens page if on localnet or testnet
  useEffect(() => {
    if (cluster === Cluster.Localnet || cluster === Cluster.Testnet) {
      router.push(`/account/${address}`);
    } else {
      refetch();
    }
  }, [cluster, address, router, refetch]);

  const displayedNfts = showNonVerified ? nonVerifiedNfts : verifiedNfts;

  const columns: ColumnDef<typeof displayedNfts[0]>[] = [
    {
      header: 'Image',
      accessorKey: 'content.links.image',
    },
    {
      header: 'Name',
      accessorKey: 'content.metadata.name',
    },
    {
      header: 'Price (SOL)',
      accessorKey: 'token_info.price_info.price_per_token',
      cell: ({ getValue }) => {
        const price = getValue<number>();
        return price ? price.toFixed(2) : 'N/A';
      },
    },
  ];

  if (isError || displayedNfts.length === 0)
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
    <Card className="col-span-12 shadow mb-10">
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
                <span>Total NFTs: {displayedNfts.length}</span>
                <span>Total Floor Value: {totalNftValue.toFixed(2)} SOL</span>
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
