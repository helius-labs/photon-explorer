import { useCluster } from "@/providers/cluster-provider";
import { getSignaturesForAddress } from "@/utils/fetchTxnSigs";
import { ConfirmedSignatureInfo } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function useGetSignaturesForAddress(
  address: string,
  limit: number = 200,
  before?: string,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();
  //console.log("FETCHING SIGNATURES:", address, limit, before, enabled);

  return useQuery<ConfirmedSignatureInfo[], Error>({
    queryKey: [endpoint, "getSignaturesForAddress", address, limit, before],
    queryFn: async () => {
      return await getSignaturesForAddress(address, limit, endpoint, before);
    },
    enabled,
    // staleTime: 1000 * 60 * 5, // 5 minutes
    // refetchInterval: 1000 * 60 * 10, // 10 minutes
  });
}
