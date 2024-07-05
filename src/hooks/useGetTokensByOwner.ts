import { useCluster } from "@/providers/cluster-provider";
import { Token } from "@/types/token";
import { Cluster } from "@/utils/cluster";
import { useQuery } from "@tanstack/react-query";

import { getTokensByOwnerCompressed } from "./useGetTokensByOwnerCompressed";
import { getTokensByOwnerDAS } from "./useGetTokensByOwnerDAS";
import { getTokensByOwnerMetaplex } from "./useGetTokensByOwnerMetaplex";

export function useGetTokensByOwner(address: string, enabled: boolean = true) {
  const { cluster, endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, endpoint, "getTokens", address],
    queryFn: async () => {
      let tokens: Token[] = [];

      if ([Cluster.MainnetBeta, Cluster.Devnet].includes(cluster)) {
        // Use Helius DAS API for Mainnet and Devnet
        tokens = await getTokensByOwnerDAS(address, 1, endpoint);
      } else {
        // Use Metaplex for custom, localnet and testnet
        tokens = await getTokensByOwnerMetaplex(address, endpoint);
      }

      // Compressed tokens are not supported on mainnet and devnet
      // Once they are supported, we can remove this conditional
      if (
        [Cluster.Custom, Cluster.Localnet, Cluster.Testnet].includes(cluster)
      ) {
        const compressed = await getTokensByOwnerCompressed(
          address,
          endpoint,
          compressionEndpoint,
        );

        tokens = tokens.concat(compressed);
      }

      return tokens;
    },
    enabled,
  });
}
