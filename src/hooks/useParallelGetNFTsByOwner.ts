import { useCluster } from "@/providers/cluster-provider";
import { fetchPartitionedAssets } from "@/utils/fetchAssets";
import { useQuery } from "@tanstack/react-query";

export function useParallelGetNFTsByOwner(
  address: string,
  numPartitions: number = 8,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: ["getNFTsByOwner", address],
    queryFn: async () => {
      const nfts = await fetchPartitionedAssets(
        address,
        numPartitions,
        endpoint,
      );
      console.log("Fetched NFTs in hook:", nfts);
      return nfts;
    },
    enabled,
  });
}
