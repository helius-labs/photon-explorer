"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGetAssetsByOwner } from "@/hooks/useGetAssetsByOwner";

export default function AccountNFTs({ address }: { address: string }) {
  const { data: nfts, isLoading, isError } = useGetAssetsByOwner(address);
  const [showVerified, setShowVerified] = useState(false);

  const verifiedNfts = nfts?.filter(nft => nft.verifiedCollection) ?? [];
  const nonVerifiedNfts = nfts?.filter(nft => !nft.verifiedCollection) ?? [];

  const displayedNfts = showVerified ? verifiedNfts : nonVerifiedNfts;

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
          <div className="text-red-500">{}</div>
        ) : (
          <>
            <div className="flex items-center mb-4 space-x-4">
              <div className="flex items-center">
                <Label className="mr-2">Show Verified Collections</Label>
                <Switch
                  checked={showVerified}
                  onCheckedChange={() => setShowVerified((prev) => !prev)}
                />
              </div>
            </div>
            {displayedNfts.length > 0 ? (
              <div className="grid grid-cols-3 gap-4 max-h-md overflow-y-auto">
                {displayedNfts.map((nft) => (
                  <div key={nft.mint} className="flex flex-col items-center">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="h-40 w-40 object-cover rounded-lg"
                    />
                    <p className="text-center text-sm mt-2">{nft.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No NFTs found</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
