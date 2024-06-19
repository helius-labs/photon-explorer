"use client";

import { useCluster } from "@/providers/cluster-provider";
import { useQuery } from "@tanstack/react-query";

import { getAssetsByOwnerSchema } from "@/schemas/getAssetsByOwner";

export function useGetAssetsByOwner(address: string, enabled: boolean = true) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getAssetsByOwner", address],
    queryFn: async () => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
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

      const parsedResponse = getAssetsByOwnerSchema.parse(response);

      return parsedResponse.result.items.map((item) => ({
        mint: item.id,
        name: item.content?.metadata?.name ?? "Unknown NFT",
        image: item.content?.files?.[0]?.uri ?? "/assets/nft-placeholder.png",
        compressed: item.interface === "V1_NFT",
        verifiedCollection: item.creators?.some((creator) => creator.verified),
      }));
    },
    enabled,
  });
}
