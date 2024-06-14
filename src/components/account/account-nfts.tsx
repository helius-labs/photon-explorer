"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type NFT = {
  mint: string;
  name: string;
  image: string;
};

export default function AccountNFTs({ address }: { address: string }) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNFTs() {
      try {
        const response = await fetch('https://mainnet.helius-rpc.com/?api-key=fdb842cc-15ee-4ecc-9618-3eb85ccb19cb', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'my-id',
            method: 'getAssetsByOwner',
            params: {
              ownerAddress: address,
              page: 1,
              limit: 1000,
              displayOptions: {
                showFungible: false,
                showInscription: false,
              }
            },
          }),
        });
        const { result } = await response.json();
        const nftsData = result.items.slice(0, 12).map((item: any) => ({
          mint: item.id,
          name: item.metadata?.name ?? 'Mad Lads #2197',
          image: item.metadata?.image ?? '/assets/nft-placeholder.png', // Ensure this path is correct
        }));
        setNfts(nftsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        setLoading(false);
      }
    }

    fetchNFTs();
  }, [address]);

  return (
    <Card className="col-span-12 border shadow">
      <CardContent className="flex flex-col pt-6 pb-4 gap-4">
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(12)].map((_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-md" />
            ))}
          </div>
        ) : nfts.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {nfts.map((nft) => (
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
      </CardContent>
    </Card>
  );
}
