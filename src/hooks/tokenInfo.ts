"use client";

import { useCluster } from "@/providers/cluster-provider";
import { getFullTokenInfo } from "@/utils/token-info";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function useGetFullTokenInfo(address: string, enabled: boolean = true) {
  const { cluster, endpoint } = useCluster();

  return useQuery({
    queryKey: ["getFullTokenInfo", address],
    queryFn: async () =>
      await getFullTokenInfo(new PublicKey(address), cluster, endpoint),
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
