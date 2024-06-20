"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSearchAssets } from "@/hooks/useSearchAssets";
import cloudflareLoader from '../../../imageLoader'; // Ensure correct path

export default function AccountNFTs({ address }: { address: string }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [showNonVerified, setShowNonVerified] = useState(false);

  const { data, isLoading, isError, refetch } = useSearchAssets(address, page, limit);

  const nonFungibleTokens = data?.nonFungibleTokens || [];

  const verifiedNfts = nonFungibleTokens.filter((nft) => {
    return nft.creators.some((creator) => creator.verified);
  });

  const nonVerifiedNfts = nonFungibleTokens.filter((nft) => {
    return !nft.creators.some((creator) => creator.verified);
  });

  const displayedNfts = showNonVerified ? nonVerifiedNfts : verifiedNfts;

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
              <div className="grid grid-cols-3 gap-4 max-h-md overflow-y-auto">
                {displayedNfts.map((nft) => (
                  <div key={nft.id} className="flex flex-col items-center">
                    <Image
                      loader={cloudflareLoader}
                      src={nft.content.links.image}
                      alt={nft.content.metadata.name}
                      width={160}
                      height={160}
                      quality={90}
                      className="object-cover rounded-lg"
                    />
                    <p className="text-center text-sm mt-2">{nft.content.metadata.name}</p>
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
