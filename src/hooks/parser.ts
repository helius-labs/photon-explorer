"use client";

import { useCluster } from "@/providers/cluster-provider";
import { Cluster } from "@/utils/cluster";
import { useQuery } from "@tanstack/react-query";

import { getParsedTransactions } from "@/actions/getParsedTransactions";

export function useGetParsedTransactions(
  transactions: string[],
  enabled: boolean = true,
) {
  const { cluster } = useCluster();

  return useQuery({
    queryKey: ["parser", transactions],
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
