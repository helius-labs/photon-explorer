"use client";

import { useCluster } from "@/providers/cluster-provider";
import { getParsedTransactions } from "@/server/getParsedTransactions";
import { Cluster } from "@/utils/cluster";
import { useQuery } from "@tanstack/react-query";

export function useGetParsedTransactions(
  transactions: string[],
  enabled: boolean = true,
) {
  const { cluster } = useCluster();

  return useQuery({
    queryKey: [cluster, "getParsedTransactions", transactions],
    queryFn: async () => {
      if (cluster === Cluster.MainnetBeta || cluster === Cluster.Devnet) {
        return getParsedTransactions(transactions, cluster);
      }
      return null;
    },
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
