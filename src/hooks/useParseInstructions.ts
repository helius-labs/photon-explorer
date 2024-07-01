"use client";

import { parseInstructions } from "@/server/parseInstructions";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function useParseInstructions(
  programId: PublicKey,
  ixData: string,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["parseInstructions", programId, ixData],
    queryFn: async () => {
      return parseInstructions(programId.toBase58(), ixData);
    },
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
