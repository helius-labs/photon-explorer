"use client";

import { useQuery } from "@tanstack/react-query";
import { nftsResponseSchema } from "@/schemas/nftList";
import { useCluster } from "@/providers/cluster-provider";

export function useGetAssetsByOwner(address: string, enabled: boolean = true) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, isPending, isFetching, refetch } = useQuery({
    queryKey: [endpoint, address, "getAssetsByOwner"],
    queryFn: async () => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "my-id",
          method: "getAssetsByOwner",
          params: {
            ownerAddress: address,
            page: 1,
            limit: 1000,
            displayOptions: {
              showFungible: false,
              showInscription: false,
            },
          },
        }),
      }).then((res) => res.json());

      const parsedResponse = nftsResponseSchema.parse(response);

      return parsedResponse.result.items.map((item: any) => ({
        mint: item.id,
        name: item.content?.metadata?.name ?? 'Unknown NFT',
        image: item.content?.files?.[0]?.uri ?? '/assets/nft-placeholder.png',
        compressed: item.interface === 'V1_NFT',
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
