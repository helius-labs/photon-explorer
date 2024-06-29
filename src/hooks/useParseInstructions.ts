"use client";

import { useCluster } from "@/providers/cluster-provider";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

import { parseInstructions } from "@/actions/parseInstructions";

export function useParseInstructions(
  programId: PublicKey,
  ixData: string,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["parseInstructions", programId, ixData],
    queryFn: async () => {
      return parseInstructions(programId, ixData);
    },
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
