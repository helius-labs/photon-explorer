import { useCluster } from "@/providers/cluster-provider";
import { getSignaturesForAddress } from "@/utils/fetchTxnSigs";
import { ConfirmedSignatureInfo } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function useGetSignaturesForAddress(
  address: string,
  limit: number = 200,
  before?: string,
  enabled: boolean = true,
  startDate?: Date,
  endDate?: Date,
) {
  const { endpoint } = useCluster();

  return useQuery<ConfirmedSignatureInfo[], Error>({
    queryKey: [
      endpoint,
      "getSignaturesForAddress",
      address,
      limit,
      before,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const signatures = await getSignaturesForAddress(
        address,
        limit,
        endpoint,
        before,
      );
      return signatures.filter((sig) => {
        const txnDate = new Date(sig.blockTime! * 1000);
        return (
          (!startDate || txnDate >= startDate) &&
          (!endDate || txnDate <= endDate)
        );
      });
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });
}
