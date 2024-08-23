import { useCluster } from "@/providers/cluster-provider";
import { NFT } from "@/types/nft";
import { Cluster } from "@/utils/cluster";
import {
  fetchPartitionedAssets,
  getNFTsByOwnerMetaplex,
} from "@/utils/fetchAssets";
import { useQuery } from "@tanstack/react-query";

export function useGetNFTsByOwner(
  address: string,
  numPartitions: number = 8,
  enabled: boolean = true,
) {
  const { cluster, endpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, endpoint, "getNFTsByOwner", address],
    queryFn: async () => {
      let nfts: NFT[] = [];

      if ([Cluster.MainnetBeta, Cluster.Devnet].includes(cluster)) {
        // Use Helius DAS API for Mainnet and Devnet
        nfts = await fetchPartitionedAssets(address, numPartitions, endpoint);
      } else {
        // Use Metaplex for custom, localnet, and testnet
        nfts = await getNFTsByOwnerMetaplex(address, endpoint);
      }

      nfts.sort((a, b) => (b.value || 0) - (a.value || 0));

      return nfts;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
