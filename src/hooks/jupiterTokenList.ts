"use client";

import { useQuery } from "@tanstack/react-query";

import { tokenListSchema } from "@/schemas/tokenList";

export function useGetTokenListVerified(enabled: boolean = true) {
  return useQuery({
    queryKey: ["getTokenListVerified"],
    queryFn: async () => {
      const response = await fetch("/api/jupiter-tokens-verified");

      const data = await response.json();

      return tokenListSchema.parse(data);
    },
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
