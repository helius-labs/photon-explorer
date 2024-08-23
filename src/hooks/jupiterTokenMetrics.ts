"use client";

import { getTokenMetrics } from "@/server/getTokenMetrics";
import { useQuery } from "@tanstack/react-query";

export function useGetTokenMetrics(address: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["getTokenMetrics", address],
    queryFn: () => getTokenMetrics(address),
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
