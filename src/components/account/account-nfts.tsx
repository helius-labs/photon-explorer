"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useHeliusNFTs } from "@/hooks/useHeliusNFTs"; // Adjust the import path as needed

type NFT = {
  mint: string;
  name: string;
  image: string;
  compressed: boolean;
};

export default function AccountNFTs({ address }: { address: string }) {
  const { data: nfts, isLoading, isError } = useHeliusNFTs(address);
  const [showCompressed, setShowCompressed] = useState(false);

  const regularNfts = nfts?.filter(nft => !nft.compressed) ?? [];
  const compressedNfts = nfts?.filter(nft => nft.compressed) ?? [];

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
            <div className="flex items-center mb-4">
              <Label className="mr-2">Show Compressed NFTs</Label>
              <Switch
                checked={showCompressed}
                onCheckedChange={() => setShowCompressed((prev) => !prev)}
              />
            </div>
            {showCompressed ? (
              <>
                {compressedNfts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4 max-h-md overflow-y-auto">
                    {compressedNfts.map((nft) => (
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
                  <p>No Compressed NFTs found</p>
                )}
              </>
            ) : (
              <>
                {regularNfts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4 max-h-md overflow-y-auto">
                    {regularNfts.map((nft) => (
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
                  <p>No Regular NFTs found</p>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
