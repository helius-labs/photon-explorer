"use client";

import { useCluster } from "@/providers/cluster-provider";
import { DAS } from "@/types/helius-sdk";
import { Cluster } from "@/utils/cluster";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { useGetAssetsByOwner } from "@/hooks/useGetAssetsByOwner";

import { NFTGridTable } from "@/components/data-table/data-table-nft-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

const columns: ColumnDef<DAS.GetAssetResponse>[] = [
  {
    header: "Image",
    accessorKey: "content.links.image",
  },
  {
    header: "Name",
    accessorKey: "content.metadata.name",
  },
  {
    header: "Price (SOL)",
    accessorKey: "token_info.price_info.price_per_token",
    cell: ({ getValue }) => {
      const price = getValue<number>();
      return price ? price.toFixed(2) : "N/A";
    },
  },
];

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
  } = useGetAssetsByOwner(
    address,
    1,
    cluster !== Cluster.Localnet && cluster !== Cluster.Testnet,
  );

  // Redirect to tokens page if on localnet or testnet
  useEffect(() => {
    if (cluster === Cluster.Localnet || cluster === Cluster.Testnet) {
      router.push(`/account/${address}`);
    } else {
      refetch();
    }
  }, [cluster, address, router, refetch]);

  const displayedNfts = showNonVerified ? nonVerifiedNfts : verifiedNfts;

  if (isError)
    return (
      <Card className="col-span-12 mb-10 shadow">
        <CardContent className="flex flex-col items-center gap-4 pb-6 pt-6">
          <div className="font-semibold text-secondary">
            Unable to fetch NFTs
          </div>
          <div className="text-gray-500">
            <button
              onClick={() => window.location.reload()}
              className="text-blue-500 underline"
            >
              Refresh
            </button>{" "}
            or change networks.
          </div>
        </CardContent>
      </Card>
    );

  return (
    <Card className="col-span-12 mb-10 shadow">
      <CardContent className="flex flex-col gap-4 pb-4 pt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {[...Array(12)].map((_, index) => (
              <Skeleton
                key={index}
                className="mt-14 h-60 w-full rounded-md md:h-40"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-col justify-between text-xs sm:flex-row sm:items-center sm:text-sm">
              <div className="flex flex-col font-medium sm:flex-row sm:space-x-4">
                <span>Total NFTs: {displayedNfts.length}</span>
                <span>Total Floor Value: {totalNftValue.toFixed(2)} SOL</span>
              </div>
              <div className="mt-2 flex items-center space-x-2 sm:mt-0">
                <Label className="text-xs sm:text-sm">
                  Show Non-Verified Collections
                </Label>
                <Switch
                  checked={showNonVerified}
                  onCheckedChange={() => setShowNonVerified((prev) => !prev)}
                />
              </div>
            </div>
            {displayedNfts.length > 0 ? (
              <NFTGridTable columns={columns} data={displayedNfts} />
            ) : (
              <p className="flex items-center justify-center p-6 text-lg text-muted-foreground">
                No NFTs found
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
