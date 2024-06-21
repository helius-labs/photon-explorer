"use client";

import { getParsedTransactions } from "@/actions/getParsedTransactions";
import { useCluster } from "@/providers/cluster-provider";
import { useQuery } from "@tanstack/react-query";

export function useGetParsedTransactions(
  transactions: string[],
  enabled: boolean = true,
) {
  const { cluster } = useCluster();

  return useQuery({
    queryKey: ["parser", transactions],
    queryFn: async () => {
      return await getParsedTransactions(transactions, cluster);
    },
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
