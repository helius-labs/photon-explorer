"use client";

import { useQuery } from "@tanstack/react-query";
import { useCluster } from "@/providers/cluster-provider";
import { searchAssetsSchema } from "@/schemas/searchAssets";

export interface FungibleToken {
    mint: string;
    name: string;
    image: string;
    symbol: string;
    price: number;
    value: number;
  }

  export function useSearchAssets(address: string, enabled: boolean = true) {
    const { endpoint } = useCluster();
  
    const { data, error, isLoading, isPending, isFetching, refetch } = useQuery<FungibleToken[]>({
      queryKey: [endpoint, address, "searchAssets"],
      queryFn: async (): Promise<FungibleToken[]> => {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "1",
            method: "searchAssets",
            params: {
              ownerAddress: address,
              tokenType: "all",
              displayOptions: {
                showNativeBalance: true,
                showInscription: true,
                showCollectionMetadata: true,
              },
            },
          }),
        });
  
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
  
        const parsedResponse = searchAssetsSchema.parse(await response.json());
        return parsedResponse.result.items.map((item): FungibleToken => ({
          mint: item.id,
          name: item.content?.metadata?.name ?? 'Unknown NFT',
          image: item.content?.links?.image ?? '/assets/nft-placeholder.png',
          symbol: item.token_info?.symbol ?? 'N/A',
          price: item.token_info?.price_info?.price_per_token ?? 0,
          value: item.token_info?.price_info?.total_price ?? 0,
        }));
      },
      enabled,
    });
  
    return {
      data,
      isLoading,
      isPending,
      isFetching,
      isError: error,
      refetch,
    };
  }